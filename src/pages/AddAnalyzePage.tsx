import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FoodForm, { formToSaveInput } from '../components/FoodForm'
import { useAddFood } from '../context/AddFoodContext'
import { analyzeFoodImages, formatAiError, isAiConfigured } from '../lib/ai'
import { saveFood } from '../lib/supabase'
import { uploadImages } from '../lib/storage'
import type { FoodFormData } from '../lib/types'

type Step = 'analyzing' | 'failed' | 'review' | 'saving'

export default function AddAnalyzePage() {
  const navigate = useNavigate()
  const { images, formData, setFormData, initFormFromDraft, reset } = useAddFood()
  const [step, setStep] = useState<Step>('analyzing')
  const [error, setError] = useState<string | null>(null)

  async function runAnalysis() {
    setStep('analyzing')
    setError(null)
    setFormData(null)

    try {
      if (!isAiConfigured()) {
        throw new Error(
          'Chưa cấu hình AI. Thêm VITE_AI_PROVIDER và API key vào .env.local (hoặc GitHub Secrets khi deploy).',
        )
      }

      const blobs = images.map((img) => img.blob)
      const draft = await analyzeFoodImages(blobs)
      initFormFromDraft(draft)
      setStep('review')
    } catch (e) {
      setError(formatAiError(e))
      setStep('failed')
    }
  }

  useEffect(() => {
    if (images.length === 0) {
      navigate('/add', { replace: true })
      return
    }

    if (formData) {
      setStep('review')
      return
    }

    runAnalysis()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy khi vào trang với ảnh mới
  }, [images.length, navigate])

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
      </div>
    )
  }

  if (step === 'failed') {
    return (
      <div className="flex flex-col gap-4 px-4 py-8">
        <h2 className="text-lg font-bold text-neutral-800">Phân tích AI thất bại</h2>
        <p className="rounded-lg bg-red-50 px-3 py-3 text-sm text-red-700">{error}</p>
        <p className="text-sm text-neutral-500">
          Không có dữ liệu tự điền. Vui lòng thử lại hoặc quay về bước trước.
        </p>
        <div className="flex flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={runAnalysis}
            className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white"
          >
            Thử lại
          </button>
          <Link
            to="/add/preview"
            className="block w-full rounded-xl border border-neutral-300 py-3 text-center text-sm font-medium text-neutral-700"
          >
            ← Quay lại xem ảnh
          </Link>
        </div>
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
