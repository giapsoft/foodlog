import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AiFoodDraft, FoodFormData, LocalImage } from '../lib/types'
import { draftToForm } from '../lib/utils'

interface AddFoodContextValue {
  images: LocalImage[]
  addImage: (blob: Blob) => void
  removeImage: (id: string) => void
  setMainImage: (id: string) => void
  clearImages: () => void
  aiDraft: AiFoodDraft | null
  setAiDraft: (draft: AiFoodDraft | null) => void
  formData: FoodFormData | null
  setFormData: (data: FoodFormData | null) => void
  initFormFromDraft: (draft: AiFoodDraft) => void
  reset: () => void
}

const AddFoodContext = createContext<AddFoodContextValue | null>(null)

function blobToLocalImage(blob: Blob, isMain: boolean): LocalImage {
  return {
    id: crypto.randomUUID(),
    blob,
    previewUrl: URL.createObjectURL(blob),
    isMain,
  }
}

export function AddFoodProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<LocalImage[]>([])
  const [aiDraft, setAiDraft] = useState<AiFoodDraft | null>(null)
  const [formData, setFormData] = useState<FoodFormData | null>(null)

  const addImage = useCallback((blob: Blob) => {
    setImages((prev) => {
      const next = blobToLocalImage(blob, prev.length === 0)
      return [...prev, next]
    })
  }, [])

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)

      const filtered = prev.filter((img) => img.id !== id)
      if (filtered.length === 0) return filtered

      const hasMain = filtered.some((img) => img.isMain)
      if (!hasMain) {
        return filtered.map((img, i) => ({ ...img, isMain: i === 0 }))
      }
      return filtered
    })
  }, [])

  const setMainImage = useCallback((id: string) => {
    setImages((prev) =>
      prev.map((img) => ({ ...img, isMain: img.id === id })),
    )
  }, [])

  const clearImages = useCallback(() => {
    setImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.previewUrl))
      return []
    })
  }, [])

  const initFormFromDraft = useCallback((draft: AiFoodDraft) => {
    setFormData(draftToForm(draft))
  }, [])

  const reset = useCallback(() => {
    clearImages()
    setAiDraft(null)
    setFormData(null)
  }, [clearImages])

  const value = useMemo(
    () => ({
      images,
      addImage,
      removeImage,
      setMainImage,
      clearImages,
      aiDraft,
      setAiDraft,
      formData,
      setFormData,
      initFormFromDraft,
      reset,
    }),
    [
      images,
      addImage,
      removeImage,
      setMainImage,
      clearImages,
      aiDraft,
      formData,
      initFormFromDraft,
      reset,
    ],
  )

  return <AddFoodContext.Provider value={value}>{children}</AddFoodContext.Provider>
}

export function useAddFood() {
  const ctx = useContext(AddFoodContext)
  if (!ctx) throw new Error('useAddFood must be used within AddFoodProvider')
  return ctx
}
