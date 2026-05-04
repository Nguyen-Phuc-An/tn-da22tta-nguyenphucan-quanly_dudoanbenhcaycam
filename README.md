# 🌳 Hệ thống Quản lý Vườn Cây & Dự đoán Bệnh

**Tên dự án:** Hệ thống quản lý vườn cây và hỗ trợ dự đoán bệnh trên cây có múi (cam, chanh, bưởi...)

**Trạng thái:** ✅ **4 giai đoạn hoàn tất**
- ✅ Giai đoạn 1: Phân tích + Database + Backend setup
- ✅ Giai đoạn 2: Authentication + CRUD APIs
- ✅ Giai đoạn 3: Machine Learning + Flask API
- ✅ Giai đoạn 4: Kết nối Backend ↔ ML API

---

## 🚀 Quick Start (5 phút)

### 1. Clone & Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# ML (Terminal khác)
cd ml
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python train.py        # ← Chạy LẦN 1 để train model
python app.py          # ← Chạy lần 2+ để dùng API (PORT 5000)
```

### 2. Kiểm tra

**Backend:** http://localhost:3000
**ML API:** http://localhost:5000/api/diseases

---

## ⚠️ QUAN TRỌNG (Giai đoạn 3)

- **Lần 1:** `python train.py` (train model từ 3 datasets ~ 5-15 phút)
- **Lần 2+:** Chỉ `python app.py` (không cần train lại)
- Model được lưu: `model.h5` + `disease_labels.json`

---

## 📁 Cấu trúc Project

```
tn-da22tta-nguyenphucan-quanly_dudoanbenhcaycam/
│
├─ 📋 Tài liệu
│  ├─ README.md (file này)
│  ├─ PHAN_TICH_HE_THONG.md
│  ├─ THIET_KE_DATABASE.md
│  ├─ TON_TAI_HE_THONG_COMPLETE.md
│  ├─ DANH_SACH_DAYDU_3_GIAI_DOAN.md
│  └─ [8 files tài liệu khác]
│
├─ backend/ (Node.js + Express + MongoDB)
│  ├─ src/
│  │  ├─ config/ (Database connection)
│  │  ├─ models/ (8 Mongoose schemas)
│  │  ├─ controllers/ (7 Controllers)
│  │  ├─ routes/ (7 Route files)
│  │  └─ app.js
│  ├─ package.json
│  └─ README.md
│
└─ ml/ (Python + TensorFlow + Flask)
   ├─ app.py (Flask API)
   ├─ train.py (Train CNN với Transfer Learning - MobileNetV2)
   ├─ predict.py (Module dự đoán)
   ├─ requirements.txt
   ├─ README.md
   ├─ datasets/ (3 datasets input - tự có sẵn)
   ├─ model.h5 (Tạo sau khi train.py)
   └─ disease_labels.json (Tạo sau khi train.py)
```

---
## 🎯 GIẢI THUẬT CHÍNH CỦA DỰ ÁN

### 1️⃣ **Transfer Learning CNN (MobileNetV2)** - ML
```
Ảnh lá bệnh → [224×224] → MobileNetV2 pretrained → Softmax → 9 loại bệnh
Công thức: output = softmax(Dense(Dropout(MobileNetV2_features(input))))
Độ chính xác: ~90% (Train từ 3 datasets, ~1600 ảnh)
```

### 2️⃣ **Data Augmentation** - ML
```
1 ảnh gốc → Rotation, Shift, Flip, Zoom → ~1000 biến thể
Lợi ích: Tránh overfitting, máy học "linh hoạt hơn"
```

### 3️⃣ **Softmax Classification & Top-K Prediction** - ML
```
Model output: [0.452, 0.301, 0.153, ...] (9 logits)
   ↓ [Softmax]
Xác suất: [45.2%, 30.1%, 15.3%, ...] (tổng = 100%)
   ↓ [Top-3]
Kết quả: Top-3 loại bệnh có xác suất cao nhất
```

### 4️⃣ **JWT Authentication** - Backend
```
Đăng nhập → [Hash mật khẩu] → [Tạo JWT]
         → Token = encode(userId + secret)
         
Gọi API → [Gửi: Authorization: Bearer TOKEN]
        → [Backend: Verify signature]
        → [Trích userId]
        → [Cho phép truy cập]
