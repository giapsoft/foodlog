import { parseServingCount } from './ai'
import type { AiFoodDraft, FoodFormData } from './types'

export function createImageId(): string {
  return crypto.randomUUID()
}

export async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  mime = 'image/jpeg',
): Promise<Blob> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas không khả dụng')

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Không tạo được ảnh'))),
      mime,
      1,
    )
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function draftToForm(draft: AiFoodDraft): FoodFormData {
  return {
    name: draft.name,
    serving_size_text: draft.serving_size_text,
    standard_servings: draft.standard_servings,
    suggested_dish: draft.suggested_dish,
    prep_description: draft.prep_description,
    cutting_details: draft.cutting_details,
    ingredients: draft.ingredients.map((ing) => ({
      key: crypto.randomUUID(),
      material_name: ing.material_name,
      estimated_quantity_text: ing.estimated_quantity_text,
      quantity_grams: ing.quantity_grams,
    })),
  }
}

export function foodToForm(food: {
  name: string
  serving_size_text: string
  standard_servings: number
  suggested_dish: string
  prep_description: string
  cutting_details: string
  details: {
    material?: { name: string }
    estimated_quantity_text: string
    quantity: number
  }[]
}): FoodFormData {
  return {
    name: food.name,
    serving_size_text: food.serving_size_text,
    standard_servings: food.standard_servings,
    suggested_dish: food.suggested_dish,
    prep_description: food.prep_description,
    cutting_details: food.cutting_details,
    ingredients: food.details.map((d) => ({
      key: crypto.randomUUID(),
      material_name: d.material?.name ?? '',
      estimated_quantity_text: d.estimated_quantity_text,
      quantity_grams: d.quantity,
    })),
  }
}

export function syncServingCount(form: FoodFormData): FoodFormData {
  return {
    ...form,
    standard_servings: parseServingCount(form.serving_size_text),
  }
}
