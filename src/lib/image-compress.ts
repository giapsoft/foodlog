import imageCompression from 'browser-image-compression'

const MAX_DIMENSION = Number(import.meta.env.VITE_IMAGE_MAX_SIZE) || 1920
const MAX_SIZE_MB = Number(import.meta.env.VITE_IMAGE_MAX_MB) || 0.5
const JPEG_QUALITY = Number(import.meta.env.VITE_IMAGE_JPEG_QUALITY) || 0.82

function blobToFile(blob: Blob): File {
  const type = blob.type.startsWith('image/') ? blob.type : 'image/jpeg'
  return new File([blob], 'photo.jpg', { type })
}

/** Nén ảnh sau chụp/crop — dùng trước preview, AI và upload */
export async function prepareCapturedImage(blob: Blob): Promise<Blob> {
  if (!blob.type.startsWith('image/')) {
    return blob
  }

  const compressed = await imageCompression(blobToFile(blob), {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_DIMENSION,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: JPEG_QUALITY,
    preserveExif: false,
  })

  return compressed.size < blob.size ? compressed : blob
}
