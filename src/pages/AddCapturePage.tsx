import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CameraCapture from '../components/CameraCapture'
import { useAddFood } from '../context/AddFoodContext'

export default function AddCapturePage() {
  const navigate = useNavigate()
  const { addImage, reset } = useAddFood()
  const [started, setStarted] = useState(false)

  useEffect(() => {
    reset()
  }, [reset])

  function handleCaptured(blob: Blob) {
    addImage(blob)
    navigate('/add/preview')
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 px-4 py-12">
        <h2 className="text-xl font-bold text-neutral-800">Thêm set mới</h2>
        <p className="text-center text-sm text-neutral-600">
          Bước 1: Chụp ảnh set thực phẩm sơ chế. Bạn có thể chụp thêm ảnh ở bước sau.
        </p>
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="w-full max-w-xs rounded-xl bg-emerald-600 px-6 py-4 text-base font-semibold text-white"
        >
          Bắt đầu chụp
        </button>
      </div>
    )
  }

  return (
    <CameraCapture
      onCaptured={handleCaptured}
      onCancel={() => navigate('/')}
    />
  )
}
