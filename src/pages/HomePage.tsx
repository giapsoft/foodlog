import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import FoodCard from '../components/FoodCard'
import { isSupabaseConfigured } from '../lib/supabase'
import { fetchFoods } from '../lib/supabase'
import type { Food } from '../lib/types'

export default function HomePage() {
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setError('Chưa cấu hình Supabase. Xem .env.example')
      setLoading(false)
      return
    }
    try {
      setError(null)
      const data = await fetchFoods()
      setFoods(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được danh sách')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="flex flex-col pb-24">
      {!isSupabaseConfigured() && (
        <div className="mx-4 mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Thiếu biến môi trường Supabase. Tạo file <code>.env.local</code> theo{' '}
          <code>.env.example</code>.
        </div>
      )}

      {loading && (
        <p className="px-4 py-8 text-center text-sm text-neutral-500">Đang tải...</p>
      )}

      {error && (
        <p className="mx-4 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && foods.length === 0 && (
        <div className="px-4 py-12 text-center">
          <p className="text-neutral-500">Chưa có set thực phẩm nào.</p>
          <p className="mt-1 text-sm text-neutral-400">
            Nhấn nút bên dưới để thêm mới.
          </p>
        </div>
      )}

      <ul className="space-y-3 px-4 py-4">
        {foods.map((food) => (
          <li key={food.id}>
            <FoodCard food={food} />
          </li>
        ))}
      </ul>

      <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-lg border-t border-neutral-200 bg-white p-4">
        <Link
          to="/add"
          className="flex w-full items-center justify-center rounded-xl bg-emerald-600 py-4 text-base font-semibold text-white shadow-lg active:bg-emerald-700"
        >
          + Thêm sản phẩm mới
        </Link>
      </div>
    </div>
  )
}
