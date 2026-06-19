import { supabase } from './supabase'

const bucket = (import.meta.env.VITE_SUPABASE_STORAGE_BUCKET as string) || 'food-media'

function extensionFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/webm': 'webm',
  }
  return map[mime] ?? 'bin'
}

function randomKey(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export async function uploadBlob(blob: Blob, folder = 'images'): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase chưa cấu hình')
  }

  const ext = extensionFromMime(blob.type || 'image/jpeg')
  const path = `${folder}/${randomKey()}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    cacheControl: '3600',
    upsert: false,
    contentType: blob.type || undefined,
  })

  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadImages(blobs: Blob[]): Promise<string[]> {
  return Promise.all(blobs.map((blob) => uploadBlob(blob, 'images')))
}

export async function uploadAudio(blob: Blob): Promise<string> {
  return uploadBlob(blob, 'audio')
}
