# 🤖 Giai đoạn 3: Machine Learning - Dự đoán Bệnh Cây Có Múi

## 📁 Cấu trúc

```
ml/
├── train.py              # Script huấn luyện model CNN
├── predict.py            # Module dự đoán bệnh từ ảnh
├── app.py                # Flask API (POST /predict)
├── requirements.txt      # Dependencies
├── datasets/             # 3 dataset bệnh (đã có sẵn)
├── models/               # Thư mục lưu model.h5 (tự tạo)
└── uploads/              # Ảnh tạm khi API predict
```

## 🎯 Các Giải Thuật Sử Dụng

### 1. TRANSFER LEARNING - MobileNetV2 (train.py)
**Mục đích**: Học các đặc trưng từ model được huấn luyện trên ImageNet, sau đó fine-tune trên dataset bệnh cây

**Các bước**:
- Load model MobileNetV2 pretrained (weights từ ImageNet)
- Đóng băng (freeze) các layer cơ bản để giữ nguyên đặc trưng
- Thêm Dropout (0.5) để tránh overfitting
- Thêm Dense layer (128 units, ReLU activation)
- Thêm Output layer (9 units, Softmax) cho 9 loại bệnh

**Công thức**:
```
output = softmax(Dense_128(Dropout(MobileNetV2_features(input_image))))
```

**Lợi ích**: 
- Giảm thời gian huấn luyện từ giờ xuống phút
- Cần ít dữ liệu hơn (chỉ ~1000 ảnh/loại bệnh)
- Độ chính xác cao ngay từ đầu (>90%)

---

### 2. DATA AUGMENTATION - ImageDataGenerator (train.py)
**Mục đích**: Tạo ra các biến thể của ảnh gốc để tránh overfitting

**Các phép biến đổi** (trong quá trình training):
- Rotation: Xoay ±20 độ (mô phỏng ảnh chụp từ góc khác)
- Width/Height Shift: Dịch chuyển 20% (mô phỏng lá ở các vị trí khác)
- Horizontal Flip: Lật ngang (lá có thể được chụp từ hai bên)
- Zoom: Phóng to/thu nhỏ 20% (mô phỏng khoảng cách chụp khác)
- Rescale: Chuẩn hóa giá trị pixel [0-255] → [0-1]

**Kết quả**: Từ 1 ảnh gốc, tạo ~1000 biến thể khác nhau

---

### 3. IMAGE PREPROCESSING - Chuẩn hóa Ảnh (predict.py)
**Mục đích**: Chuyển ảnh thô thành định dạng model cần

**Các bước**:
```
Ảnh gốc (RGB, bất kỳ size) 
  ↓ [Resize] 
Ảnh 224x224 
  ↓ [Convert to Array] 
Mảng [224, 224, 3] 
  ↓ [Normalize] 
Mảng giá trị [0, 1] 
  ↓ [Add Batch Dimension] 
Mảng [1, 224, 224, 3] (sẵn sàng dự đoán)
```

**Công thức chuẩn hóa**: `pixel_normalized = pixel_original / 255.0`

---

### 4. SOFTMAX CLASSIFICATION (predict.py)
**Mục đích**: Chuyển đổi logits thành xác suất (0-100%)

**Công thức**:
```
P(class_i) = exp(logit_i) / Σ(exp(logit_j)) cho j=1..9
Xác suất(%) = P(class_i) × 100
```

**Kết quả**: 9 giá trị xác suất, mỗi loại bệnh từ 0-100%, tổng = 100%

**Ví dụ**:
```
Bệnh đốm đen:          45.2%
Bệnh loét:            30.1%
Bệnh vàng lá gân xanh: 15.3%
...
```

---

### 5. TOP-K PREDICTIONS (predict.py)
**Mục đích**: Trả về K dự đoán hàng đầu, không chỉ kết quả tốt nhất

**Thuật toán**:
1. Tính xác suất cho 9 loại bệnh
2. Sắp xếp giảm dần: [P1≥P2≥P3≥...]
3. Lấy top-3 (K=3)

**Lợi ích**:
- Cho phép bác sĩ xem các khả năng khác
- Nếu P1=35%, P2=32%, P3=31%, không nên tin 100% vào P1
- Có thể kết hợp với các kiểm tra khác

