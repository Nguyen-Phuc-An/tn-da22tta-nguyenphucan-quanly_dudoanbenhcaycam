# Backend - Hệ thống quản lý canh tác và dự đoán bệnh trên cây có múi

Backend là lớp xử lý nghiệp vụ trung tâm của hệ thống. Thành phần này cung cấp API cho đăng nhập, phân quyền, quản lý dữ liệu vườn cây và làm cầu nối giữa frontend với dịch vụ ML.

## 1. Giới thiệu backend

Backend được xây dựng bằng Node.js và Express, sử dụng MongoDB để lưu trữ dữ liệu. Ngoài các API quản lý thông tin người dùng, vườn cây và bệnh, backend còn chịu trách nhiệm nhận ảnh từ frontend, gửi sang ML service để dự đoán và trả kết quả về lại giao diện.

## 2. Công nghệ sử dụng

- Node.js
- Express
- MongoDB + Mongoose
- JWT cho xác thực
- Multer cho upload ảnh
- Axios để gọi sang ML service
- dotenv để cấu hình môi trường

## 3. Cấu trúc thư mục

```text
backend/
├── src/
│   ├── controllers/      # Xử lý nghiệp vụ
│   ├── models/           # Schema MongoDB
│   ├── routes/           # Khai báo API routes
│   ├── middlewares/      # Auth, upload, error handler
│   └── app.js            # Điểm khởi động ứng dụng
├── scripts/              # Script hỗ trợ retrain, đồng bộ dữ liệu
├── data/                 # Dữ liệu hệ thống như maintenance mode
├── README.md
└── package.json
```

## 4. Cài đặt

```bash
cd backend
npm install
```

## 5. Chạy server

```bash
cd backend
npm run dev
```

Backend mặc định chạy tại `http://localhost:3000`.

## 6. Biến môi trường (.env)

Tạo file `.env` trong thư mục `backend/`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/plant-disease-db
JWT_SECRET=your_secret_key
ML_API_URL=http://localhost:5000
NODE_ENV=development
```

## 7. API chính

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`

### Người dùng

- `GET /api/users`
- `PATCH /api/users/:userId/lock`

### Vườn cây

- `GET /api/gardens`
- `POST /api/gardens`
- `PUT /api/gardens/:id`
- `DELETE /api/gardens/:id`

### Nhật ký và chi phí

- `GET /api/logs`
- `POST /api/logs`
- `DELETE /api/logs/:id`
- `GET /api/expenses`
- `POST /api/expenses`
- `DELETE /api/expenses/:id`

### Mùa vụ

- `GET /api/seasons`
- `POST /api/seasons`
- `PUT /api/seasons/:id`
- `DELETE /api/seasons/:id`

### Bệnh

- `GET /api/diseases`
- `POST /api/diseases`
- `PUT /api/diseases/:id`
- `DELETE /api/diseases/:id`

### Dự đoán bệnh

- `POST /api/predictions/predict`
- `GET /api/predictions`

### ML và bảo trì

- `GET /api/ml/status`
- `POST /api/ml/retrain`
- `GET /api/ml/progress`
- `GET /api/system/maintenance`
- `PATCH /api/system/maintenance`

## 8. Cách backend kết nối với ML

Luồng kết nối giữa backend và ML như sau:

1. Frontend gửi ảnh lá cây lên backend.
2. Backend nhận file bằng Multer và tạo request sang Flask API.
3. ML service trả về tên bệnh, độ tin cậy và top-k kết quả.
4. Backend lưu lịch sử dự đoán vào MongoDB.
5. Backend đọc thêm `ml/training_report.json` để hiển thị kết quả train gần nhất trên trang admin.

### Ví dụ request nội bộ sang ML

```json
{
  "image": "<binary file>",
  "garden_id": "<id nếu có>"
}
```

### Ví dụ response từ ML

```json
{
  "success": true,
  "data": {
    "disease_en": "canker",
    "disease_vi": "Bệnh loét",
    "confidence": 92.45,
    "top_3": [
      {
        "disease_en": "canker",
        "disease_vi": "Bệnh loét",
        "confidence": 92.45
      }
    ]
  }
}
```

## 9. Quy tắc hoạt động

- User chỉ được truy cập các API đã bảo vệ bằng JWT.
- Admin có quyền quản trị dữ liệu và xem trạng thái huấn luyện.
- Khi bật maintenance mode, backend sẽ chặn các request không phải admin.
- Nếu ML service chưa chạy, backend cần thông báo lỗi rõ ràng để frontend xử lý.

## 10. Gợi ý kiểm tra nhanh

```bash
# Kiểm tra backend
curl http://localhost:3000/api/auth/profile

# Kiểm tra trạng thái ML từ backend
curl http://localhost:3000/api/ml/status
```
