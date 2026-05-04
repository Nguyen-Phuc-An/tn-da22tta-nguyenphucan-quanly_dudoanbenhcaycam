# Backend - Hệ thống Quản lý Vườn Cây

## 🎯 Các Giải Thuật Chính

### 1. JWT AUTHENTICATION - Xác Thực Token (config/auth.js)
**Mục đích**: Xác minh danh tính người dùng khi gọi API

**Quy trình**:
```
Đăng nhập (POST /auth/login)
  ↓ [Verify mật khẩu]
  ↓ [Tạo JWT Token]
  JWT = base64(header.payload.signature)
  payload = {userId, iat, exp}
  ↓ Trả về Token cho Client

Gọi API (GET /gardens)
  ↓ [Client gửi: Authorization: Bearer JWT]
  ↓ [Backend verify signature]
  ↓ [Lấy userId từ payload]
  ↓ [Cho phép truy cập]
```

**Công thức JWT**:
- **Header**: `{alg: HS256, typ: JWT}`
- **Payload**: `{userId, iat: 1234567890, exp: 1234571490}`
- **Signature**: `HMACSHA256(header.payload, secret)`

**Security**: Token hết hạn sau ~1 giờ, tùy `JWT_SECRET` environment variable

---

### 2. ROLE-BASED ACCESS CONTROL - RBAC (Kiểm soát Quyền)
**Mục đích**: Admin có quyền khác nhau với User thường

**Hai vai trò**:
```
ADMIN (vai_tro = "admin")
  ✓ Xem tất cả dữ liệu của mọi user
  ✓ Xóa dữ liệu của user bất kỳ
  ✓ Quản lý bệnh, mùa vụ hệ thống
  ✓ Cleanup dữ liệu rác/orphaned

USER (vai_tro = "user")
  ✓ Xem chỉ dữ liệu của mình
  ✓ Sửa/xóa chỉ dữ liệu của mình
  ✗ Không xem dữ liệu user khác
  ✗ Không thể thay đổi vai trò
```

**Kiểm tra quyền**: Pseudocode
```
if (currentUser.vai_tro === "admin") {
  // Admin → cho phép tất cả
  return next();
}

// User thường → kiểm tra ownership
if (record.user_id.toString() === currentUser._id.toString()) {
  // Chủ sở hữu → cho phép
  return next();
} else {
  // Không phải chủ → cấm
  return res.status(403).json({message: "Bạn không có quyền"});
}
```

**Ví dụ**: Garden
```
Garden {
  user_id: ObjectId("user123"),
  ten_vuon: "Vườn A",
  ...
}

GET /gardens/:id
  if (req.userRole === "admin") → cho phép
  if (garden.user_id === req.userId) → cho phép
  else → 403 Forbidden
```

---

### 3. NULL CHECK & ORPHANED DATA CLEANUP
**Mục đích**: Xử lý dữ liệu hư hỏng (FK không tồn tại)

**Tình huống**: Log có garden_id, nhưng vườn bị xóa
```
Log {
  _id: "log123",
  garden_id: null,        ← Vườn đã bị xóa
  mo_ta: "Chưa xử lý"
}
```

**Giải pháp**:
```
// Nếu garden tồn tại → check quyền thường
if (log.garden_id) {
  garden = await Garden.findById(log.garden_id);
  if (!garden) {
    return res.status(404).json({message: "Vườn không tồn tại"});
  }
  
  // Kiểm tra ownership
  if (garden.user_id !== req.userId && req.userRole !== "admin") {
    return res.status(403).json({message: "Không có quyền"});
  }
}

// Nếu garden = null → chỉ admin xóa được (cleanup)
if (!log.garden_id && req.userRole !== "admin") {
  return res.status(403).json({message: "Chỉ admin xóa orphaned log"});
}

// Admin → xóa được
if (req.userRole === "admin") {
  await Log.findByIdAndDelete(log._id);
}
```

---

### 4. MONGOOSE POPULATE - Lấy Dữ Liệu Liên Quan (MongoDB)
**Mục đích**: Thay thế Foreign Key bằng full object

**Trước populate** (lấy thô):
```javascript
const logs = await Log.find({user_id: userId});
// Kết quả:
[
  {_id: "log1", garden_id: "garden123", ...},
  {_id: "log2", garden_id: "garden456", ...}
]
// garden_id = chỉ là ID, không có tên vườn
```