---

### 6. DATASET NORMALIZATION - Gộp & Chuẩn Hóa (train.py)
**Mục đích**: Quy đổi 3 dataset khác nhau về 9 loại bệnh chuẩn

**Bảng ánh xạ**:
```
Dataset 1 "Black spot"            → black_spot
Dataset 2 "Citrus_Canker_..."     → canker
Dataset 3 "huanglongbing"         → greening
... (9 loại tổng)
```

**Tạo cấu trúc chuẩn**:
```
organized_dataset/
├── black_spot/           (160 ảnh)
├── canker/              (250 ảnh)
├── greening/            (180 ảnh)
├── healthy/             (500 ảnh)
├── melanose/            (120 ảnh)
├── deficiency/          (140 ảnh)
├── greasy_spot/         (90 ảnh)
├── leafminer/           (75 ảnh)
└── multiple/            (100 ảnh)
   Tổng: ~1615 ảnh
```

---

### 7. BATCH LOADING - Tải Dữ Liệu Hiệu Quả (train.py)
**Mục đích**: Tải dữ liệu từ disk theo batch, không load toàn bộ vào RAM

**Quy trình**:
```
Epoch 1:
  Batch 1: Load 32 ảnh từ disk → train
  Batch 2: Load 32 ảnh từ disk → train
  ...
Epoch 2:
  Batch 1: Load 32 ảnh từ disk (có augmentation khác) → train
  ...
```

**Lợi ích**:
- Hemat RAM (chỉ cần chứa 32 ảnh, không 1615)
- Mỗi epoch, ảnh được augment khác nhau (tăng đa dạng)
- Cho phép training trên máy tính yếu

---

### 8. TRAIN/VAL SPLIT - Chia Tập Dữ Liệu (train.py)
**Mục đích**: Đánh giá model có overfitting không

**Tỷ lệ**:
- 80% Training (~1290 ảnh)
- 20% Validation (~325 ảnh)

**Quy trình mỗi epoch**:
1. Huấn luyện trên 80%
2. Đánh giá độ chính xác trên 20%
3. Nếu val_loss tăng liên tục → overfitting → dừng sớm

---

## 📊 Hiệu Suất Kỳ Vọng

| Loại Bệnh | Độ Chính Xác | Top-3 Accuracy |
|-----------|-------------|----------------|
| Healthy   | 98%        | 99%            |
| Black Spot| 92%        | 96%            |
| Canker    | 89%        | 94%            |
| Greening  | 88%        | 92%            |
| Deficiency| 85%        | 90%            |
| **Trung Bình** | **90.4%** | **94.2%** |

## 🚀 Cài đặt & Chạy

### 1. Python v3.14+

```bash
python --version
```

**Note:** Python 3.14 hỗ trợ TensorFlow 2.16 tốt hơn 2.13.

### 2. Virtual Environment (Khuyên)

```bash
cd ml

# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Cài Dependencies

```bash
pip install -r requirements.txt
```

**Lỗi lạ?** Thử upgrade pip:
```bash
pip install --upgrade pip
```

### 4. Train Model (Chỉ cần chạy LẦN ĐẦU TIÊN)

```bash
python train.py
```

⚠️ **QUAN TRỌNG:**
- **Lần 1:** Chạy `python train.py` để train model từ dataset
- **Lần 2+:** KHÔNG cần chạy lại, chỉ cần chạy `python app.py`
- Model sẽ lưu vào: `model.h5` + `disease_labels.json`

**Output:**
```
📂 Đang chuẩn hóa dataset...
✓ Chuẩn hóa xong (organized_dataset)
  Phân bố ảnh:
    - black_spot: 500 ảnh
    - canker: 1200 ảnh
    ... (9 loại bệnh)
  📊 Tổng: 5000+ ảnh

📊 Tạo data generators (80/20 train/val)...
🏗️  Xây dựng model (Transfer Learning - MobileNetV2)...
✓ Model tạo xong (9 classes)

🚀 Huấn luyện 10 epochs...
Epoch 1/10
... training ...
Epoch 10/10
... done ...

💾 Lưu model: model.h5
✓ Lưu mapping: disease_labels.json

📈 KẾT QUẢ TRAINING
========================
📊 Accuracy:
  Train: 92.45%
  Val:   88.32%

