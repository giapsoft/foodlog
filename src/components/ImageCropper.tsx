import { useCallback, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { prepareCapturedImage } from '../lib/image-compress'
import { getCroppedBlob } from '../lib/utils'

interface ImageCropperProps {
  imageSrc: string
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

export default function ImageCropper({ imageSrc, onConfirm, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels)
  }, [])

  async function handleConfirm() {
    if (!croppedArea) return
    setSaving(true)
    try {
      const cropped = await getCroppedBlob(imageSrc, croppedArea)
      const blob = await prepareCapturedImage(cropped)
      onConfirm(blob)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[60vh] w-full bg-black">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={4 / 3}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className="space-y-3 px-4 py-4">
        <label className="block text-sm text-neutral-600">
          Thu phóng
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="mt-1 w-full accent-emerald-600"
          />
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-neutral-300 py-3 text-sm font-medium text-neutral-700"
          >
            Chụp lại
          </button>
          <button
            type="button"
            disabled={saving || !croppedArea}
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'Đang cắt & nén...' : 'Đồng ý'}
          </button>
        </div>
      </div>
    </div>
  )
}