**Sau populate**:
```javascript
const logs = await Log.find({user_id: userId})
  .populate('garden_id', 'ten_vuon dia_chi')  // Lấy tên & địa chỉ
  .populate('season_id', 'ten_mua_vu');      // Lấy tên mùa

// Kết quả:
[
  {
    _id: "log1",
    garden_id: {_id: "g123", ten_vuon: "Vườn A", dia_chi: "TP.HCM"},
    season_id: {_id: "s456", ten_mua_vu: "Mùa hè 2024"},
    ...
  }
]
```

**Công thức**:
```
populate(path, select)
  path = "garden_id"           ← Field cần populate
  select = "ten_vuon dia_chi"  ← Chỉ lấy fields này
```

---

### 5. CASCADING FILTERING - Lọc Dữ Liệu Liên Tục
**Mục đích**: Season dropdown chỉ hiển thị mùa của vườn được chọn

**Tình huống**: 
- User chọn "Vườn A" → Hiển thị chỉ mùa của Vườn A
- User chọn "Vườn B" → Hiển thị chỉ mùa của Vườn B

**Giải pháp**:
```javascript
// Frontend: TasksPage.jsx

// Bước 1: Lấy gardens (sẽ chứa mùa vụ đã populate)
const gardens = await getGardens();
// gardens[0] = {_id: "g1", ten_vuon: "A", season_id: {_id: "s1", ten_mua_vu: "Hè"}}

// Bước 2: Filter seasons khi user chọn garden
const selectedGardenId = watch('garden_id');
const filteredSeasons = gardens
  .filter(g => g._id === selectedGardenId)  // Tìm vườn được chọn
  .flatMap(g => g.season_id || []);          // Lấy season_id của nó

// Bước 3: Dropdown seasons = filteredSeasons
<select>{filteredSeasons.map(s => <option>{s.ten_mua_vu}</option>)}</select>
```

**Kết quả**: Dropdown tự cập nhật khi user chọn vườn khác

---

### 6. FORM RESET WITH ID EXTRACTION - Xử Lý Form Khi Sửa
**Mục đích**: Khi user click "Sửa", form hiển thị dữ liệu cũ nhưng API lại nhận ID

**Tình huống**:
```
Garden {
  _id: "g123",
  user_id: {_id: "u456", ho_ten: "Nam"},  ← Là object, không phải ID
  season_id: {_id: "s789", ten_mua_vu: "Hè"}
}
```

Nếu gửi nguyên object lên API → API chưa object, nó chỉ chưa ID!

**Giải pháp - Trích xuất ID**:
```javascript
const handleEdit = (garden) => {
  const extractedData = {
    ten_vuon: garden.ten_vuon,
    dien_tich: garden.dien_tich,
    user_id: garden.user_id?._id || garden.user_id,  // Lấy ID
    season_id: garden.season_id?._id || garden.season_id,  // Lấy ID
  };
  reset(extractedData);  // Form nhận ID, không phải object
};

// API nhận:
{
  "ten_vuon": "Vườn A",
  "dien_tich": 100,
  "user_id": "u456",      ← ID, không phải object
  "season_id": "s789"     ← ID, không phải object
}
```

---

### 7. HASHING PASSWORD - Bảo Mật Mật Khẩu (bcryptjs)
**Mục đích**: Lưu mật khẩu an toàn (không lưu plain text)

**Quy trình đăng ký**:
```
User nhập: "password123"
  ↓ [Hash với salt rounds=10]
  ↓ bcryptjs.hash("password123", 10)
  ↓
Lưu: "$2b$10$...128 ký tự..."  (không thể reverse)

Đăng nhập: User nhập "password123"
  ↓ [Compare với hash]
  ↓ bcryptjs.compare("password123", "$2b$10$...")
  ↓ true/false
```

**Công thức**: SHA512 × 10 vòng, salt ngẫu nhiên

---

## 📁 Cấu trúc dự án

```
backend/
├── src/
│   ├── config/
│   │   ├── auth.js            # JWT & authenticateToken middleware
│   │   └── db.js              # Kết nối MongoDB
│   ├── models/
│   │   ├── User.js            # Schema người dùng
│   │   ├── Garden.js          # Schema vườn cây
│   │   ├── Log.js             # Schema nhật ký
│   │   ├── Expense.js         # Schema chi phí
│   │   ├── Prediction.js      # Schema dự đoán
│   │   ├── Disease.js         # Schema bệnh
│   │   ├── Season.js          # Schema mùa vụ
│   │   └── Task.js            # Schema công việc
│   ├── routes/                # API routes
│   ├── controllers/           # Business logic với RBAC
│   └── app.js                 # Điểm vào chính
├── package.json               # Dependencies
├── .env.example               # Biến môi trường mẫu
├── .gitignore                 # Bỏ qua git
└── README.md                  # File này
```

