// SERVER-ONLY. AI for this app through MonstarX's AI service: text generation (with automatic model
// fallback), JSON answers, streaming for chat UIs, and image generation. No API keys to manage;
// call these inside server function handlers or server routes. Per-app daily limits apply.
export type ContentPart = { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }
export interface AiMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | ContentPart[]
}

export interface TextOptions {
  /** A single user prompt, or… */
  prompt?: string
  /** …a full conversation (for chat UIs). */
  messages?: AiMessage[]
  system?: string
  temperature?: number
  maxTokens?: number
}

export interface TextResult {
  text: string
  model: string
  usage: { promptTokens: number; completionTokens: number }
}

export interface SearchSource {
  title: string
  url: string
  snippet: string
}

export interface SearchResult {
  /** A concise answer grounded in the results, with citations. */
  answer: string
  sources: SearchSource[]
  model: string
}

export interface ImageResult {
  /** A permanent URL (stored in this app's files under public/ai/) or a data: URL. */
  url: string
  key: string | null
  model: string
}

function endpoint(): { base: string; token: string } {
  const base = process.env.MONSTARX_AI_URL
  const token = process.env.MONSTARX_DATA_TOKEN
  if (!base || !token) throw new Error('AI is only available while this app runs inside MonstarX (previews and published apps); set MONSTARX_AI_URL and MONSTARX_DATA_TOKEN elsewhere.')
  return { base: base.replace(/\/+$/, ''), token }
}

async function post(path: string, body: unknown): Promise<Response> {
  const { base, token } = endpoint()
  const response = await fetch(`${base}/${path}`, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify(body) })
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? `AI request failed (${response.status})`)
  }
  return response
}

export const ai = {
  /** Generate text. */
  async generateText(options: TextOptions): Promise<TextResult> {
    return (await post('text', options)).json() as Promise<TextResult>
  },

  /** Structured output with optional runtime validation and one repair attempt on invalid data. */
  async generateJson<T = unknown>(options: TextOptions & { validate?: (value: unknown) => T; repair?: boolean }): Promise<T> {
    const { validate, repair = true, ...request } = options
    let correction = ''
    for (let attempt = 0; attempt < (repair ? 2 : 1); attempt++) {
      // Network/auth/quota errors are not malformed output: do not retry those here.
      const result = (await (await post('text', { ...request, json: true, ...(correction ? { system: `${request.system ?? ''}\n${correction}` } : {}) })).json()) as TextResult
      try {
        const text = result.text.trim().replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/i, '$1')
        const value: unknown = JSON.parse(text)
        return validate ? validate(value) : value as T
      } catch (error) {
        if (attempt === 1 || !repair) throw new Error('The AI returned data that did not match the requested format. Please try again.', { cause: error })
        const reason = error instanceof Error ? error.message.slice(0, 1000) : 'Invalid JSON shape'
        correction = `The previous response could not be used: ${reason}. Generate the complete JSON again, matching the requested schema exactly. Return only JSON, no markdown. Do not omit required fields.`
      }
    }
    throw new Error('The AI could not produce valid structured data')
  },

  /**
   * Stream text as it is generated. Returns a stream of text chunks; in a server route, return
   * `new Response(await ai.streamText(...))` and read it on the client with a ReadableStream reader.
   */
  async streamText(options: TextOptions): Promise<ReadableStream<string>> {
    const response = await post('text', { ...options, stream: true })
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    return new ReadableStream<string>({
      async pull(controller) {
        const { value, done } = await reader.read()
        if (done) {
          controller.close()
          return
        }
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const event = JSON.parse(line.slice(6)) as { delta?: string; done?: boolean }
            if (event.delta) controller.enqueue(event.delta)
          } catch {
            // ignore
          }
        }
      },
      cancel() {
        void reader.cancel()
      },
    })
  },

  /** Search the web and get an answer with cited sources (live results). */
  async search(options: { query: string; maxResults?: number }): Promise<SearchResult> {
    return (await post('search', options)).json() as Promise<SearchResult>
  },

  /** Generate an image from a prompt; the result is stored with this app's files. */
  async generateImage(options: { prompt: string; size?: string }): Promise<ImageResult> {
    return (await post('image', options)).json() as Promise<ImageResult>
  },
}
