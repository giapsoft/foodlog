import { useRef, useState } from 'react'
import ImageCropper from './ImageCropper'

interface CameraCaptureProps {
  onCaptured: (blob: Blob) => void
  onCancel?: () => void
}

export default function CameraCapture({ onCaptured, onCancel }: CameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [rawSrc, setRawSrc] = useState<string | null>(null)

  function openCamera() {
    inputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setRawSrc(URL.createObjectURL(file))
    e.target.value = ''
  }

  function handleCropDone(blob: Blob) {
    if (rawSrc) URL.revokeObjectURL(rawSrc)
    setRawSrc(null)
    onCaptured(blob)
  }

  function handleCropCancel() {
    if (rawSrc) URL.revokeObjectURL(rawSrc)
    setRawSrc(null)
  }

  if (rawSrc) {
    return (
      <ImageCropper
        imageSrc={rawSrc}
        onConfirm={handleCropDone}
        onCancel={handleCropCancel}
      />
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8">
      <div className="flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50">
        <span className="text-5xl">📷</span>
      </div>
      <p className="text-center text-sm text-neutral-600">
        Chụp ảnh set thực phẩm sơ chế. Sau khi chụp bạn có thể cắt ảnh.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={openCamera}
        className="w-full max-w-xs rounded-xl bg-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-sm active:bg-emerald-700"
      >
        Mở camera / chọn ảnh
      </button>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-neutral-500 underline"
        >
          Hủy
        </button>
      )}
    </div>
  )
}