## 🔐 Luồng Bảo Mật

```
1. Đăng ký (POST /auth/register)
   Request: {email, mat_khau, ho_ten}
   ↓ [Hash mật khẩu với bcryptjs]
   ↓ [Lưu User với vai_tro="user"]
   Response: {userId, token}

2. Đăng nhập (POST /auth/login)
   Request: {email, mat_khau}
   ↓ [Tìm user theo email]
   ↓ [So sánh mật khẩu]
   ↓ [Tạo JWT token]
   Response: {token, userRole}

3. Gọi API có bảo vệ (GET /gardens)
   Request headers: {Authorization: "Bearer TOKEN"}
   ↓ [authenticateToken middleware]
   ↓ [Verify JWT]
   ↓ [Lấy userId từ payload]
   ↓ [Kiểm tra RBAC]
   ✓ Truy cập được (200 OK)
   ✗ Lỗi quyền (403 Forbidden)
```

## 📊 Cài đặt

### 1. Prerequisites
- Node.js (v14+)
- MongoDB (local hoặc Atlas)
- npm hoặc yarn

### 2. Cài đặt dependencies
```bash
cd backend
npm install
```

### 3. Cấu hình biến môi trường
```bash
cp .env.example .env
```

Sau đó chỉnh sửa `.env`:
```
MONGO_URI=mongodb://localhost:27017/vuon-cay-db
PORT=3000
NODE_ENV=development
JWT_SECRET=secret123
```
```

### 4. Chạy server

**Development (với auto-reload)**:
```bash
npm run dev
```

**Production**:
```bash
npm start
```

Server sẽ khởi động tại `http://localhost:3000`

## 🔗 Chạy hệ thống đầy đủ (3 Terminal)

### Terminal 1: MongoDB

**Windows:**
```bash
net start MongoDB
```

**Mac/Linux:**
```bash
mongod
```

### Terminal 2: Backend (Node.js)

```bash
cd backend
npm install  # Lần đầu
npm run dev  # Start server
```

**Expected output:**
```
✓ Server chạy trên http://localhost:3000
✓ Kết nối MongoDB thành công!
```

### Terminal 3: ML API (Python/Flask)

```bash
cd ml
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate    # Mac/Linux

pip install -r requirements.txt

# Lần đầu: Tạo dữ liệu & train model
python create_sample_data.py
python train_model.py

# Chạy Flask API
python app.py
```

**Expected output:**
```
📍 API chạy tại: http://localhost:5000
📌 Endpoint predict: http://localhost:5000/api/predict
```

### Test toàn bộ hệ thống

**Upload ảnh & Dự đoán (Postman):**

```
Method: POST
URL: http://localhost:3000/api/predict
Headers: Authorization: Bearer <JWT_TOKEN>
Body (form-data):
  - image: <file ảnh>
  - garden_id: <ID vườn>
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

### Vườn cây
- `GET /api/gardens` - Danh sách vườn
- `POST /api/gardens` - Tạo vườn
- `PUT /api/gardens/:id` - Cập nhật vườn
- `DELETE /api/gardens/:id` - Xóa vườn

### Nhật ký
- `POST /api/logs` - Thêm nhật ký
- `GET /api/logs/:garden_id` - Lấy nhật ký

### Chi phí
- `POST /api/expenses` - Thêm chi phí
- `GET /api/expenses/:garden_id` - Lấy chi phí

### 🤖 **Dự đoán Bệnh** (Backend ↔ ML API)
- `POST /api/predict` - Upload ảnh & dự đoán
  - Input: form-data (image, garden_id)
  - Output: Bệnh tiếng Việt + Độ tin cậy
  - Lưu vào DB + Trả kết quả

### Danh sách bệnh
- `GET /api/diseases` - Danh sách bệnh

### Công việc
- `GET /api/tasks` - Danh sách công việc

---

## 🧪 Test API Chi Tiết

### 1️⃣ Đăng ký tài khoản

**Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/register`
- Headers: `Content-Type: application/json`
- Body (JSON):
```json
{
  "username": "farmer01",
  "email": "farmer01@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "farmer01",
    "email": "farmer01@example.com"
  }
}
```

---

### 2️⃣ Đăng nhập

**Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/login`
- Body (JSON):
```json
{
  "email": "farmer01@example.com",
  "mat_khau": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "farmer01",
    "email": "farmer01@example.com"
  }
}
```

💾 **Lưu token này** → Sử dụng trong các request tiếp theo!

---

### 3️⃣ Tạo Vườn Cây

**Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/gardens`
- Headers:
  - `Authorization: Bearer <YOUR_TOKEN>`
  - `Content-Type: application/json`
- Body (JSON):
```json
{
  "ten_vuon": "Vườn cam",
  "dien_tich": 5,
  "don_vi": "hectare",  // Hoặc "m²" / "công"
  "dia_chi": "Tây Ninh",
  "loai_cay": "cam",
  "so_cay": 500
}
```

**Response:**
```json
{
  "success": true,
  "garden": {
    "id": "507f191e810c19729de860ea",
    "ten_vuon": "Vườn cam Bắc Tây Ninh",
    "dia_diem": "Tây Ninh",
    "dien_tich": 5,
    "loai_cay": "cam",
    "so_cay": 500,
    "ngay_tao": "2026-03-27T10:30:00Z"
  }
}
```

💾 **Lưu garden ID** → Dùng cho các request tiếp theo!

---

### 4️⃣ Lấy Danh Sách Vườn

**cURL:**
```bash
curl -X GET http://localhost:3000/api/gardens \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR..."
```

**Postman:**
- Method: `GET`
- URL: `http://localhost:3000/api/gardens`
- Headers: `Authorization: Bearer <YOUR_TOKEN>`

**Response:**
```json
{
  "success": true,
  "gardens": [
    {
      "id": "507f191e810c19729de860ea",
      "ten_vuon": "Vườn cam Bắc Tây Ninh",
      "dia_diem": "Tây Ninh",
      "dien_tich": 5,
      "loai_cay": "cam",
      "so_cay": 500,
      "ngay_tao": "2026-03-27T10:30:00Z"
    }
  ]
}
```

---

### 5️⃣ Dự Đoán Bệnh (Upload Ảnh)

**Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/predict`
- Headers: `Authorization: Bearer <YOUR_TOKEN>`
- Body → form-data:
  - Key: `image` | Value: Chọn file ảnh
  - Key: `garden_id` | Value: `507f191e810c19729de860ea`

**Process:**
```
1. Backend nhận ảnh
2. Gửi tới Flask API (http://localhost:5000/api/predict)
3. Nhận kết quả từ ML
4. Lưu vào MongoDB
5. Trả response cho client
```

**Response:**
```json
{
  "success": true,
  "prediction": {
    "id": "507f191e810c19729de860eb",
    "garden_id": "507f191e810c19729de860ea",
    "benh": "Bệnh loét",
    "benh_en": "canker",
    "do_tin_cay": 92.45,
    "top_3": [
      {
        "benh": "Bệnh loét",
        "do_tin_cay": 92.45
      },
      {
        "benh": "Bệnh đốm đen",
        "do_tin_cay": 5.23
      },
      {
        "benh": "Bệnh nấm melanose",
        "do_tin_cay": 2.32
      }
    ],
    "ngay_du_doan": "2026-03-27T10:35:00Z"
  }
}
```

---

### 6️⃣ Thêm Nhật Ký Canh Tác`

**Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/logs`
- Headers: `Authorization: Bearer <YOUR_TOKEN>`
- Body (JSON):
```json
{
  "garden_id": "507f191e810c19729de860ea",
  "hoat_dong": "Tưới nước",
  "ghi_chu": "Tưới nước sáng, chiều 2 lần",
  "ngay": "2026-03-27"
}
```

**Response:**
```json
{
  "success": true,
  "log": {
    "id": "507f191e810c19729de860ec",
    "garden_id": "507f191e810c19729de860ea",
    "hoat_dong": "Tưới nước",
    "ghi_chu": "Tưới nước sáng, chiều 2 lần",
    "ngay": "2026-03-27",
    "ngay_tao": "2026-03-27T10:40:00Z"
  }
}
```

---

### 7️⃣ Thêm Chi Phí

**Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/expenses`
- Body (JSON):
```json
{
  "garden_id": "507f191e810c19729de860ea",
  "loai": "Phân bón",
  "chi_phi": 500000,
  "ghi_chu": "Mua phân bón hữu cơ",
  "ngay": "2026-03-27"
}
```

**Response:**
```json
{
  "success": true,
  "expense": {
    "id": "507f191e810c19729de860ed",
    "garden_id": "507f191e810c19729de860ea",
    "loai": "Phân bón",
    "chi_phi": 500000,
    "ghi_chu": "Mua phân bón hữu cơ",
    "ngay": "2026-03-27",
    "ngay_tao": "2026-03-27T10:45:00Z"
  }
}
```

---

### 8️⃣ Lấy Danh Sách Bệnh (Từ ML API)

**cURL:**
```bash
curl -X GET http://localhost:3000/api/diseases \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR..."
```

**Postman:**
- Method: `GET`
- URL: `http://localhost:3000/api/diseases`

**Response:**
```json
{
  "success": true,
  "diseases": [
    {
      "id": 0,
      "ten_benh": "Bệnh đốm đen",
      "ten_benh_en": "black_spot",
      "mo_ta": "Bệnh do nấm gây ra, xuất hiện trên lá"
    },
    {
      "id": 1,
      "ten_benh": "Bệnh loét",
      "ten_benh_en": "canker",
      "mo_ta": "Bệnh do vi khuẩn gây ra"
    },
    {
      "id": 2,
      "ten_benh": "Thiếu dinh dưỡng",
      "ten_benh_en": "deficiency",
      "mo_ta": "Cây thiếu các chất dinh dưỡng"
    }
  ]
}
```

---

### 9️⃣ Cập Nhật Vườn

**cURL:**
```bash
curl -X PUT http://localhost:3000/api/gardens/507f191e810c19729de860ea \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR..." \
  -H "Content-Type: application/json" \
  -d '{
    "ten_vuon": "Vườn cam Bắc Tây Ninh (Update)",
    "dien_tich": 6
  }'
```

**Postman:**
- Method: `PUT`
- URL: `http://localhost:3000/api/gardens/507f191e810c19729de860ea`
- Body (JSON):
```json
{
  "ten_vuon": "Vườn cam Bắc Tây Ninh (Update)",
  "dien_tich": 6
}
```

---

### 🔟 Xóa Vườn

**cURL:**
```bash
curl -X DELETE http://localhost:3000/api/gardens/507f191e810c19729de860ea \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR..."
```

**Postman:**
- Method: `DELETE`
- URL: `http://localhost:3000/api/gardens/507f191e810c19729de860ea`

---

## 📋 Checklist Test Hoàn Chỉnh

```
[ ] 1. Đăng ký tài khoản
[ ] 2. Đăng nhập → Lưu token
[ ] 3. Tạo vườn → Lưu garden ID
[ ] 4. Lấy danh sách vườn
[ ] 5. Cập nhật vườn
[ ] 6. Thêm nhật ký
[ ] 7. Thêm chi phí
[ ] 8. Lấy danh sách bệnh
[ ] 9. Upload ảnh & Dự đoán
[ ] 10. Xóa vườn
```

## ⚠️ Lỗi Thường Gặp

### "Authorization header missing"
**Fix:** Thêm header `Authorization: Bearer <TOKEN>` vào request

### "Invalid token"
**Fix:** Token hết hạn hoặc sai → Đăng nhập lại để lấy token mới

### "Garden not found"
**Fix:** Kiểm tra garden_id có đúng không

### "Connection refused (localhost:5000)"
**Fix:** Flask API chưa chạy → Chạy `python app.py` ở terminal ml/

### "Connection refused (localhost:3000)"
**Fix:** Backend chưa chạy → Chạy `npm run dev` ở terminal backend/

## Cơ sở dữ liệu

### Collections
- **users**: Thông tin người dùng
- **gardens**: Thông tin vườn cây
- **logs**: Nhật ký canh tác
- **expenses**: Chi phí
- **predictions**: Dự đoán bệnh
- **diseases**: Danh sách bệnh
- **seasons**: Mùa vụ
- **tasks**: Danh sách công việc

Chi tiết xem file: `THIET_KE_DATABASE.md`

## Công nghệ sử dụng
- **Express.js**: Web framework
- **Mongoose**: MongoDB ODM
- **bcryptjs**: Mã hóa mật khẩu
- **jsonwebtoken**: JWT authentication
- **multer**: Upload file ảnh
- **axios**: Gọi Flask ML API
- **form-data**: Gửi file tới API
- **dotenv**: Quản lý biến môi trường
- **nodemon**: Auto-reload (dev)

## Ghi chú
- Mô hình dữ liệu được thiết kế đơn giản, dễ mở rộng
- Mật khẩu được mã hóa với bcryptjs
- Tất cả field ngày tháng sử dụng ISO 8601 format

## Nhà phát triển
- Team

## License
MIT
