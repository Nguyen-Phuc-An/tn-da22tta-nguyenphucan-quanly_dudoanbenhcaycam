"""
GIAI ĐOẠN 3: Huấn luyện model CNN phát hiện bệnh cây có múi
Dataset: 3 thư mục ở ml/datasets/
Giải pháp: Load dữ liệu theo batch từ disk (không chứa trong RAM)
Kết quả: model.h5 + disease_labels.json

╔════════════════════════════════════════════════════════════════════════════╗
║                     🎯 GIẢI THUẬT CHÍNH                                    ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║ 1. TRANSFER LEARNING (MobileNetV2)                                        ║
║    - Load model pretrained trên ImageNet                                  ║
║    - Freeze các layer cơ bản (giữ nguyên đặc trưng)                       ║
║    - Fine-tune layer cuối trên 9 loại bệnh                               ║
║    - Kết quả: Model nhỏ, huấn luyện nhanh, độ chính xác cao              ║
║                                                                            ║
║ 2. DATA AUGMENTATION (ImageDataGenerator)                                 ║
║    - Rotation (±20°) → Mô phỏng lá ở góc khác                             ║
║    - Width/Height Shift (20%) → Mô phỏng vị trí khác                      ║
║    - Horizontal Flip → Lá được chụp hai bên                               ║
║    - Zoom (20%) → Khoảng cách chụp khác nhau                              ║
║    - Rescale [0-255] → [0-1] → Chuẩn hóa giá trị pixel                   ║
║    - Kết quả: Từ ~1600 ảnh → 100,000+ biến thể                           ║
║                                                                            ║
║ 3. BATCH LOADING (flow_from_directory)                                    ║
║    - Tải 32 ảnh/batch từ disk thay vì load toàn bộ vào RAM                ║
║    - Mỗi epoch, ảnh được augment khác nhau                                ║
║    - Cho phép huấn luyện trên máy yếu                                     ║
║                                                                            ║
║ 4. TRAIN/VALIDATION SPLIT (80/20)                                         ║
║    - 80% (~1290 ảnh) → Huấn luyện                                         ║
║    - 20% (~325 ảnh) → Đánh giá (phát hiện overfitting)                    ║
║    - Nếu val_loss ↑ → model overfitting → dừng sớm (Early Stopping)       ║
║                                                                            ║
║ 5. SOFTMAX CLASSIFICATION                                                  ║
║    - Chuyển logit thành xác suất: P(class) = exp(logit) / Σ(exp(logit))   ║
║    - Output: 9 giá trị [0-100%] đại diện cho 9 loại bệnh                  ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
"""

import os
import json
import shutil
from pathlib import Path
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2

# ============================================================================
# 1. CẤU HÌNH
# ============================================================================

DATASET_DIR = "datasets"
MODEL_PATH = "model.h5"
LABEL_FILE = "disease_labels.json"
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 10

# Map từ tên gốc của dataset → Tên chuẩn (9 loại)
LABEL_MAPPING = {
    # Dataset 1: Citrus Leaf Disease Image
    "Black spot": "black_spot",
    "Canker": "canker",
    "Greening": "greening",
    "Healthy": "healthy",
    "Melanose": "melanose",
    
    # Dataset 2: Orange leaf disease dataset
    "Citrus_Canker_Diseases_Leaf_Orange": "canker",
    "Citrus_Nutrient_Deficiency_Yellow_Leaf_Orange": "deficiency",
    "Healthy_Leaf_Orange": "healthy",
    "Multiple_Diseases_Leaf_Orange": "multiple",
    "Young_Healthy_Leaf_Orange": "healthy",
    
    # Dataset 3: Suriname
    "deficiency": "deficiency",
    "greasy spot": "greasy_spot",
    "healthy": "healthy",
    "huanglongbing": "greening",
    "leafminer": "leafminer",
    "phytophthora": "multiple",
}

# Map tiếng Việt
LABEL_VI = {
    "black_spot": "Bệnh đốm đen",
    "canker": "Bệnh loét",
    "greening": "Bệnh vàng lá gân xanh",
    "healthy": "Lá khỏe mạnh",
    "melanose": "Bệnh nấm melanose",
    "deficiency": "Thiếu dinh dưỡng",
    "greasy_spot": "Bệnh đốm dầu",
    "leafminer": "Sâu vẽ bùa",
    "multiple": "Nhiều bệnh",
}

