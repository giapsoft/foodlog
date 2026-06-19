import type { FoodFormData, IngredientFormRow } from '../lib/types'
import { syncServingCount } from '../lib/utils'

interface FoodFormProps {
  data: FoodFormData
  onChange: (data: FoodFormData) => void
  disabled?: boolean
}

function updateIngredient(
  rows: IngredientFormRow[],
  key: string,
  patch: Partial<IngredientFormRow>,
): IngredientFormRow[] {
  return rows.map((row) => (row.key === key ? { ...row, ...patch } : row))
}

export default function FoodForm({ data, onChange, disabled }: FoodFormProps) {
  function patch(partial: Partial<FoodFormData>) {
    const next = { ...data, ...partial }
    if ('serving_size_text' in partial) {
      onChange(syncServingCount(next))
      return
    }
    onChange(next)
  }

  function addRow() {
    patch({
      ingredients: [
        ...data.ingredients,
        {
          key: crypto.randomUUID(),
          material_name: '',
          estimated_quantity_text: '',
          quantity_grams: 0,
        },
      ],
    })
  }

  function removeRow(key: string) {
    patch({ ingredients: data.ingredients.filter((r) => r.key !== key) })
  }

  return (
    <div className="space-y-4 px-4 py-2">
      <label className="block">
        <span className="text-sm font-medium text-neutral-700">Tên set</span>
        <input
          type="text"
          value={data.name}
          disabled={disabled}
          onChange={(e) => patch({ name: e.target.value })}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base"
          placeholder="VD: Set Rau Củ Sơ Chế Xào Thịt"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-neutral-700">Khẩu phần ăn</span>
        <input
          type="text"
          value={data.serving_size_text}
          disabled={disabled}
          onChange={(e) => patch({ serving_size_text: e.target.value })}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base"
          placeholder="VD: 2-3 người"
        />
        <p className="mt-1 text-xs text-neutral-400">
          Ước lượng số người: {data.standard_servings}
        </p>
      </label>

      <label className="block">
        <span className="text-sm font-medium text-neutral-700">Gợi ý món ăn</span>
        <input
          type="text"
          value={data.suggested_dish}
          disabled={disabled}
          onChange={(e) => patch({ suggested_dish: e.target.value })}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base"
          placeholder="VD: Su hào và Cà rốt xào thịt bò"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-neutral-700">Mô tả sơ chế chung</span>
        <textarea
          value={data.prep_description}
          disabled={disabled}
          onChange={(e) => patch({ prep_description: e.target.value })}
          rows={3}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base"
          placeholder="Cách nguyên liệu được sắp xếp và tình trạng sơ chế"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-neutral-700">Chi tiết cắt thái</span>
        <textarea
          value={data.cutting_details}
          disabled={disabled}
          onChange={(e) => patch({ cutting_details: e.target.value })}
          rows={4}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base"
          placeholder="Kỹ thuật cắt thái từng nguyên liệu"
        />
      </label>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-700">Thành phần</span>
          <button
            type="button"
            disabled={disabled}
            onClick={addRow}
            className="text-sm font-medium text-emerald-700"
          >
            + Thêm
          </button>
        </div>

        <div className="space-y-3">
          {data.ingredients.map((row) => (
            <div
              key={row.key}
              className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm"
            >
              <input
                type="text"
                value={row.material_name}
                disabled={disabled}
                onChange={(e) =>
                  patch({
                    ingredients: updateIngredient(data.ingredients, row.key, {
                      material_name: e.target.value,
                    }),
                  })
                }
                placeholder="Tên nguyên liệu"
                className="mb-2 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={row.estimated_quantity_text}
                  disabled={disabled}
                  onChange={(e) =>
                    patch({
                      ingredients: updateIngredient(data.ingredients, row.key, {
                        estimated_quantity_text: e.target.value,
                      }),
                    })
                  }
                  placeholder="SL ước tính (VD: 1/2 củ)"
                  className="flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={row.quantity_grams || ''}
                  disabled={disabled}
                  onChange={(e) =>
                    patch({
                      ingredients: updateIngredient(data.ingredients, row.key, {
                        quantity_grams: Number(e.target.value) || 0,
                      }),
                    })
                  }
                  placeholder="g"
                  className="w-20 rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                />
                <span className="self-center text-xs text-neutral-400">g</span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => removeRow(row.key)}
                  className="rounded-lg px-2 text-red-500"
                  aria-label="Xóa thành phần"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function formToSaveInput(
  data: FoodFormData,
  mainImageUrl: string,
  otherImageUrls: string[],
) {
  return {
    name: data.name,
    serving_size_text: data.serving_size_text,
    standard_servings: data.standard_servings,
    suggested_dish: data.suggested_dish,
    prep_description: data.prep_description,
    cutting_details: data.cutting_details,
    main_image_url: mainImageUrl,
    other_image_urls: otherImageUrls,
    ingredients: data.ingredients
      .filter((r) => r.material_name.trim())
      .map((r) => ({
        material_name: r.material_name.trim(),
        estimated_quantity_text: r.estimated_quantity_text.trim(),
        quantity_grams: r.quantity_grams,
      })),
  }
}
