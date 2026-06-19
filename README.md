# FoodLog

Web app quản lý **set thực phẩm sơ chế sẵn** — chụp ảnh, phân tích AI, lưu vào Supabase.

Stack: Vite + React + TypeScript + Tailwind · GitHub Pages · Supabase (DB + Storage) · OpenAI / Gemini Vision.

Site: https://giapsoft.github.io/foodlog/

## Kiến trúc

| Thành phần | Lựa chọn | Lý do |
|------------|----------|-------|
| Hosting | **GitHub Pages** | Miễn phí, đã có CI |
| Database | **Supabase PostgreSQL** | Kết nối trực tiếp từ browser qua anon key + RLS |
| Storage (ảnh, audio) | **Supabase Storage** | Cùng tài khoản với DB, free ~1 GB, upload trực tiếp từ client, URL công khai vĩnh viễn |

> **Tại sao Supabase Storage?** Bạn đã dùng Supabase cho DB — dùng luôn Storage tránh thêm tài khoản, một dashboard, RLS/policy thống nhất. Free tier đủ cho app cá nhân/nhóm nhỏ.

## Quy trình sử dụng

1. Mở site trên điện thoại → **Thêm sản phẩm mới**
2. Chụp ảnh → **Crop** → Xem trước (thêm/xóa/đặt ảnh chính)
3. **Tiếp tục** → AI phân tích ảnh → form điền sẵn
4. Chỉnh sửa → **Lưu** → upload ảnh lên Storage + ghi DB

## Cài đặt Supabase

1. Tạo project tại [supabase.com](https://supabase.com)
2. **SQL Editor** → chạy file `supabase/schema.sql`
3. **Storage** → tạo bucket `food-media` (Public)
4. Thêm policy cho bucket (Storage → Policies):

```sql
CREATE POLICY "Public read food-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'food-media');

CREATE POLICY "Public upload food-media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'food-media');
```

5. **Project Settings → API** → copy URL và `anon` key

## Biến môi trường

Copy `.env.example` → `.env.local`:

```bash
cp .env.example .env.local
```

| Biến | Mô tả |
|------|-------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_SUPABASE_STORAGE_BUCKET` | Tên bucket (mặc định `food-media`) |
| `VITE_AI_PROVIDER` | `openai` hoặc `gemini` |
| `VITE_OPENAI_API_KEY` | API key OpenAI (nếu dùng OpenAI) |
| `VITE_GEMINI_API_KEY` | API key Gemini (nếu dùng Gemini) |

### Deploy GitHub Pages

Thêm các secret tương ứng trong **Repo → Settings → Secrets → Actions**, rồi push lên `master`.

## Chạy local

```bash
npm install
npm run dev
```

Mở http://localhost:5173/foodlog/

## Build

```bash
npm run build
npm run preview
```

## Schema dữ liệu

- `foods` — set thực phẩm (tên, mô tả, ảnh, số người phục vụ)
- `food_details` — thành phần theo set (material, unit, quantity)
- `materials` — nguyên liệu thô
- `units` — đơn vị tính

## Lưu ý bảo mật

App kết nối trực tiếp Supabase từ browser — **anon key và API key AI sẽ lộ trong bundle**. Phù hợp app nội bộ/cá nhân. Nếu cần bảo mật hơn: bật Supabase Auth, siết RLS theo user, hoặc gọi AI qua Edge Function.
