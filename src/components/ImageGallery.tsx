import type { LocalImage } from '../lib/types'

interface ImageGalleryProps {
  images: LocalImage[]
  onRemove: (id: string) => void
  onSetMain: (id: string) => void
  onAddMore: () => void
}

export default function ImageGallery({
  images,
  onRemove,
  onSetMain,
  onAddMore,
}: ImageGalleryProps) {
  if (images.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-neutral-500">
        Chưa có ảnh nào.
      </p>
    )
  }

  return (
    <div className="space-y-4 px-4 py-4">
      <div className="grid grid-cols-2 gap-3">
        {images.map((img) => (
          <div
            key={img.id}
            className={`relative overflow-hidden rounded-xl border-2 ${
              img.isMain ? 'border-emerald-500' : 'border-transparent'
            }`}
          >
            <img
              src={img.previewUrl}
              alt=""
              className="aspect-[4/3] w-full object-cover"
            />
            {img.isMain && (
              <span className="absolute left-2 top-2 rounded bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
                Ảnh chính
              </span>
            )}
            <div className="absolute bottom-0 flex w-full gap-1 bg-black/50 p-1">
              {!img.isMain && (
                <button
                  type="button"
                  onClick={() => onSetMain(img.id)}
                  className="flex-1 rounded bg-white/90 py-1 text-xs font-medium text-neutral-800"
                >
                  Đặt chính
                </button>
              )}
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                className="flex-1 rounded bg-red-500/90 py-1 text-xs font-medium text-white"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onAddMore}
          className="flex aspect-[4/3] flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 text-emerald-700"
        >
          <span className="text-2xl">+</span>
          <span className="text-xs font-medium">Thêm ảnh</span>
        </button>
      </div>
    </div>
  )
}
