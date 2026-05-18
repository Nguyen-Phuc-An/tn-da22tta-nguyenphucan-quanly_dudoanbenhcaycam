# Frontend - Hệ thống quản lý canh tác và dự đoán bệnh trên cây có múi

Frontend là giao diện người dùng của hệ thống. Ứng dụng cho phép đăng nhập, quản lý vườn cây, xem nhật ký, tải ảnh lá cây để dự đoán bệnh và sử dụng các chức năng quản trị dành cho admin.

## 1. Giới thiệu frontend

Frontend được xây dựng bằng React, kết hợp Vite và TailwindCSS để tạo giao diện nhanh, nhẹ và dễ mở rộng. Toàn bộ các màn hình chính của hệ thống như dashboard, quản lý vườn, dự đoán bệnh, thư viện bệnh và trang admin đều được hiển thị từ lớp này.

## 2. Công nghệ sử dụng

- React 18
- Vite
- TailwindCSS
- React Router
- Axios
- React Hook Form
- React Hot Toast

## 3. Cài đặt

```bash
cd frontend
npm install
```

## 4. Chạy project

```bash
cd frontend
npm run dev
```

Frontend mặc định chạy tại `http://localhost:5173`.

## 5. Cấu hình API (env)

Tạo file `.env` trong thư mục `frontend/`:

```env
VITE_API_URL=http://localhost:3000/api
```

Ví dụ với file `.env.local`:

```env
VITE_API_URL=http://localhost:3000/api
```

## 6. Cấu trúc thư mục

```text
frontend/
├── src/
│   ├── components/       # Layout, route guard, component dùng chung
│   ├── pages/            # Các trang chính của hệ thống
│   ├── services/         # Gọi API, auth, xử lý token
│   ├── App.jsx           # Khai báo routes
│   └── main.jsx          # Điểm khởi động ứng dụng
├── public/
├── index.html
└── README.md
```

## 7. Các trang chính

### Xác thực

- Trang đăng nhập
- Trang đăng ký
- Kiểm tra phiên đăng nhập tự động qua token

### Người dùng

- Dashboard tổng quan
- Quản lý vườn cây
- Quản lý nhật ký canh tác
- Quản lý chi phí
- Danh sách mùa vụ
- Thư viện bệnh cây có múi

### Dự đoán bệnh

- Upload ảnh lá cây
- Xem kết quả dự đoán và độ tin cậy
- Xem top-k kết quả gợi ý từ model

### Admin

- Quản lý danh sách bệnh
- Xem trạng thái train của mô hình ML
- Theo dõi precision, recall, F1, loss
- Bật/tắt chế độ bảo trì

## 8. Luồng hoạt động

1. Người dùng đăng nhập và nhận token từ backend.
2. Frontend lưu token và thông tin user trong `localStorage`.
3. Mọi request API được gửi qua `apiClient`.
4. Khi backend trả `401`, ứng dụng tự chuyển về trang đăng nhập.
5. Khi backend bật maintenance mode, frontend chuyển sang trang bảo trì.

## 9. Ví dụ request API

```js
import apiClient from './services/apiClient';

const response = await apiClient.get('/gardens');
console.log(response.data);
```

## 10. Ghi chú

- Frontend cần chạy cùng backend thì các chức năng xác thực và dự đoán mới hoạt động đầy đủ.
- Nếu đổi địa chỉ backend, chỉ cần cập nhật `VITE_API_URL` trong file `.env`.
- Giao diện đã được tách thành các trang riêng để dễ bảo trì và mở rộng thêm tính năng mới.