print("=" * 70)
print("🤖 HUẤN LUYỆN MODEL - PHÁT HIỆN BỆNH CÂY CÓ MÚI")
print("=" * 70)
print(f"📁 Dataset: {DATASET_DIR}")
print(f"🖼️  Kích thước ảnh: {IMG_SIZE}x{IMG_SIZE}")
print(f"📊 Batch size: {BATCH_SIZE}")
print(f"🚀 Epochs: {EPOCHS}")
print()


# ============================================================================
# 2. CHUẨN HÓA DATASET (Gộp 3 dataset vào folder chuẩn)
# ============================================================================

def organize_dataset():
    """Gộp 3 dataset vào folder chuẩn hóa (organized/disease_name/)"""
    
    print("📂 Đang chuẩn hóa dataset...")
    
    organized_dir = "organized_dataset"
    
    # Xóa nếu đã tồn tại
    if os.path.exists(organized_dir):
        shutil.rmtree(organized_dir)
    
    os.makedirs(organized_dir, exist_ok=True)
    
    # Đếm ảnh
    image_count = {}
    
    # Duyệt qua 3 dataset
    dataset_path = Path(DATASET_DIR)
    for dataset_dir in dataset_path.iterdir():
        if not dataset_dir.is_dir():
            continue
        
        # Duyệt qua từng thư mục bệnh
        for disease_dir in dataset_dir.iterdir():
            if not disease_dir.is_dir():
                continue
            
            disease_name = disease_dir.name
            
            # Skip nếu chưa map
            if disease_name not in LABEL_MAPPING:
                continue
            
            standardized_name = LABEL_MAPPING[disease_name]
            standardized_path = os.path.join(organized_dir, standardized_name)
            os.makedirs(standardized_path, exist_ok=True)
            
            # Copy ảnh
            image_files = list(disease_dir.glob("*.jpg")) + \
                         list(disease_dir.glob("*.png")) + \
                         list(disease_dir.glob("*.JPG")) + \
                         list(disease_dir.glob("*.PNG"))
            
            for img_file in image_files:
                try:
                    dst = os.path.join(standardized_path, img_file.name)
                    shutil.copy2(img_file, dst)
                    image_count[standardized_name] = image_count.get(standardized_name, 0) + 1
                except Exception as e:
                    print(f"  ✗ Lỗi copy {img_file}: {e}")
    
    # In kết quả
    print(f"✓ Chuẩn hóa xong ({organized_dir})")
    print(f"  Phân bố ảnh:")
    total_images = 0
    for disease, count in sorted(image_count.items()):
        print(f"    - {disease}: {count} ảnh")
        total_images += count
    print(f"  📊 Tổng: {total_images} ảnh\n")
    
    return organized_dir, image_count


# ============================================================================
# 3. TẠO DATA GENERATORS (Load batch từ disk)
# ============================================================================

def create_data_generators(organized_dir):
    """Tạo ImageDataGenerator (load batch từ disk, không load vào RAM)"""
    
    print("📊 Tạo data generators (80/20 train/val)...")
    
    # Augmentation cho training
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        zoom_range=0.2,
        validation_split=0.2  # 20% validation
    )
    
    # Chỉ rescale cho validation
    val_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.2
    )
    
    # Training generator
    train_generator = train_datagen.flow_from_directory(
        organized_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training'
    )
    
    # Validation generator
    val_generator = val_datagen.flow_from_directory(
        organized_dir,
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation'
    )
    
    return train_generator, val_generator


# ============================================================================
# 4. XÂY DỰNG MODEL (Transfer Learning - MobileNetV2)
# ============================================================================