📊 Loss:
  Train: 0.2145
  Val:   0.4521

✅ Model đã lưu: model.h5
✅ Label mapping: disease_labels.json
```

**Kết quả:**
- `model.h5` - Model đã train (~40-50 MB)
- `disease_labels.json` - Mapping label (bệnh)
- `organized_dataset/` - Dataset chuẩn hóa

### 5. Chạy Flask API (Lần 1 và các lần sau)

```bash
python app.py
```

**Output:**
```
🚀 KHỞI ĐỘNG FLASK API
======================================================================
📍 API: http://localhost:5000
📌 Endpoint: POST /predict
📌 Danh sách bệnh: GET /api/diseases
======================================================================
```

API sẽ chạy trên `http://localhost:5000`

---

## 📋 Workflow Nhanh

```
LẦN 1 (Setup):
  1. python train.py  (train model)
  2. python app.py    (khởi động API)

LẦN 2+ (Chỉ dùng API):
  1. python app.py    (khởi động API)
  2. Upload ảnh test bằng Postman/curl
```

---

## 🧪 Test API

### A. Test bằng cURL

```bash
# Lấy danh sách bệnh
curl http://localhost:5000/api/diseases

# Dự đoán (upload ảnh)
curl -X POST -F "image=@path/to/image.jpg" http://localhost:5000/predict
```

### B. Test bằng Postman

**1. GET /api/diseases** - Danh sách bệnh
- URL: `http://localhost:5000/api/diseases`
- Method: GET
- Response:
```json
{
  "success": true,
  "diseases": [
    {"en": "black_spot", "vi": "Bệnh đốm đen"},
    {"en": "canker", "vi": "Bệnh loét"},
    ...
  ]
}
```

**2. POST /predict** - Dự đoán bệnh
- URL: `http://localhost:5000/predict`
- Method: POST
- Body → form-data:
  - Key: `image`
  - Value: Chọn file ảnh (.jpg, .png, .gif)
- Response:
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
      },
      {
        "disease_en": "black_spot",
        "disease_vi": "Bệnh đốm đen",
        "confidence": 5.23
      }
    ]
  }
}
```

---

## 🧠 Model Architecture

### Transfer Learning - MobileNetV2

```
MobileNetV2 (pretrained ImageNet)
         ↓
GlobalAveragePooling2D
         ↓
Dense(256) + ReLU
         ↓
Dropout(0.5)
         ↓
Dense(9) + Softmax → Output
```

**Lợi ích:**
- ✅ Pretrained trên ImageNet (1.2M ảnh)
- ✅ Nhanh: Chỉ train 2 layer cuối
- ✅ Accurate: 88-95% accuracy
- ✅ Nhẹ: Model chỉ ~40MB

### Tham số Training

| Thông số | Giá trị |
|---------|--------|
| Input | 224x224x3 |
| Batch Size | 32 |
| Epochs | 10 |
| Optimizer | Adam (lr=1e-3) |
| Loss | Categorical Crossentropy |
| Train/Val Split | 80/20 |
| Data Augmentation | Rotation, Shift, Zoom, Flip |

---

## 📊 Dataset & Chuẩn hóa

### 3 Datasets (gộp lại)

1. **Citrus Leaf Disease Image** (381 ảnh)
   - Black spot, Canker, Greening, Healthy, Melanose

2. **Orange Leaf Disease Dataset** (1500+ ảnh) 
   - Canker, Deficiency, Healthy, Multiple, Young Healthy

3. **Suriname Citrus Fruit Tree** (1200+ ảnh)
   - Deficiency, Greasy Spot, Healthy, Greening, Leafminer, Phytophthora

### Chuẩn hóa nhãn → 9 loại bệnh

| Label | Tiếng Việt |
|-------|-----------|
| canker | Bệnh loét |
| melanose | Bệnh nấm melanose |
| greening | Vàng lá gân xanh |
| black_spot | Đốm đen |
| greasy_spot | Đốm dầu |
| leafminer | Sâu vẽ bùa |
| deficiency | Thiếu dinh dưỡng |
| healthy | Lá khỏe mạnh |
| multiple | Nhiều bệnh |

---

## ⚠️ Gỡ rối

### "tensorflow==2.16.1 not found"
**Fix:** Python 3.14+ hỗ trợ TensorFlow 2.16.1
```bash
python --version  # Kiểm tra version
pip install --upgrade pip  # Upgrade pip
pip install -r requirements.txt  # Cài lại
```

### "No such file or directory: 'datasets'"
**Fix:** Check dataset path
```bash
cd ml
ls datasets/  # Kiểm tra 3 dataset có không
# Phải có 3 folder:
# - Citrus Leaf Disease Image
# - Orange leaf disease dataset
# - Suriname Citrus Fruit Tree
```

### "Model not found" khi chạy app.py
**Fix:** Train model trước
```bash
python train.py  # Tạo model.h5
python app.py    # Sau đó chạy API
```

### "Port 5000 already in use"
**Fix:** Port bị chiếm, tắt process
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Training quá lâu
**Nguyên nhân:**
- CPU yếu
- Dataset lớn
- Epochs cao

**Fix:**
- Giảm epochs: 10 → 5
- Tăng batch size: 32 → 64 (nếu RAM đủ)
- Dùng GPU nếu có

### Model accuracy thấp
**Nguyên nhân:**
- Dataset quá nhỏ
- Ảnh chất lượng kém
- Overfitting

**Fix:**
- Kiểm tra dataset: `ls organized_dataset/`
- Tăng data augmentation
- Tăng epochs để train lâu hơn

---

## 🔗 Kết nối Backend Node.js

### Backend gọi ML API

**File:** `backend/src/controllers/prediction.controller.js`

```javascript
const axios = require('axios');

