import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CameraCapture from '../components/CameraCapture'
import ImageGallery from '../components/ImageGallery'
import { useAddFood } from '../context/AddFoodContext'

export default function AddPreviewPage() {
  const navigate = useNavigate()
  const { images, addImage, removeImage, setMainImage } = useAddFood()
  const [addingMore, setAddingMore] = useState(false)

  if (images.length === 0) {
    navigate('/add', { replace: true })
    return null
  }

  if (addingMore) {
    return (
      <CameraCapture
        onCaptured={(blob) => {
          addImage(blob)
          setAddingMore(false)
        }}
        onCancel={() => setAddingMore(false)}
      />
    )
  }

  return (
    <div className="flex flex-col pb-28">
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
        onAddMore={() => setAddingMore(true)}
      />

      <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-lg border-t border-neutral-200 bg-white p-4">
        <button
          type="button"
          onClick={() => navigate('/add/analyze')}
          className="w-full rounded-xl bg-emerald-600 py-4 text-base font-semibold text-white active:bg-emerald-700"
        >
          Tiếp tục → Phân tích AI
        </button>
      </div>
    </div>
  )
}
