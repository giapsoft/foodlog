import { Link } from 'react-router-dom'
import type { Food } from '../lib/types'
import { formatDate } from '../lib/utils'

interface FoodCardProps {
  food: Food
}

export default function FoodCard({ food }: FoodCardProps) {
  return (
    <Link
      to={`/food/${food.id}`}
      className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm transition active:bg-neutral-50"
    >
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        {food.main_image_url ? (
          <img
            src={food.main_image_url}
            alt={food.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl">🥗</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="truncate font-semibold text-neutral-900">{food.name}</h2>
        {food.suggested_dish && (
          <p className="mt-0.5 truncate text-sm text-emerald-700">{food.suggested_dish}</p>
        )}
        <p className="mt-0.5 line-clamp-2 text-sm text-neutral-500">
          {food.prep_description || 'Không có mô tả'}
        </p>
        <p className="mt-1 text-xs text-neutral-400">
          {food.serving_size_text || `${food.standard_servings} người`} ·{' '}
          {formatDate(food.updated_at)}
        </p>
      </div>
    </Link>
  )
}
