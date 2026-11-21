import React, { useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2, Link as LinkIcon } from 'lucide-react'
import {
  usePresignUploadMutation,
  useCompleteUploadMutation,
} from '../../store/api/catalog.api'
import Button from './Button'
import { Input } from './Input'
import { cn } from '../../utils/cn'

/**
 * Presigned direct upload: API → short PUT URL → browser → R2 → complete.
 * @param {{ value: string, onChange: (url: string) => void, folder?: string, label?: string, error?: string }} props
 */
export default function ImageUploadField({
  value = '',
  onChange,
  folder = 'uploads',
  label = 'Image',
  error,
}) {
  const inputRef = useRef(null)
  const [presignUpload] = usePresignUploadMutation()
  const [completeUpload] = useCompleteUploadMutation()
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState('')
  const [showUrl, setShowUrl] = useState(false)

  const handlePick = () => inputRef.current?.click()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setLocalError('Please choose an image file (JPG, PNG, WebP, GIF)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setLocalError('Image must be under 5 MB')
      return
    }

    setLocalError('')
    setIsLoading(true)
    try {
      const presign = await presignUpload({
        folder,
        contentType: file.type,
        contentLength: file.size,
        filename: file.name,
      }).unwrap()

      const payload = presign?.data
      if (!payload?.uploadUrl || !payload?.key) {
        throw new Error('Presign succeeded but upload URL was missing')
      }

      const headers = {
        'Content-Type': payload.headers?.ContentType || file.type,
      }
      if (payload.headers?.CacheControl) {
        headers['Cache-Control'] = payload.headers.CacheControl
      }

      const putRes = await fetch(payload.uploadUrl, {
        method: 'PUT',
        headers,
        body: file,
      })

      if (!putRes.ok) {
        throw new Error(
          `Direct upload failed (${putRes.status}). Check R2 CORS and credentials.`,
        )
      }

      const confirmed = await completeUpload({ key: payload.key }).unwrap()
      const url = confirmed?.data?.url || payload.publicUrl
      if (!url) throw new Error('Upload confirmed but no URL returned')
      onChange(url)
    } catch (err) {
      setLocalError(err?.data?.message || err?.message || 'Upload failed')
    } finally {
      setIsLoading(false)
    }
  }

  const displayError = error || localError

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="block text-sm font-semibold text-foreground/80">{label}</label>
      )}

      <div
        className={cn(
          'rounded-2xl border border-dashed border-border bg-muted/30 p-3',
          displayError && 'border-rose-400',
        )}
      >
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <div className="w-full sm:w-28 h-28 rounded-xl border border-border bg-card overflow-hidden flex items-center justify-center shrink-0">
            {value ? (
              <img src={value} alt="" className="w-full h-full object-cover" />
            ) : (
              <ImagePlus className="text-muted-foreground" size={28} />
            )}
          </div>

          <div className="flex-1 space-y-2 w-full">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handlePick}
                disabled={isLoading}
                className="text-xs h-9 px-3 gap-1.5"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                {isLoading ? 'Uploading…' : 'Upload image'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowUrl((v) => !v)}
                className="text-xs h-9 px-3 gap-1.5"
              >
                <LinkIcon size={14} />
                {showUrl ? 'Hide URL' : 'Paste URL'}
              </Button>
              {value && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onChange('')}
                  className="text-xs h-9 px-3 gap-1.5 text-rose-500"
                >
                  <Trash2 size={14} />
                  Clear
                </Button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              JPG, PNG, WebP or GIF · max 5 MB · stored in <span className="font-semibold">{folder}</span>
            </p>
            {showUrl && (
              <Input
                label="Image URL"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://…"
              />
            )}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />

      {displayError && (
        <p className="text-xs text-rose-500 font-medium">{displayError}</p>
      )}
    </div>
  )
}
