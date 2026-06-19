import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ImageCropper from '../components/ImageCropper'
import ImageGallery from '../components/ImageGallery'
import ImageSourceButtons, { type ImageSourceHandle } from '../components/ImageSourceButtons'
import { useAddFood } from '../context/AddFoodContext'

export default function AddPreviewPage() {
  const navigate = useNavigate()
  const sourceRef = useRef<ImageSourceHandle>(null)
  const { images, addImage, removeImage, setMainImage } = useAddFood()
  const [rawSrc, setRawSrc] = useState<string | null>(null)

  if (images.length === 0) {
    navigate('/', { replace: true })
    return null
  }

  function clearRawSrc() {
    if (rawSrc) URL.revokeObjectURL(rawSrc)
    setRawSrc(null)
  }

  function handleFileSelected(file: File) {
    clearRawSrc()
    setRawSrc(URL.createObjectURL(file))
  }

  function handleCropDone(blob: Blob) {
    clearRawSrc()
    addImage(blob)
  }

  if (rawSrc) {
    return (
      <ImageCropper
        imageSrc={rawSrc}
        onConfirm={handleCropDone}
        onCancel={clearRawSrc}
      />
    )
  }

  return (
    <div className="flex flex-col pb-36">
      <div className="px-4 pt-4">
        <h2 className="text-lg font-bold text-neutral-800">Xem trước ảnh</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Chọn ảnh chính, thêm hoặc xóa ảnh trước khi phân tích AI.
        </p>
      </div>

      <ImageGallery
        images={images}
        onRemove={removeImage}
        onSetMain={setMainImage}
        onAddMore={() => sourceRef.current?.openGallery()}
      />

      <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-lg space-y-2 border-t border-neutral-200 bg-white p-4">
        <ImageSourceButtons ref={sourceRef} onFileSelected={handleFileSelected} />
        <button
          type="button"
          onClick={() => navigate('/add/analyze')}
          className="w-full rounded-xl bg-neutral-800 py-3.5 text-sm font-semibold text-white active:bg-neutral-900"
        >
          Phân tích AI →
        </button>
      </div>
    </div>
  )
}
