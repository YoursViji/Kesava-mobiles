import { useEffect, useState } from 'react'

export function DamagePhotoPicker({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  const [previews, setPreviews] = useState<string[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file))
    setPreviews(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [files])
  return <section className="mt-4 rounded-xl border border-neutral-200 p-4">
    <label className="block text-sm font-semibold text-neutral-800" htmlFor="damage-photos">Damage photos (optional)</label>
    <p className="mt-1 text-xs text-neutral-600">Attach up to 3 photos, JPG, PNG or WebP, up to 5 MB each. Show the damage only—avoid faces, personal messages or identity documents. Photos are private and visible only to store staff.</p>
    <input id="damage-photos" type="file" multiple accept="image/jpeg,image/png,image/webp" className="mt-3 block w-full text-sm text-neutral-700 file:mr-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-semibold file:text-brand-800" onChange={(e) => {
      const selected = Array.from(e.target.files ?? [])
      e.target.value = ''
      if (!selected.length) return
      if (files.length + selected.length > 3) { setError('Attach no more than 3 photos. Remove one before adding another.'); return }
      if (selected.some((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size === 0 || file.size > 5 * 1024 * 1024)) {
        setError('Choose JPG, PNG or WebP photos up to 5 MB each.'); return
      }
      setError('')
      onChange([...files, ...selected])
    }} />
    {error ? <p role="alert" className="mt-2 text-sm text-red-700">{error}</p> : null}
    <div className="mt-3 grid grid-cols-3 gap-2">
      {files.map((file, index) => <div key={`${file.name}-${index}`} className="min-w-0 rounded-lg border border-neutral-200 p-2">
        {previews[index] ? <img src={previews[index]} alt={`Damage preview ${index + 1}`} className="aspect-square w-full rounded-md object-cover" /> : null}
        <p className="mt-1 truncate text-xs text-neutral-600">{file.name}</p>
        <button type="button" className="mt-1 text-xs font-semibold text-red-700 hover:underline" aria-label={`Remove ${file.name}`} onClick={() => { setError(''); onChange(files.filter((_, i) => i !== index)) }}>Remove</button>
      </div>)}
    </div>
  </section>
}