// Gọi Flask API predict
const mlResponse = await axios.post(
  'http://localhost:5000/predict',
  formData,  // Ảnh đã upload
  { headers: formData.getHeaders() }
);

// Lấy kết quả
const result = mlResponse.data.data;
// {
//   disease_en: "canker",
//   disease_vi: "Bệnh loét",
//   confidence: 92.45,
//   top_3: [...]
// }

// Lưu vào MongoDB
const prediction = new Prediction({
  ket_qua_benh: result.disease_vi,      // Tiếng Việt
  do_tin_cay: result.confidence,        // %
  ...
});
await prediction.save();
```

---

## 📚 Tài liệu

- TensorFlow: https://www.tensorflow.org/
- Flask: https://flask.palletsprojects.com/
- Scikit-learn: https://scikit-learn.org/

---

## 🎯 Workflow Hoàn Chỉnh

### 🔵 LẦN 1 (Setup & Train)

```
Step 1: python train.py
   ├─ Đọc 3 datasets từ ml/datasets/
   ├─ Chuẩn hóa & gộp → organized_dataset/
   ├─ Load batch từ disk (ImageDataGenerator)
   ├─ Train MobileNetV2 (10 epochs)
   ├─ Lưu model.h5 (~40MB)
   └─ Lưu disease_labels.json

Step 2: python app.py
   ├─ Load model.h5 + labels
   └─ Chạy Flask API (port 5000)
```

### 🟢 LẦN 2+ (Chỉ dùng API)

```
Step 1: python app.py
   ├─ Load model.h5 + labels (từ lần 1)
   └─ Chạy Flask API (port 5000)

Step 2: Upload ảnh để predict
   ├─ POST /predict (multipart/form-data)
   └─ Nhận response: Bệnh + % + Top-3
```

### Dữ liệu (một lần & reuse)

```
model.h5                    ← Tạo bởi train.py (lần 1)
disease_labels.json         ← Tạo bởi train.py (lần 1)
organized_dataset/          ← Tạo bởi train.py (lần 1)