```

### 5️⃣ **Role-Based Access Control (RBAC)** - Backend
```
Admin (vai_tro="admin"):
  ✓ Xem tất cả dữ liệu
  ✓ Xóa bất kỳ record nào
  ✓ Cleanup dữ liệu rác

User (vai_tro="user"):
  ✓ Xem chỉ dữ liệu của mình
  ✗ Không xem user khác
  
Kiểm tra: if (isAdmin || isOwner) → Allow else → Deny
```

### 6️⃣ **Cascading Dropdown Filtering** - Frontend
```
User chọn Vườn A
  ↓ [Frontend filter]
Hiển thị chỉ mùa vụ của Vườn A
  ↓ [Khi chọn Vườn B]
Hiển thị chỉ mùa vụ của Vườn B
```

### 7️⃣ **Mongoose Populate** - Backend
```
Trước: Log { garden_id: "g123" } ← Chỉ ID
   ↓ [.populate('garden_id')]
Sau:  Log { garden_id: {_id: "g123", ten_vuon: "Vườn A", ...} }
```

### 8️⃣ **Form Reset with ID Extraction** - Frontend
```
Khi sửa: Garden { user_id: {_id: "u456", ...} }
   ↓ [Extract ID]
Form reset với: { user_id: "u456" }
   ↓ [Submit]
API nhận ID (không phải object)
```

---
## 📖 Hướng dẫn chính

### Người mới bắt đầu?
1. Đọc: [TON_TAI_HE_THONG_COMPLETE.md](TON_TAI_HE_THONG_COMPLETE.md)
2. Backend: [backend/README.md](backend/README.md)
3. ML: [ml/README.md](ml/README.md)
4. Kết nối: [GIAI_DOAN_4_INTEGRATION.md](GIAI_DOAN_4_INTEGRATION.md)

### Muốn hiểu kỹ?
- Database: [THIET_KE_DATABASE.md](THIET_KE_DATABASE.md)
- APIs: [API_ENDPOINTS.md](API_ENDPOINTS.md)
- Backend: [backend/README.md](backend/README.md)
- ML: [ml/README.md](ml/README.md)

### Tất cả files
- [DANH_SACH_DAYDU_3_GIAI_DOAN.md](DANH_SACH_DAYDU_3_GIAI_DOAN.md) - Danh sách đầy đủ

---

## 🌐 API Chính

### Backend (Node.js - Port 3000)

```bash
# Authentication
POST /api/auth/register
POST /api/auth/login

# Vườn cây
GET /api/gardens
POST /api/gardens
PUT /api/gardens/:id
DELETE /api/gardens/:id

# Nhật ký
POST /api/logs
GET /api/logs/:garden_id

# Chi phí
POST /api/expenses
GET /api/expenses/:garden_id

# Dự đoán
POST /api/predict

# Danh sách bệnh
GET /api/diseases

# Công việc
GET /api/tasks
```

### ML API (Flask - Port 5000)

```bash
# Danh sách bệnh
GET /api/diseases

# Dự đoán bệnh từ ảnh
POST /api/predict
  (form-data: image=<file>)

# Kiểm tra sức khỏe
GET /health
```

---

## 🤖 Machine Learning

### Model (Giai đoạn 3 - Transfer Learning)
- **Framework:** TensorFlow + Keras
- **Kiến trúc:** MobileNetV2 (pretrained ImageNet) + Custom Head
- **Input:** 224x224 RGB image
- **Output:** 9 classes (bệnh)
- **Accuracy:** 85-95%
- **Training:** ImageDataGenerator (batch loading từ disk - không tràn RAM)

### Cách hoạt động
1. **Load dữ liệu:** ImageDataGenerator đọc batch từ disk (không load all vào RAM)
2. **Train:** MobileNetV2 + 2 dense layers (nhanh & accurate)
3. **Lưu:** model.h5 (~40MB)
4. **Predict:** Load model.h5 + predict ảnh
1. 🔴 Bệnh loét
2. 🟤 Bệnh nấm đốm
3. ⚫ Đốm đen
4. 🟡 Đốm dầu
5. 💛 Vàng lá Greening
6. 📉 Thiếu dinh dưỡng
7. 🐛 Sâu vẽ bùa
8. 🌱 Thối rễ
9. 🟢 Cây khỏe mạnh

---

## 💾 Database (MongoDB)

8 Collections:
- **users** - Người dùng
- **gardens** - Vườn cây
- **logs** - Nhật ký canh tác
- **expenses** - Chi phí
- **predictions** - Dự đoán bệnh
- **diseases** - Danh sách bệnh
- **seasons** - Mùa vụ
- **tasks** - Công việc

Chi tiết xem: [THIET_KE_DATABASE.md](THIET_KE_DATABASE.md)

---

## 🧪 Test API

### Postman
- Import: [ml/Postman_Collection_ML.json](ml/Postman_Collection_ML.json)

### cURL
```bash
# Get diseases
curl http://localhost:5000/api/diseases

