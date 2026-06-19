/** Prompt gửi cho AI phân tích ảnh set thực phẩm sơ chế */
export const FOOD_ANALYSIS_PROMPT = `Bạn là một chuyên gia về ẩm thực và sơ chế thực phẩm. Hãy phân tích hình ảnh của set thực phẩm sơ chế sẵn này.

Mục tiêu là cung cấp thông tin chi tiết để tôi có thể tự đi chợ và chuẩn bị một set đồ y hệt tại nhà.

Hãy trả về một JSON object với cấu trúc sau (toàn bộ nội dung bằng tiếng Việt):

{
  "tenSet": "Tên dự đoán của set thực phẩm dựa trên thành phần",
  "khauPhanAn": "Số người ăn phù hợp ước tính (ví dụ: '2 người', '3-4 người')",
  "goiYMonAn": "Món ăn cụ thể nhất có thể chế biến từ set này (ví dụ: 'Thịt bò xào su hào')",
  "moTaSoCheChung": "Mô tả tổng quan về cách các nguyên liệu được sắp xếp và tình trạng sơ chế chung",
  "chiTietCatThai": {
    "noiDung": "Mô tả chi tiết kỹ thuật cắt thái của từng nguyên liệu chính có trong hình"
  },
  "danhSachThanhPhan": [
    {
      "ten": "Tên nguyên liệu chính xác",
      "soLuongUocTinh": "Số lượng đếm bằng đơn vị thông dụng (ví dụ: '5-6 con', '1/2 củ', '3 nhánh') — KHÔNG ghi gram ở đây",
      "khoiLuongUocTinhGram": 300
    }
  ]
}

QUY TẮC BẮT BUỘC — KHỐI LƯỢNG (khoiLuongUocTinhGram):

1. Phải là SỐ NGUYÊN (JSON number), đơn vị gram. Ví dụ đúng: 300, 25, 150. KHÔNG dùng chuỗi, KHÔNG ghi "g", KHÔNG dùng khoảng "500-600".
2. Nếu không chắc, chọn MỘT giá trị ước lượng hợp lý duy nhất (lấy trung bình nếu cần, nhưng chỉ ghi một số).
3. Ước lượng dựa trên KÍCH THƯỚC THỰC TẾ trong ảnh (khay, gói, tay người cầm nếu có) — không phóng đại.
4. Một nguyên liệu trong set bán lẻ / gia đình thường 10–1500 g. Hiếm khi vượt 2000 g cho một dòng thành phần.
5. Tổng khoiLuongUocTinhGram của cả danhSachThanhPhan (trừ gia vị) thường 200–2500 g cho set 1–4 người.
6. Ví dụ tham chiếu: khay xốp nhỏ cá/rau ~300–600 g; nắm rau thơm ~10–30 g; gia vị ~5–20 g.

QUY TẮC KHÁC:

- soLuongUocTinh: mô tả số lượng đếm (con, củ, nhánh, gói...). Gram chỉ nằm ở khoiLuongUocTinhGram.
- Đầu ra CHỈ chứa duy nhất một khối JSON hợp lệ, không markdown, không giải thích thêm.
- Mọi thông tin phải dựa trên hình ảnh được cung cấp.`

/** Cấu trúc JSON thô từ AI (tiếng Việt) */
export interface AiAnalysisResponse {
  tenSet: string
  khauPhanAn: string
  goiYMonAn: string
  moTaSoCheChung: string
  chiTietCatThai: { noiDung: string }
  danhSachThanhPhan: AiAnalysisIngredient[]
}

export interface AiAnalysisIngredient {
  ten: string
  soLuongUocTinh: string
  khoiLuongUocTinhGram: string | number
}
