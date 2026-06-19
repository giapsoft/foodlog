/** Prompt gửi cho AI phân tích ảnh set thực phẩm sơ chế */
export const FOOD_ANALYSIS_PROMPT = `Bạn là một chuyên gia về ẩm thực và sơ chế thực phẩm. Hãy phân tích hình ảnh của set thực phẩm sơ chế sẵn này.

Mục tiêu là cung cấp thông tin chi tiết để tôi có thể tự đi chợ và chuẩn bị một set đồ y hệt tại nhà.

Hãy trả về một JSON object với cấu trúc sau (toàn bộ nội dung bằng tiếng Việt):

{
  "tenSet": "Tên dự đoán của set thực phẩm dựa trên thành phần",
  "khauPhanAn": "Số người ăn phù hợp ước tính (ví dụ: '2 người')",
  "goiYMonAn": "Món ăn cụ thể nhất có thể chế biến từ set này (ví dụ: 'Thịt bò xào su hào')",
  "moTaSoCheChung": "Mô tả tổng quan về cách các nguyên liệu được sắp xếp và tình trạng sơ chế chung (ví dụ: 'Nguyên liệu rửa sạch, củ quả thái sợi, hành ngò để nguyên cọng dài xát trong khay xốp')",
  "chiTietCatThai": {
    "noiDung": "Mô tả chi tiết kỹ thuật cắt thái của từng nguyên liệu chính có trong hình (ví dụ: 'Su hào thái sợi chì (julienne) đều nhau, Cà rốt thái sợi tương tự, Hành lá cắt khúc dài khoảng 10-12cm, Ngò rí để nguyên cọng...')"
  },
  "danhSachThanhPhan": [
    {
      "ten": "Tên nguyên liệu chính xác",
      "soLuongUocTinh": "Số lượng ước tính bằng đơn vị thông dụng (ví dụ: '1/2 củ', '5 nhánh')",
      "khoiLuongUocTinhGram": "Khối lượng ước tính bằng Gram (ví dụ: '250', '20')"
    }
  ]
}

LƯU Ý QUAN TRỌNG:

- Đầu ra của bạn CHỈ ĐƯỢC chứa duy nhất một khối JSON hợp lệ. Không được thêm bất kỳ câu chữ nào khác bên ngoài JSON.
- Mọi thông tin ước tính phải dựa trên hình ảnh được cung cấp.`

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
  khoiLuongUocTinhGram: string
}
