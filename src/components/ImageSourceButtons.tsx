import { forwardRef, useImperativeHandle, useRef } from 'react'

export interface ImageSourceHandle {
  openGallery: () => void
  openCamera: () => void
}

interface ImageSourceButtonsProps {
  onFileSelected: (file: File) => void
}

const ImageSourceButtons = forwardRef<ImageSourceHandle, ImageSourceButtonsProps>(
  function ImageSourceButtons({ onFileSelected }, ref) {
    const galleryRef = useRef<HTMLInputElement>(null)
    const cameraRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      openGallery: () => galleryRef.current?.click(),
      openCamera: () => cameraRef.current?.click(),
    }))

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (file) onFileSelected(file)
    }

    return (
      <>
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="flex-1 rounded-xl border-2 border-emerald-600 py-3.5 text-sm font-semibold text-emerald-700 active:bg-emerald-50"
          >
            Chọn ảnh
          </button>
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="flex-1 rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white active:bg-emerald-700"
          >
            Chụp ảnh
          </button>
        </div>
      </>
    )
  },
)

export default ImageSourceButtons
