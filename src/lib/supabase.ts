import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Food, FoodDetail, FoodWithDetails, Material, Unit } from './types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey)
}

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null

function client(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase chưa cấu hình. Thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào .env.local',
    )
  }
  return supabase
}

export async function fetchFoods(): Promise<Food[]> {
  const { data, error } = await client()
    .from('foods')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function fetchFoodWithDetails(id: number): Promise<FoodWithDetails | null> {
  const { data: food, error } = await client()
    .from('foods')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!food) return null

  const { data: details, error: detailsError } = await client()
    .from('food_details')
    .select('*, material:materials(*), unit:units(*)')
    .eq('food_id', id)

  if (detailsError) throw detailsError

  return {
    ...food,
    other_image_urls: food.other_image_urls ?? [],
    details: (details ?? []).map((row) => ({
      id: row.id,
      food_id: row.food_id,
      material_id: row.material_id,
      unit_id: row.unit_id,
      quantity: Number(row.quantity),
      estimated_quantity_text: row.estimated_quantity_text ?? '',
      material: row.material as Material | undefined,
      unit: row.unit as Unit | undefined,
    })),
  }
}

async function findOrCreateUnit(name: string): Promise<number> {
  const trimmed = name.trim()
  const { data: existing } = await client()
    .from('units')
    .select('id')
    .ilike('name', trimmed)
    .maybeSingle()

  if (existing) return existing.id

  const { data, error } = await client()
    .from('units')
    .insert({ name: trimmed })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

async function findOrCreateMaterial(name: string): Promise<number> {
  const trimmed = name.trim()
  const { data: existing } = await client()
    .from('materials')
    .select('id')
    .ilike('name', trimmed)
    .maybeSingle()

  if (existing) return existing.id

  const { data, error } = await client()
    .from('materials')
    .insert({ name: trimmed })
    .select('id')
    .single()

  if (error) throw error
  return data.id
}

export interface SaveFoodInput {
  name: string
  serving_size_text: string
  standard_servings: number
  suggested_dish: string
  prep_description: string
  cutting_details: string
  main_image_url: string
  other_image_urls: string[]
  ingredients: {
    material_name: string
    estimated_quantity_text: string
    quantity_grams: number
  }[]
}

async function insertFoodDetails(
  foodId: number,
  ingredients: SaveFoodInput['ingredients'],
): Promise<void> {
  const gramUnitId = await findOrCreateUnit('g')
  const details: Omit<FoodDetail, 'id'>[] = []

  for (const ing of ingredients) {
    const material_id = await findOrCreateMaterial(ing.material_name)
    details.push({
      food_id: foodId,
      material_id,
      unit_id: gramUnitId,
      quantity: ing.quantity_grams,
      estimated_quantity_text: ing.estimated_quantity_text,
    })
  }

  if (details.length > 0) {
    const { error } = await client().from('food_details').insert(details)
    if (error) throw error
  }
}

function foodRow(input: SaveFoodInput) {
  return {
    name: input.name.trim(),
    serving_size_text: input.serving_size_text.trim(),
    standard_servings: input.standard_servings,
    suggested_dish: input.suggested_dish.trim(),
    prep_description: input.prep_description.trim(),
    cutting_details: input.cutting_details.trim(),
    main_image_url: input.main_image_url,
    other_image_urls: input.other_image_urls,
  }
}

export async function saveFood(input: SaveFoodInput): Promise<number> {
  const { data: food, error: foodError } = await client()
    .from('foods')
    .insert(foodRow(input))
    .select('id')
    .single()

  if (foodError) throw foodError

  await insertFoodDetails(food.id, input.ingredients)
  return food.id
}

export async function updateFood(id: number, input: SaveFoodInput): Promise<void> {
  const { error: foodError } = await client()
    .from('foods')
    .update(foodRow(input))
    .eq('id', id)

  if (foodError) throw foodError

  const { error: deleteError } = await client().from('food_details').delete().eq('food_id', id)
  if (deleteError) throw deleteError

  await insertFoodDetails(id, input.ingredients)
}

export async function deleteFood(id: number): Promise<void> {
  const { error } = await client().from('foods').delete().eq('id', id)
  if (error) throw error
}
