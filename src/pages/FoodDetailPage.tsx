import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import FoodForm, { formToSaveInput } from '../components/FoodForm'
import { deleteFood, fetchFoodWithDetails, updateFood } from '../lib/supabase'
import { uploadImages } from '../lib/storage'
import type { FoodFormData, LocalImage } from '../lib/types'
import { prepareCapturedImage } from '../lib/image-compress'
import { createImageId, foodToForm, formatDate } from '../lib/utils'

export default function FoodDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const foodId = Number(id)

  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FoodFormData | null>(null)
  const [existingUrls, setExistingUrls] = useState<{
    main: string
    others: string[]
  } | null>(null)
  const [meta, setMeta] = useState<{ created_at: string; updated_at: string } | null>(
    null,
  )
  const [newImages, setNewImages] = useState<LocalImage[]>([])

  const load = useCallback(async () => {
    if (!Number.isFinite(foodId)) return
    setLoading(true)
    try {
      const food = await fetchFoodWithDetails(foodId)
      if (!food) {
        setError('Không tìm thấy set thực phẩm')
        return
      }

      setExistingUrls({
        main: food.main_image_url ?? '',
        others: food.other_image_urls ?? [],
      })
      setMeta({ created_at: food.created_at, updated_at: food.updated_at })
      setFormData(foodToForm(food))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [foodId])

  useEffect(() => {
    load()
  }, [load])

  async function handleSave() {
    if (!formData || !existingUrls) return
    if (!formData.name.trim()) {
      setError('Vui lòng nhập tên set')
      return
    }

    setSaving(true)
    setError(null)

    try {
      let mainUrl = existingUrls.main
      let otherUrls = [...existingUrls.others]

      if (newImages.length > 0) {
        const sorted = [...newImages].sort((a, b) => {
          if (a.isMain) return -1
          if (b.isMain) return 1
          return 0
        })
        const uploaded = await uploadImages(sorted.map((i) => i.blob))
        if (sorted[0]?.isMain) {
          mainUrl = uploaded[0]!
          otherUrls = [...otherUrls, ...uploaded.slice(1)]
        } else {
          otherUrls = [...otherUrls, ...uploaded]
        }
      }

      const input = formToSaveInput(formData, mainUrl, otherUrls)
      await updateFood(foodId, input)
      setEditing(false)
      setNewImages([])
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cập nhật thất bại')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Xóa set thực phẩm này?')) return
    try {
      await deleteFood(foodId)
      navigate('/', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xóa thất bại')
    }
  }

  async function handleAddImage(file: File) {
    const blob = await prepareCapturedImage(file)
    setNewImages((prev) => [
      ...prev,
      {
        id: createImageId(),
        blob,
        previewUrl: URL.createObjectURL(blob),
        isMain: false,
      },
    ])
  }

  if (loading) {
    return <p className="px-4 py-8 text-center text-sm text-neutral-500">Đang tải...</p>
  }

  if (error && !formData) {
    return (
      <p className="mx-4 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
        {error}
      </p>
    )
  }

  if (!formData || !existingUrls) return null

  const allImages = [
    existingUrls.main,
    ...existingUrls.others,
    ...newImages.map((i) => i.previewUrl),
  ].filter(Boolean)

  return (
    <div className="flex flex-col pb-28">
      <div className="px-4 pt-4">
        <h2 className="text-lg font-bold text-neutral-800">
          {editing ? 'Chỉnh sửa' : formData.name}
        </h2>
        {meta && (
          <p className="mt-1 text-xs text-neutral-400">
            Tạo: {formatDate(meta.created_at)} · Cập nhật: {formatDate(meta.updated_at)}
          </p>
        )}
      </div>

      {error && (
        <p className="mx-4 mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {editing ? (
        <>
          <FoodForm data={formData} onChange={setFormData} disabled={saving} />
          <div className="px-4 py-2">
            <label className="block text-sm font-medium text-neutral-700">
              Thêm ảnh mới
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="mt-1 block w-full text-sm"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleAddImage(f)
                  e.target.value = ''
                }}
              />
            </label>
          </div>
        </>
      ) : (
        <div className="space-y-4 px-4 py-4">
          {formData.suggested_dish && (
            <div>
              <h3 className="text-sm font-medium text-neutral-700">Gợi ý món ăn</h3>
              <p className="mt-1 text-sm text-emerald-700">{formData.suggested_dish}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-neutral-700">Khẩu phần</h3>
            <p className="mt-1 text-sm text-neutral-600">
              {formData.serving_size_text || `${formData.standard_servings} người`}
            </p>
          </div>

          {formData.prep_description && (
            <div>
              <h3 className="text-sm font-medium text-neutral-700">Mô tả sơ chế</h3>
              <p className="mt-1 text-sm text-neutral-600">{formData.prep_description}</p>
            </div>
          )}

          {formData.cutting_details && (
            <div>
              <h3 className="text-sm font-medium text-neutral-700">Chi tiết cắt thái</h3>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                {formData.cutting_details}
              </p>
            </div>
          )}

          <div>
            <h3 className="mb-2 text-sm font-medium text-neutral-700">
              Danh sách thành phần
            </h3>
            <ul className="space-y-2">
              {formData.ingredients.map((ing) => (
                <li
                  key={ing.key}
                  className="rounded-lg bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-neutral-200"
                >
                  <span className="font-medium">{ing.material_name}</span>
                  <span className="text-neutral-500">
                    {' '}
                    — {ing.estimated_quantity_text || '—'}
                    {ing.quantity_grams > 0 && ` (${ing.quantity_grams} g)`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {allImages.length > 0 && (
        <section className="mt-6 border-t border-neutral-200 px-4 pt-6 pb-4">
          <h3 className="mb-3 text-sm font-medium text-neutral-700">Ảnh</h3>
          <div className="space-y-4">
            {allImages.map((url, i) => (
              <figure key={`${url}-${i}`} className="overflow-hidden rounded-xl bg-neutral-100">
                {i === 0 && allImages.length > 1 && (
                  <figcaption className="bg-neutral-800/80 px-3 py-1.5 text-xs font-medium text-white">
                    Ảnh chính
                  </figcaption>
                )}
                <img
                  src={url}
                  alt={i === 0 ? formData.name : `${formData.name} — ảnh ${i + 1}`}
                  className="block w-full h-auto"
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        </section>
      )}

      <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-lg space-y-2 border-t border-neutral-200 bg-white p-4">
        {editing ? (
          <>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                setNewImages([])
                load()
              }}
              className="w-full rounded-xl border border-neutral-300 py-3 text-sm text-neutral-700"
            >
              Hủy
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white"
            >
              Sửa
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="w-full rounded-xl border border-red-200 py-3 text-sm text-red-600"
            >
              Xóa
            </button>
          </>
        )}
      </div>
    </div>
  )
}