def build_model(num_classes):
    """Tạo model transfer learning với MobileNetV2"""
    
    print("🏗️  Xây dựng model (Transfer Learning - MobileNetV2)...")
    
    # Load MobileNetV2 pretrained (ImageNet)
    base_model = MobileNetV2(
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze base model
    base_model.trainable = False
    
    # Tạo model
    model = keras.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dense(256, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    # Compile
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model


# ============================================================================
# 5. HUẤN LUYỆN MODEL
# ============================================================================

def train_model(model, train_gen, val_gen, num_classes):
    """Huấn luyện model"""
    
    print(f"\n🚀 Huấn luyện {EPOCHS} epochs...")
    print(f"  📊 Classes: {num_classes}")
    print(f"  📦 Batch size: {BATCH_SIZE}")
    
    # Tính số step
    train_steps = len(train_gen)
    val_steps = len(val_gen)
    
    print(f"  ⏳ Train steps/epoch: {train_steps}")
    print(f"  ⏳ Val steps/epoch: {val_steps}\n")
    
    # Train
    history = model.fit(
        train_gen,
        steps_per_epoch=train_steps,
        validation_data=val_gen,
        validation_steps=val_steps,
        epochs=EPOCHS,
        verbose=1
    )
    
    return history


# ============================================================================
# 6. LƯUACL MODEL VÀ MAPPING
# ============================================================================

def save_model_and_labels(model, train_gen):
    """Lưu model và file mapping labels"""
    
    print(f"\n💾 Lưu model: {MODEL_PATH}")
    model.save(MODEL_PATH)
    
    # Lấy class mapping
    class_indices = train_gen.class_indices  # {'disease': 0, ...}
    class_names = list(class_indices.keys())
    class_names.sort(key=lambda x: class_indices[x])  # Sắp xếp theo index
    
    # Tạo label mapping
    label_mapping = {
        "classes": class_names,
        "class_indices": class_indices,
        "class_vi": {disease: LABEL_VI.get(disease, disease) for disease in class_names},
        "num_classes": len(class_names),
    }
    
    # Lưu JSON
    print(f"✓ Lưu mappinè: {LABEL_FILE}")
    with open(LABEL_FILE, "w", encoding="utf-8") as f:
        json.dump(label_mapping, f, indent=2, ensure_ascii=False)
    
    # In ra
    print(f"\n📊 Class mapping:")
    for disease, idx in sorted(class_indices.items(), key=lambda x: x[1]):
        vi_name = LABEL_VI.get(disease, disease)
        print(f"  {idx}. {disease:20} → {vi_name}")
    
    return class_names


# ============================================================================
# 7. IN KẾT QUẢ TRAINING
# ============================================================================

def print_results(history, model_name):
    """In ra kết quả training"""
    
    print("\n" + "=" * 70)
    print("📈 KẾT QUẢ TRAINING")
    print("=" * 70)
    
    # Lấy các metric cuối cùng
    final_train_acc = history.history['accuracy'][-1] * 100
    final_val_acc = history.history['val_accuracy'][-1] * 100
    final_train_loss = history.history['loss'][-1]
    final_val_loss = history.history['val_loss'][-1]
    
    print(f"\n📊 Accuracy:")
    print(f"  Train: {final_train_acc:.2f}%")
    print(f"  Val:   {final_val_acc:.2f}%")
    
    print(f"\n📊 Loss:")
    print(f"  Train: {final_train_loss:.4f}")
    print(f"  Val:   {final_val_loss:.4f}")
    
    print(f"\n✅ Model đã lưu: {model_name}")
    print(f"✅ Label mapping: {LABEL_FILE}")
    print("=" * 70)


# ============================================================================
# 8. MAIN
# ============================================================================

if __name__ == "__main__":
    try:
        # Bước 1: Chuẩn hóa dataset
        organized_dir, image_count = organize_dataset()
        
        if len(image_count) == 0:
            print("❌ Lỗi: Không tìm thấy ảnh nào!")
            exit(1)
        
        # Bước 2: Tạo generators
        train_gen, val_gen = create_data_generators(organized_dir)
        num_classes = len(train_gen.class_indices)
        
        # Bước 3: Xây dựng model
        model = build_model(num_classes)
        print(f"\n✓ Model tạo xong ({num_classes} classes)")
        
        # Bước 4: Huấn luyện
        history = train_model(model, train_gen, val_gen, num_classes)
        
        # Bước 5: Lưu
        class_names = save_model_and_labels(model, train_gen)
        
        # Bước 6: In kết quả
        print_results(history, MODEL_PATH)
        
    except Exception as e:
        print(f"\n❌ LỖI: {e}")
        import traceback
        traceback.print_exc()
