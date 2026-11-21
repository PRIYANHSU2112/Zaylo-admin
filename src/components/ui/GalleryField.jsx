import React from 'react'
import { ArrowLeft, Star, Trash2 } from 'lucide-react'
import ImageUploadField from './ImageUploadField'
import { useDeleteUploadMutation } from '../../store/api/catalog.api'

/**
 * Ordered image gallery (first image = primary). Uploads via the existing presigned
 * ImageUploadField; removing an image also deletes it from storage when it is ours.
 * @param {{ value: string[], onChange: (urls: string[]) => void, max?: number, folder?: string }} props
 */
export default function GalleryField({ value = [], onChange, max = 8, folder = 'products', label = 'Product images', error }) {
  const [deleteUpload] = useDeleteUploadMutation()
  const images = value.filter(Boolean)

  const remove = (url) => {
    onChange(images.filter((u) => u !== url))
    deleteUpload(url) // best effort; external URLs are refused server-side and simply unlinked
  }
  const move = (i) => {
    if (i === 0) return
    const next = [...images]
    ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-muted-foreground">
        {label} <span className="font-normal">({images.length}/{max} · first image is the main photo)</span>
      </p>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={url} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-border bg-muted/30">
              <img src={url} alt="" className="h-full w-full object-contain" />
              {i === 0 && (
                <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold text-white">
                  <Star size={9} /> MAIN
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button type="button" disabled={i === 0} onClick={() => move(i)} className="rounded p-1 text-white disabled:opacity-30" title="Move earlier">
                  <ArrowLeft size={13} />
                </button>
                <button type="button" onClick={() => remove(url)} className="rounded p-1 text-white hover:text-rose-300" title="Remove image">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {images.length < max && (
        <ImageUploadField
          key={images.length}
          label={images.length ? 'Add another image' : 'Upload main image'}
          folder={folder}
          value=""
          onChange={(url) => url && !images.includes(url) && onChange([...images, url])}
        />
      )}
      {error && <p className="text-[11px] font-bold text-rose-500">{error}</p>}
    </div>
  )
}
