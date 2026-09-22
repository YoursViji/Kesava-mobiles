// Buttons that answer the moment they are pressed.
//
// The obvious way to write a button is wrong:
//   onClick={async () => { await vote({ data: { id } }); await router.invalidate() }}
// Nothing changes on screen until the server has answered AND every loader on the page has refetched — half a
// second or more — so the button feels dead, and the clicks people make in the meantime are lost. Disabling it
// while it runs makes that worse: it swallows the clicks silently.
//
// These two hooks are the answer, and every button in the app that calls a server function goes through one:
//   useAction           — the click is acknowledged instantly (`pending`), the call is guarded against double
//                         submits, failures become a message instead of a silent nothing.
//   useOptimisticAction — the same, plus the new value is on screen before the request leaves the browser, and
//                         rolls back by itself if the server refuses.
//
// Both refetch the route's loaders on success, so nothing else has to call `router.invalidate()`.

import { useOptimistic, useRef, useState, useTransition } from 'react'
import { useRouter } from '@tanstack/react-router'

function messageOf(error: unknown): string {
  const text =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : error && typeof error === 'object'
          ? String((error as { message?: unknown }).message ?? (error as { statusText?: unknown }).statusText ?? '')
          : ''
  return text.trim() || 'Something went wrong. Please try again.'
}

/**
 * Some calls report a failure in what they return instead of throwing: `authClient.signIn.email()` resolves to
 * `{ data: null, error: { message } }` for a wrong password, and a server function may return `{ error: 'That time was
 * just taken' }`. Either counts as a failure, so `onSuccess` never runs for it and `error` shows its message.
 */
function failureIn(result: unknown): string | null {
  if (!result || typeof result !== 'object' || !('error' in result)) return null
  const error = (result as { error: unknown }).error
  return error ? messageOf(error) : null
}

export interface ActionOptions<Result = unknown> {
  /** Refetch the route's loaders after the action succeeds. Default true; turn it off when nothing on the page changes. */
  refresh?: boolean
  /**
   * Runs after the action succeeded and the loaders have refetched, with what the action returned — open the record it
   * created, close a dialog, clear a form.
   */
  onSuccess?: (result: Result) => void
  /** Handle the failure yourself (a toast, say) instead of reading `error`. */
  onError?: (message: string) => void
}

export interface Action<Args extends unknown[]> {
  /** Start the action. Call it straight from onClick/onSubmit — it never returns a promise to await. */
  run: (...args: Args) => void
  /** True from the click until the server answered and the loaders refetched. Use it for the label, not for `disabled`. */
  pending: boolean
  /** The message from the last failure, or null. Render it near the button. */
  error: string | null
  /** Clear `error` (for example when the user edits the form again). */
  clearError: () => void
}

/**
 * An action with no value of its own on screen: sign out, send, delete-and-navigate, submit a form.
 *
 *   const save = useAction(addTask, { onSuccess: () => setTitle('') })
 *   <button onClick={() => save.run({ data: { title } })}>{save.pending ? 'Adding…' : 'Add task'}</button>
 *   {save.error ? <p className="text-sm text-red-600">{save.error}</p> : null}
 *
 * `onSuccess` gets what the action returned, so a form can open the record it just created:
 *
 *   const book = useAction(createBooking, { onSuccess: (booking) => navigate({ to: '/bookings/$id', params: { id: booking.id } }) })
 *
 * Clicks that arrive while it is running are ignored, so a form cannot be submitted twice — but `pending` is
 * already showing by then, so the person sees why. Never put `disabled={save.pending}` on the button as the only
 * feedback: a disabled button that looks unchanged is exactly what feels broken.
 */
export function useAction<Args extends unknown[], Result>(action: (...args: Args) => Promise<Result>, options: ActionOptions<Result> = {}): Action<Args> {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const running = useRef(false)
  // Read at call time so a run started from an old render still uses this render's action and options.
  const latest = useRef({ action, options })
  latest.current = { action, options }

  function run(...args: Args) {
    if (running.current) return
    running.current = true
    setError(null)
    startTransition(async () => {
      const { action: fn, options: opts } = latest.current
      try {
        const result = await fn(...args)
        const failed = failureIn(result)
        if (failed !== null) throw new Error(failed)
        if (opts.refresh !== false) await router.invalidate()
        opts.onSuccess?.(result)
      } catch (failure) {
        const message = messageOf(failure)
        if (opts.onError) opts.onError(message)
        else setError(message)
      } finally {
        running.current = false
      }
    })
  }

  return { run, pending, error, clearError: () => setError(null) }
}

export interface OptimisticActionOptions<Value, Args extends unknown[], Result = unknown> extends ActionOptions<Result> {
  /** The value as the server knows it: read it from the route loader every render, never copy it into useState. */
  value: Value
  /** The value to show the instant the button is pressed, from the value showing now and the run's arguments. */
  update: (current: Value, ...args: Args) => Value
  /** The server function to call. */
  action: (...args: Args) => Promise<Result>
}

export interface OptimisticAction<Value, Args extends unknown[]> extends Action<Args> {
  /** What to render: the optimistic value while the action runs, the server's own value once it has landed. */
  value: Value
}

/**
 * An action whose result is visible on this page — a vote, a like, a checkbox, a status, a quantity. The new value
 * appears immediately and is replaced by the server's own value when the loaders refetch; if the call fails, React
 * puts the old value back and `error` explains why.
 *
 *   const vote = useOptimisticAction({
 *     value: { count: post.votes, voted: post.voted },
 *     update: (current) => ({ count: current.count + (current.voted ? -1 : 1), voted: !current.voted }),
 *     action: () => toggleUpvote({ data: { postId: post.id } }),
 *   })
 *   <button onClick={() => vote.run()} aria-pressed={vote.value.voted}>▲ {vote.value.count}</button>
 *
 * One of these per row: give each item its own hook inside its own component (a <PostCard>, a <TodoItem>), never
 * one shared `busy` flag for a whole list — that is what makes every other row go dead while one of them saves.
 * Clicks are never ignored here: each one updates the screen at once, and the calls reach the server in the order
 * they were made, so a double-tapped toggle ends where the person left it.
 */
export function useOptimisticAction<Value, Args extends unknown[], Result>(options: OptimisticActionOptions<Value, Args, Result>): OptimisticAction<Value, Args> {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const latest = useRef(options)
  latest.current = options
  const [value, applyOptimistic] = useOptimistic(options.value, (current: Value, args: Args) => latest.current.update(current, ...args))
  // Runs are chained rather than fired in parallel: two quick taps on a toggle must reach the server in order,
  // or the second can be answered first and the row settles on the wrong state.
  const queue = useRef<Promise<unknown>>(Promise.resolve())

  function run(...args: Args) {
    setError(null)
    startTransition(async () => {
      applyOptimistic(args)
      const mine = queue.current.catch(() => undefined).then(() => latest.current.action(...args))
      queue.current = mine
      try {
        const result = await mine
        const failed = failureIn(result)
        if (failed !== null) throw new Error(failed)
        // Inside the transition on purpose: React holds the optimistic value until this whole block is done, so
        // the real value is already on screen when it lets go and the row never flickers back.
        if (latest.current.refresh !== false) await router.invalidate()
        latest.current.onSuccess?.(result)
      } catch (failure) {
        const message = messageOf(failure)
        if (latest.current.onError) latest.current.onError(message)
        else setError(message)
      }
    })
  }

  return { value, run, pending, error, clearError: () => setError(null) }
}