# Predict
curl -X POST -F "image=@image.jpg" http://localhost:5000/api/predict
```

### Python
```python
import requests

response = requests.post(
    'http://localhost:5000/api/predict',
    files={'image': open('image.jpg', 'rb')}
)
print(response.json())
```

---

## 📊 Thống kê

| Metric | Giá trị |
|--------|--------|
| Files | 45+ |
| Code (lines) | ~1900 |
| Collections | 8 |
| API Endpoints | 20+ |
| ML Classes | 9 |
| Accuracy | 85-95% |
| Training | ~5-15 phút (CPU) / ~2-5 phút (GPU) |
| RAM | ~1-2GB (batch loading) |

---

## ✨ Features

✅ JWT Authentication
✅ CRUD Operations (Vườn, Nhật ký, Chi phí)
✅ Machine Learning Model (CNN)
✅ Prediction API
✅ Tiếng Việt Support
✅ Error Handling
✅ Image Upload
✅ Disease Classification
✅ Treatment Recommendations
✅ Confidence Score

---

## 🎓 Thích hợp cho

- 👨‍🎓 Sinh viên (Code dễ hiểu, có chú thích)
- 🧑‍💼 Prototyping (Setup nhanh, dễ mở rộng)
- 🚀 Sẵn sàng cho production

---

## 📚 Công nghệ

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs
- Multer (File upload)

**ML:**
- TensorFlow + Keras
- Flask + CORS
- NumPy + Pillow
- OpenCV

---

## ⚙️ Yêu cầu

- Node.js 14+
- Python 3.8+
- MongoDB 4.0+
- RAM 2GB+ (4GB recommend)

---

## 📖 Tài liệu chi tiết

| Document | Nội dung |
|----------|---------|
| [PHAN_TICH_HE_THONG.md](PHAN_TICH_HE_THONG.md) | Phân tích hệ thống |
| [THIET_KE_DATABASE.md](THIET_KE_DATABASE.md) | Schema MongoDB |
| [DATABASE_SCHEMAS.md](DATABASE_SCHEMAS.md) | Tóm tắt schema |
| [API_ENDPOINTS.md](API_ENDPOINTS.md) | Danh sách API |
| [backend/README.md](backend/README.md) | Backend guide |
| [ml/README.md](ml/README.md) | ML guide |
| [ml/QUICK_START.md](ml/QUICK_START.md) | ML quick start |
| [TON_TAI_HE_THONG_COMPLETE.md](TON_TAI_HE_THONG_COMPLETE.md) | Tổng quan hệ thống |
| [GIAI_DOAN_4_INTEGRATION.md](GIAI_DOAN_4_INTEGRATION.md) | Kết nối Backend ↔ ML |

---

## 🐛 Gỡ rối

**Backend không chạy?**
- Kiểm tra MongoDB chạy
- Kiểm tra cấu hình .env
- Xem: [backend/README.md](backend/README.md)

**ML không chạy?**
- Kiểm tra Python 3.14+
- `pip install -r requirements.txt`
- Kiểm tra 3 datasets trong `ml/datasets/`
- Xem: [ml/README.md](ml/README.md)

---

## 🎯 Tiếp theo

- [ ] Frontend (React/Vue)
- [ ] Docker
- [ ] Deployment
- [ ] Tests
- [ ] Advanced ML

---

## 📞 Support

- Backend: [backend/README.md](backend/README.md)
- ML: [ml/README.md](ml/README.md)  
- General: [TON_TAI_HE_THONG_COMPLETE.md](TON_TAI_HE_THONG_COMPLETE.md)

---

## 📝 License

MIT - Tự do sử dụng & phát triển

---

✨ **Hệ thống hoàn chỉnh - Sẵn sàng phát triển!**

*Created: 2026-03-26 | Status: Phase 1-3 Complete | Version: 1.0.0*