App.py sử dụng 2 file này nhiều lần!
```

---

## ✅ Checklist

- [x] Train model từ 3 datasets thực
- [x] Chuẩn hóa 9 loại bệnh
- [x] CNN đơn giản, dễ hiểu
- [x] Flask API POST /predict
- [x] Trả kết quả tiếng Việt
- [x] Không có file thừa
- [x] Code có chú thích Việt

---

## 📝 Ghi chú

- **RAM:** Chỉ cần 1-2GB (load batch từ disk, không load all)
- **CPU training:** ~5-15 phút (tùy số ảnh & hardware)
- **GPU training:** ~2-5 phút
- **Model size:** ~40-50 MB
- **API response:** ~1-3 giây/request (CPU)
- **Accuracy:** 85-95% (MobileNetV2 transfer learning)
- **Lưu ý:** Chỉ cần train 1 lần, các lần sau dùng model.h5

---

*Last updated: 2026-03-27 | Giai đoạn 3 - ML Implementation*

## 🛠️ Cài đặt & Chạy

### 1. Cài đặt Python (v3.8+)

**Windows:**
- Tải từ https://www.python.org/
- Chọn "Add Python to PATH"
- Chạy installer

**Check version:**
```bash
python --version
python -m pip --version
```

### 2. Tạo Virtual Environment (Tùy chọn nhưng khuyên dùng)

```bash
cd ml

# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Cài đặt Dependencies

```bash
pip install -r requirements.txt
```

**Nếu lỗi TensorFlow:** 
- Nếu có GPU: `pip install tensorflow[and-cuda]`
- Nếu CPU only: `pip install tensorflow` (mặc định)

### 4. **QUAN TRỌNG** - Chọn dataset

#### ✅ Cách A: Dữ liệu mẫu (Quick Demo - Khuyên cho test đầu tiên)

```bash
python create_sample_data.py
```

Kết quả: Tạo 180 ảnh mẫu (20 ảnh x 9 loại bệnh) trong `datasets/`

**Output:**
```
✓ Tạo benh_loet: 20 ảnh
✓ Tạo nam_dom: 20 ảnh
... (9 loại bệnh)
```

**Ưu điểm:** Nhanh, đơn giản, dùng để test
**Nhược điểm:** Model accuracy thấp (vì ảnh tổng hợp)

---

#### ✅ Cách B: Dataset Thực (Production - Accuracy cao)

```bash
python download_datasets.py
```

Kết quả: Tải **hàng nghìn ảnh** thực từ Kaggle (4 datasets)

**Output:**
```
✓ Downloading Orange Leaf Disease Dataset...
✓ Downloading Orange Fruit Dataset...
✓ Downloading Citrus Leaf Disease...
✓ Downloading Suriname Citrus...
✓ Tổng cộng: 3000+ ảnh
```

**Ưu điểm:** Ảnh thực, model accuracy cao
**Nhược điểm:** Tải lâu (phụ thuộc internet), cần Kaggle API key

---

**Lựa chọn khuyên:**
- 🚀 **Lần 1:** Dùng Cách A (quick test)
- 📊 **Lần 2+:** Dùng Cách B (dataset thực) để accuracy tốt

### 5. Train Model

```bash
python train_model.py
```

**Quá trình:**
- Load dataset (180 ảnh)
- Tạo CNN model
- Train 10 epochs
- Lưu model vào `models/model_cay_cam.h5`

**Kết quả mong đợi:**
```
✓ Tổng cộng: 180 ảnh
📊 Training: 144 ảnh
   Testing: 36 ảnh
📈 Accuracy: 0.75-0.95 (tùy dữ liệu)
✓ Model lưu tại: models/model_cay_cam.h5
```

### 6. Chạy Flask API

```bash
python app.py
```

**Output:**
```
🚀 KHỞI ĐỘNG FLASK API
📍 API chạy tại: http://localhost:5000
📌 Endpoint predict: http://localhost:5000/api/predict
📌 Danh sách bệnh: http://localhost:5000/api/diseases
```

## 🧪 Test API

### A. Test bằng curl (Command Line)

```bash
# Lấy danh sách bệnh
curl http://localhost:5000/api/diseases

# Predict (upload ảnh)
curl -X POST -F "image=@path/to/image.jpg" http://localhost:5000/api/predict
```

### B. Test bằng Postman

**1. GET /api/diseases**
- Method: GET
- URL: `http://localhost:5000/api/diseases`
- Kết quả: JSON danh sách bệnh

**2. POST /api/predict**
- Method: POST
- URL: `http://localhost:5000/api/predict`
- Body → form-data
  - Key: `image`
  - Value: Chọn file ảnh
- Kết quả: JSON kết quả dự đoán

### Ví dụ Response

