import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FoodForm, { formToSaveInput } from '../components/FoodForm'
import { useAddFood } from '../context/AddFoodContext'
import { analyzeFoodImages, isAiConfigured, mockAiDraft } from '../lib/ai'
import { saveFood } from '../lib/supabase'
import { uploadImages } from '../lib/storage'
import type { FoodFormData } from '../lib/types'

type Step = 'analyzing' | 'review' | 'saving'

export default function AddAnalyzePage() {
  const navigate = useNavigate()
  const { images, formData, setFormData, initFormFromDraft, reset } = useAddFood()
  const [step, setStep] = useState<Step>('analyzing')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (images.length === 0) {
      navigate('/add', { replace: true })
      return
    }

    if (formData) {
      setStep('review')
      return
    }

    let cancelled = false

    async function run() {
      try {
        const blobs = images.map((img) => img.blob)
        const draft = isAiConfigured()
          ? await analyzeFoodImages(blobs)
          : mockAiDraft()

        if (cancelled) return
        initFormFromDraft(draft)
        setStep('review')
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Phân tích AI thất bại')
          setStep('review')
          initFormFromDraft(mockAiDraft())
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [images, formData, initFormFromDraft, navigate])

  async function handleSave(data: FoodFormData) {
    if (!data.name.trim()) {
      setError('Vui lòng nhập tên set thực phẩm')
      return
    }

    setStep('saving')
    setError(null)

    try {
      const sorted = [...images].sort((a, b) => {
        if (a.isMain) return -1
        if (b.isMain) return 1
        return 0
      })
      const blobs = sorted.map((img) => img.blob)
      const urls = await uploadImages(blobs)

      const [mainUrl, ...otherUrls] = urls
      const input = formToSaveInput(data, mainUrl!, otherUrls)
      const id = await saveFood(input)

      reset()
      navigate(`/food/${id}`, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lưu thất bại')
      setStep('review')
    }
  }

  if (step === 'analyzing') {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
        <p className="text-sm text-neutral-600">Đang phân tích ảnh bằng AI...</p>
        {!isAiConfigured() && (
          <p className="text-xs text-amber-600">
            Chưa cấu hình AI — dùng dữ liệu mẫu để thử.
          </p>
        )}
      </div>
    )
  }

  if (!formData) return null

  return (
    <div className="flex flex-col pb-28">
      <div className="px-4 pt-4">
        <h2 className="text-lg font-bold text-neutral-800">Xác nhận thông tin</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Kiểm tra và chỉnh sửa kết quả AI trước khi lưu.
        </p>
      </div>

      {error && (
        <p className="mx-4 mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <FoodForm
        data={formData}
        onChange={setFormData}
        disabled={step === 'saving'}
      />

      <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-lg border-t border-neutral-200 bg-white p-4">
        <button
          type="button"
          disabled={step === 'saving'}
          onClick={() => handleSave(formData)}
          className="w-full rounded-xl bg-emerald-600 py-4 text-base font-semibold text-white disabled:opacity-50"
        >
          {step === 'saving' ? 'Đang lưu ảnh & dữ liệu...' : 'Lưu lại'}
        </button>
      </div>
    </div>
  )
}
