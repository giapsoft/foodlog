import type { AiAnalysisResponse } from './ai-prompt'
import { FOOD_ANALYSIS_PROMPT } from './ai-prompt'
import type { AiFoodDraft } from './types'

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

function stripJsonMarkdown(text: string): string {
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
}

/** Parse "2-3 người", "2 người" → số nguyên ước lượng */
export function parseServingCount(text: string): number {
  const numbers = text.match(/\d+/g)?.map(Number) ?? []
  if (numbers.length === 0) return 1
  if (numbers.length === 1) return Math.max(1, numbers[0]!)
  return Math.max(1, Math.round((numbers[0]! + numbers[numbers.length - 1]!) / 2))
}

const MAX_GRAM_PER_INGREDIENT = 2000

/**
 * Parse khối lượng gram từ AI.
 * Tránh lỗi "500-600" → strip hết → "500600".
 */
export function parseGramWeight(raw: unknown): number {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return clampGram(Math.round(raw))
  }

  const text = String(raw ?? '').trim().toLowerCase()
  if (!text) return 0

  const withoutUnit = text.replace(/\s*g(r(amm?)?)?\.?\s*$/i, '').trim()

  const rangeMatch = withoutUnit.match(/^(\d+(?:\.\d+)?)\s*[-–—]\s*(\d+(?:\.\d+)?)$/)
  if (rangeMatch) {
    const a = Number(rangeMatch[1]!)
    const b = Number(rangeMatch[2]!)
    return clampGram(Math.round((a + b) / 2))
  }

  const singleMatch = withoutUnit.match(/^(\d+(?:\.\d+)?)$/)
  if (singleMatch) {
    return clampGram(Math.round(Number(singleMatch[1]!)))
  }

  const firstNumber = withoutUnit.match(/(\d+(?:\.\d+)?)/)
  if (firstNumber) {
    return clampGram(Math.round(Number(firstNumber[1]!)))
  }

  return 0
}

function clampGram(grams: number): number {
  if (!Number.isFinite(grams) || grams < 0) return 0
  return Math.min(grams, MAX_GRAM_PER_INGREDIENT)
}

function mapAnalysisToDraft(raw: AiAnalysisResponse): AiFoodDraft {
  if (!raw.tenSet || !Array.isArray(raw.danhSachThanhPhan)) {
    throw new Error('AI trả về dữ liệu không hợp lệ')
  }

  const servingText = String(raw.khauPhanAn ?? '').trim()

  return {
    name: String(raw.tenSet).trim(),
    serving_size_text: servingText,
    standard_servings: parseServingCount(servingText),
    suggested_dish: String(raw.goiYMonAn ?? '').trim(),
    prep_description: String(raw.moTaSoCheChung ?? '').trim(),
    cutting_details: String(raw.chiTietCatThai?.noiDung ?? '').trim(),
    ingredients: raw.danhSachThanhPhan.map((item) => ({
      material_name: String(item.ten ?? '').trim(),
      estimated_quantity_text: String(item.soLuongUocTinh ?? '').trim(),
      quantity_grams: parseGramWeight(item.khoiLuongUocTinhGram),
    })),
  }
}

function parseAiJson(text: string): AiFoodDraft {
  const parsed = JSON.parse(stripJsonMarkdown(text)) as AiAnalysisResponse
  return mapAnalysisToDraft(parsed)
}

async function analyzeWithOpenAI(mainImage: Blob): Promise<AiFoodDraft> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string
  const model = (import.meta.env.VITE_OPENAI_MODEL as string) || 'gpt-4o-mini'

  if (!apiKey) {
    throw new Error('Thiếu VITE_OPENAI_API_KEY')
  }

  const base64 = await blobToBase64(mainImage)
  const mime = mainImage.type || 'image/jpeg'

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: FOOD_ANALYSIS_PROMPT },
            {
              type: 'image_url',
              image_url: { url: `data:${mime};base64,${base64}` },
            },
          ],
        },
      ],
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI lỗi: ${response.status} ${err}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content as string
  return parseAiJson(content)
}

async function analyzeWithGemini(mainImage: Blob): Promise<AiFoodDraft> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string
  const model = (import.meta.env.VITE_GEMINI_MODEL as string) || 'gemini-2.0-flash'

  if (!apiKey) {
    throw new Error('Thiếu VITE_GEMINI_API_KEY')
  }

  const base64 = await blobToBase64(mainImage)
  const mime = mainImage.type || 'image/jpeg'

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: FOOD_ANALYSIS_PROMPT },
            { inline_data: { mime_type: mime, data: base64 } },
          ],
        },
      ],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gemini lỗi: ${response.status} ${err}`)
  }

  const data = await response.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text as string
  return parseAiJson(content)
}

export function isAiConfigured(): boolean {
  const provider = (import.meta.env.VITE_AI_PROVIDER as string) || 'openai'
  if (provider === 'gemini') {
    return Boolean(import.meta.env.VITE_GEMINI_API_KEY)
  }
  return Boolean(import.meta.env.VITE_OPENAI_API_KEY)
}

export async function analyzeFoodImages(images: Blob[]): Promise<AiFoodDraft> {
  if (images.length === 0) {
    throw new Error('Cần ít nhất một ảnh để phân tích')
  }

  if (!isAiConfigured()) {
    throw new Error(
      'Chưa cấu hình AI. Thêm VITE_AI_PROVIDER và API key tương ứng vào biến môi trường.',
    )
  }

  const provider = (import.meta.env.VITE_AI_PROVIDER as string) || 'openai'

  if (provider === 'gemini') {
    return analyzeWithGemini(images[0]!)
  }
  return analyzeWithOpenAI(images[0]!)
}

/** Rút gọn message lỗi API cho dễ đọc trên mobile */
export function formatAiError(error: unknown): string {
  const msg = error instanceof Error ? error.message : 'Phân tích AI thất bại'
  const jsonStart = msg.indexOf('{')
  if (jsonStart >= 0) {
    try {
      const parsed = JSON.parse(msg.slice(jsonStart)) as {
        error?: { message?: string; code?: number }
      }
      const apiMsg = parsed.error?.message
      if (apiMsg) {
        const firstLine = apiMsg.split('\n')[0]!
        const prefix = msg.includes('Gemini') ? 'Gemini' : msg.includes('OpenAI') ? 'OpenAI' : 'AI'
        const code = parsed.error?.code ? ` (${parsed.error.code})` : ''
        return `${prefix}${code}: ${firstLine}`
      }
    } catch {
      /* giữ nguyên msg gốc */
    }
  }
  return msg.length > 400 ? `${msg.slice(0, 400)}…` : msg
}