```json
{
  "success": true,
  "data": {
    "disease_en": "benh_loet",
    "disease_vi": "Bệnh loét",
    "confidence": 92.45,
    "top_3": [
      {
        "disease_en": "benh_loet",
        "disease_vi": "Bệnh loét",
        "confidence": 92.45
      },
      {
        "disease_en": "nam_dom",
        "disease_vi": "Bệnh nấm đốm",
        "confidence": 5.23
      }
    ],
    "description": {
      "mo_ta": "Bệnh do vi khuẩn gây ra...",
      "trieu_chump": "Vết loét màu cam/nâu...",
      "xu_ly": "Xóa các cây bệnh..."
    }
  }
}
```

## 📊 Thông tin Model

### Kiến trúc

```
Input (224x224x3)
    ↓
Conv2D 32 → MaxPool → Dropout
    ↓
Conv2D 64 → MaxPool → Dropout
    ↓
Conv2D 128 → MaxPool → Dropout
    ↓
Flatten → Dense 256 → Dropout
    ↓
Dense 9 (softmax) → Output
```

### Tham số

| Thông số | Giá trị |
|---------|--------|
| IMG_SIZE | 224x224 |
| BATCH_SIZE | 32 |
| EPOCHS | 10 |
| Optimizer | Adam |
| Loss | sparse_categorical_crossentropy |

## 🔗 Tạo Dataset Thực

### Tải từ Kaggle (Tùy chọn)

```bash
# Thiết lập Kaggle API key: https://www.kaggle.com/account
# Lưu file kaggle.json vào ~/.kaggle/

python download_datasets.py
```

Datasets sẽ được tải:
1. Orange Leaf Disease Dataset
2. Orange Fruit Dataset
3. Citrus Leaf Disease Image
4. Suriname Citrus Fruit Tree

### Chuẩn hóa nhãn

Tất cả ảnh sẽ được map thành 9 nhãn chuẩn:
- `benh_loet` - Bệnh loét
- `nam_dom` - Bệnh nấm đốm
- `dom_den` - Đốm đen
- `dom_dau` - Đốm dầu
- `vang_la_greening` - Vàng lá Greening
- `thieu_dinh_duong` - Thiếu dinh dưỡng
- `sau_ve_bua` - Sâu vẽ bùa
- `thoi_re` - Thối rễ
- `khoe_manh` - Cây khỏe mạnh

## ⚠️ Gỡ rối

### Lỗi: "Module 'tensorflow' not found"
```bash
pip install tensorflow
# Hoặc nếu có GPU
pip install tensorflow[and-cuda]
```

### Lỗi: "Port 5000 already in use"
```bash
# Thay đổi port trong app.py
FLASK_PORT = 5001
```

### Lỗi: "Model not found"
- Chạy `create_sample_data.py` trước
- Sau đó chạy `train_model.py`

### Model accuracy thấp
- Tăng số epochs (hiện tại: 10)
- Tải dataset thực từ Kaggle
- Thêm data augmentation

## 🔗 Kết nối với Backend Node.js

### Backend gọi API predict

**File:** `backend/src/controllers/prediction.controller.js`

```javascript
const axios = require('axios');

exports.predictAll = async (req, res) => {
  try {
    // Upload ảnh...
    
    // Gọi Flask API
    const formData = new FormData();
    formData.append('image', file);
    
    const mlResponse = await axios.post(
      'http://localhost:5000/api/predict',
      formData
    );
    
    // Lưu vào database
    // ...
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Cài đặt CORS

Flask API đã kích hoạt CORS, có thể gọi từ Node.js

## 📚 Tài liệu thêm

- TensorFlow: https://www.tensorflow.org/
- Keras: https://keras.io/
- Flask: https://flask.palletsprojects.com/
- Kaggle: https://www.kaggle.com/datasets

## 🎯 Tiếp theo

1. ✅ Tạo dữ liệu mẫu
2. ✅ Train model
3. ✅ Tạo API Flask
4. ⏳ Kết nối với backend Node.js
5. ⏳ Test toàn bộ hệ thống

## 📝 Ghi chú

- Model được train trên CPU (nhanh, đơn giản để học)
- Để accuracy cao hơn, tải dataset thực từ Kaggle
- Có thể fine-tune model bằng transfer learning (MobileNet, ResNet, vv)
- Lựa chọn GPU nếu có hardware mạnh (NVIDIA GPU + CUDA)
