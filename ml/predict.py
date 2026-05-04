"""
Dự đoán bệnh cây từ ảnh
Load model.h5 và trả kết quả tiếng Việt

╔════════════════════════════════════════════════════════════════════════════╗
║                  🎯 QUY TRÌNH DỰ ĐOÁN CHI TIẾT                             ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║ INPUT: user.jpg (bất kỳ size, RGB)                                        ║
║   ↓                                                                        ║
║ 1. IMAGE PREPROCESSING (preprocess_image)                                 ║
║    - Mở ảnh: PIL.Image.open()                                             ║
║    - Convert RGB: .convert("RGB")                                         ║
║    - Resize: 224×224 (yêu cầu của MobileNetV2)                            ║
║    - Normalize: pixel / 255 → [0, 1]                                      ║
║    - Add batch: shape = (1, 224, 224, 3)                                  ║
║   ↓                                                                        ║
║ 2. CNN INFERENCE (model.predict)                                          ║
║    - Đầu vào: ảnh [1, 224, 224, 3]                                        ║
║    - Đi qua MobileNetV2 (10 triệu parameters)                             ║
║    - Output logits: [9] → logits cho 9 loại bệnh                          ║
║   ↓                                                                        ║
║ 3. SOFTMAX CONVERSION                                                      ║
║    - Công thức: P(i) = exp(logit[i]) / Σ(exp(logit[j]))                  ║
║    - Kết quả: Xác suất chuẩn hóa [0-100%], tổng = 100%                    ║
║    - argmax() → tìm loại bệnh có xác suất cao nhất                         ║
║   ↓                                                                        ║
║ 4. TOP-K PREDICTION (get_top_3)                                            ║
║    - Sắp xếp 9 loại bệnh giảm dần theo xác suất                           ║
║    - Lấy top-3: [P1 ≥ P2 ≥ P3]                                            ║
║    - Lợi ích: Nếu P1=35%, P2=32%, không 100% tin kết quả                  ║
║   ↓                                                                        ║
║ 5. LABEL TRANSLATION                                                      ║
║    - English: "black_spot"                                                ║
║    - Vietnamese: "Bệnh đốm đen"                                           ║
║    - Từ disease_labels.json                                               ║
║   ↓                                                                        ║
║ OUTPUT: JSON                                                               ║
║   {                                                                        ║
║     "disease_en": "black_spot",                                           ║
║     "disease_vi": "Bệnh đốm đen",                                         ║
║     "confidence": 78.45,                                                  ║
║     "top_3": [                                                            ║
║       {"disease_vi": "Bệnh đốm đen", "confidence": 78.45},                ║
║       {"disease_vi": "Bệnh loét", "confidence": 15.30},                   ║
║       {"disease_vi": "Thiếu dinh dưỡng", "confidence": 4.25}              ║
║     ]                                                                      ║
║   }                                                                        ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
"""

import os
import json
import numpy as np
from PIL import Image
import tensorflow as tf

# ============================================================================
# CẤUNHẠC
# ============================================================================

MODEL_PATH = "model.h5"
LABEL_FILE = "disease_labels.json"
IMG_SIZE = 224

# ============================================================================
# LOAD MODEL VÀ LABEL
# ============================================================================

def load_model_and_labels():
    """Load model và mapping nhãn"""
    
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"❌ Không tìm thấy model: {MODEL_PATH}")
    
    if not os.path.exists(LABEL_FILE):
        raise FileNotFoundError(f"❌ Không tìm thấy label file: {LABEL_FILE}")
    
    print(f"📥 Load model: {MODEL_PATH}")
    model = tf.keras.models.load_model(MODEL_PATH)
    
    print(f"📥 Load labels: {LABEL_FILE}")
    with open(LABEL_FILE, "r", encoding="utf-8") as f:
        labels = json.load(f)
    
    return model, labels


# ============================================================================
# TIỀN XỬ LÝ ẢNH
# ============================================================================

def preprocess_image(image_path):
    """Tiền xử lý ảnh giống như train"""
    
    img = Image.open(image_path).convert("RGB")
    img = img.resize((IMG_SIZE, IMG_SIZE))
    img_array = np.array(img, dtype=np.float32) / 255.0
    img_array = np.expand_dims(img_array, axis=0)  # Thêm batch dimension
    
    return img_array


# ============================================================================
# DỰ ĐOÁN
# ============================================================================

def predict(image_path, model, labels):
    """Dự đoán bệnh từ ảnh"""
    
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"❌ Không tìm thấy ảnh: {image_path}")
    
    # Tiền xử lý
    img_array = preprocess_image(image_path)
    
    # Dự đoán
    predictions = model.predict(img_array, verbose=0)
    pred_idx = np.argmax(predictions[0])
    confidence = predictions[0][pred_idx] * 100
    
    # Lấy tên bệnh
    disease_en = labels["classes"][pred_idx]
    disease_vi = labels["class_vi"][disease_en]
    
    return {
        "disease_en": disease_en,
        "disease_vi": disease_vi,
        "confidence": round(confidence, 2),
        "top_3": get_top_3(predictions[0], labels)
    }


def get_top_3(predictions, labels):
    """Lấy 3 dự đoán hàng đầu"""
    
    top_3_idx = np.argsort(predictions)[::-1][:3]
    top_3 = []
    
    for idx in top_3_idx:
        disease_en = labels["classes"][idx]
        disease_vi = labels["class_vi"][disease_en]
        top_3.append({
            "disease_en": disease_en,
            "disease_vi": disease_vi,
            "confidence": round(float(predictions[idx] * 100), 2)
        })
    
    return top_3


# ============================================================================
# TEST (Chạy trực tiếp)
# ============================================================================

if __name__ == "__main__":
    try:
        # Load model
        model, labels = load_model_and_labels()
        print("✓ Model sẵn sàng!\n")
        
        # Test ảnh (nếu có)
        test_image = "test_image.jpg"  # Chỉnh sửa đường dẫn nếu cần
        
        if os.path.exists(test_image):
            print(f"🔍 Dự đoán: {test_image}")
            result = predict(test_image, model, labels)
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print("💡 Để test, hãy tạo biến result = predict(image_path, model, labels)")
            print(f"💡 Hoặc dùng Flask app.py")
        
    except Exception as e:
        print(f"❌ LỖI: {e}")
        import traceback
        traceback.print_exc()
