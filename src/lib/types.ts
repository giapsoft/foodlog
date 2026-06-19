export interface Unit {
  id: number
  name: string
}

export interface Material {
  id: number
  name: string
}

export interface Food {
  id: number
  name: string
  /** Khẩu phần ăn dạng text, VD: "2-3 người" */
  serving_size_text: string
  /** Số người ước tính (parse từ khauPhanAn) */
  standard_servings: number
  /** Gợi ý món ăn */
  suggested_dish: string
  /** Mô tả sơ chế chung */
  prep_description: string
  /** Chi tiết kỹ thuật cắt thái */
  cutting_details: string
  main_image_url: string | null
  other_image_urls: string[]
  created_at: string
  updated_at: string
}

export interface FoodDetail {
  id?: number
  food_id?: number
  material_id: number
  unit_id: number
  /** Khối lượng gram */
  quantity: number
  /** Số lượng ước tính dạng text, VD: "1/2 củ lớn" */
  estimated_quantity_text: string
  material?: Material
  unit?: Unit
}

export interface FoodWithDetails extends Food {
  details: FoodDetail[]
}

/** Local blob before upload */
export interface LocalImage {
  id: string
  blob: Blob
  previewUrl: string
  isMain: boolean
}

/** Kết quả AI đã chuẩn hóa */
export interface AiFoodDraft {
  name: string
  serving_size_text: string
  standard_servings: number
  suggested_dish: string
  prep_description: string
  cutting_details: string
  ingredients: AiIngredientDraft[]
}

export interface AiIngredientDraft {
  material_name: string
  estimated_quantity_text: string
  quantity_grams: number
}

/** Form state cho user chỉnh sửa trước khi lưu */
export interface FoodFormData {
  name: string
  serving_size_text: string
  standard_servings: number
  suggested_dish: string
  prep_description: string
  cutting_details: string
  ingredients: IngredientFormRow[]
}

export interface IngredientFormRow {
  key: string
  material_name: string
  estimated_quantity_text: string
  quantity_grams: number
}
