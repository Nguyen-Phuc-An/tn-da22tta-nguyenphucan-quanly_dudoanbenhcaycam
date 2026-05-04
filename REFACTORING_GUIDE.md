# 🌾 Hướng Dẫn Refactoring Season & Garden System

## 📋 Tóm tắt thay đổi

Hệ thống đã được refactor để thiết lập quan hệ đúng:
- **Xóa**: `garden_id` từ Season
- **Thêm**: `season_id` vào Garden
- **Kết quả**: 1 Mùa vụ → nhiều Vườn (1-to-Many)

---

## ✅ Backend - Hoàn thành (100%)

### 1. **Schema Updates**
- ✅ `Season.js`: Xóa `garden_id`, thêm `trang_thai` enum
- ✅ `Garden.js`: Thêm `season_id` optional ref

### 2. **Controller Updates**
- ✅ `season.controller.js`: 
  - Simplify CRUD (no garden dependency)
  - Add auto-end season logic
  - Add `trang_thai` management
  
- ✅ `garden.controller.js`:
  - Add `season_id` to create/update
  - Add validation (no ended seasons)
  - Add `changeSeasonForGarden` API

### 3. **Routes Updates**
- ✅ `garden.routes.js`: Added `POST /:id/change-season`

---

## 🎨 Frontend - TODO

### 📝 1. User Garden Form (`/user/gardens/form` hoặc `/user/gardens/new`)

**File**: `frontend/src/pages/User/GardenFormPage.jsx`

**Thêm:**
```jsx
// State
const [seasons, setSeasons] = useState([]);

// Fetch seasons khi component mount
useEffect(() => {
  fetchActiveSeasons();
}, []);

// Fetch API
const fetchActiveSeasons = async () => {
  try {
    const res = await apiClient.get('/seasons');
    // Filter only active seasons (trang_thai === 'Đang diễn ra')
    const activeSeasons = res.data.data.filter(s => s.trang_thai === 'Đang diễn ra');
    setSeasons(activeSeasons);
  } catch (error) {
    console.error('Error loading seasons:', error);
  }
};
```

**Form Field:**
```jsx
{/* Thêm trước "Địa điểm" */}
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Mùa Vụ (tùy chọn)
  </label>
  <select
    {...register('season_id')}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
  >
    <option value="">-- Không chọn --</option>
    {seasons.map(season => (
      <option key={season._id} value={season._id}>
        {season.ten_mua_vu} (Năm {season.nam})
      </option>
    ))}
  </select>
</div>
```

---

### 📊 2. User Gardens List (`/user/gardens`)

**File**: `frontend/src/pages/User/GardensPage.jsx`

**Cập nhật populate:**
```jsx
// Khi fetch gardens, đã có season_id populated
// Cần hiển thị thêm các cột:
```

**Thêm cột trong bảng:**
```jsx
// Sau cột địa điểm, thêm:
<th>Mùa Vụ</th>
<th>Trạng Thái Mùa</th>

// Trong tbody:
<td>{garden.season_id?.ten_mua_vu || 'Chưa gán'}</td>
<td>
  <span className={`px-2 py-1 rounded text-xs font-semibold ${
    garden.season_id?.trang_thai === 'Đang diễn ra' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }`}>
    {garden.season_id?.trang_thai || 'N/A'}
  </span>
</td>
```

**Thêm "Chuyển mùa vụ" button (tùy chọn):**
```jsx
{/* Trong hàng hành động */}
<button 
  onClick={() => openChangeSeasonModal(garden)}
  className="text-sm px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
>
  Chuyển Mùa
</button>
```

---

### 🔄 3. Change Season Modal (Tùy chọn)

**Thêm vào GardensPage.jsx:**
```jsx
const [changeSeasonModal, setChangeSeasonModal] = useState(null);

const handleChangeSeason = async (gardenId, newSeasonId) => {
  try {
    await apiClient.post(`/gardens/${gardenId}/change-season`, {
      season_id: newSeasonId
    });
    toast.success('Chuyển mùa vụ thành công');
    fetchGardens();
    setChangeSeasonModal(null);
  } catch (error) {
    toast.error('Lỗi chuyển mùa vụ');
  }
};
```

---

### 📋 4. Admin Gardens List (`/admin/gardens`)

**File**: `frontend/src/pages/Admin/GardensPage.jsx`

**Cập nhật:**
- Hiển thị `season_id` (ten_mua_vu, trang_thai)
- Show "Chưa gán mùa vụ" khi null
- Thêm "Chuyển mùa vụ" button

---

### 🗓️ 5. Admin Seasons Page (`/admin/seasons`)

**File**: `frontend/src/pages/Admin/SeasonsPage.jsx`

**Refactor:**
- 🔄 Xóa garden_id select
- ✅ Thêm `trang_thai` field (enum select)
- ✅ Hiển thị `trang_thai` status badge (Đang diễn ra / Đã kết thúc)
- ✅ Thêm "Auto-end check" button (test auto-end logic)

**Form Create/Edit:**
```jsx
{/* Thêm trạng thái */}
<div>
  <label className="block text-sm font-semibold mb-2">
    Trạng Thái
  </label>
  <select
    {...register('trang_thai')}
    className="w-full px-4 py-2 border rounded"
  >
    <option value="Đang diễn ra">Đang Diễn Ra</option>
    <option value="Đã kết thúc">Đã Kết Thúc</option>
  </select>
</div>
```

---

## 🔗 API Reference

### Season APIs (Updated)

```
POST   /api/seasons                 ← Tạo mùa vụ (no garden_id)
GET    /api/seasons                 ← Danh sách tất cả mùa vụ
GET    /api/seasons/:id             ← Chi tiết 1 mùa vụ
PUT    /api/seasons/:id             ← Cập nhật (+ trang_thai)
DELETE /api/seasons/:id             ← Xóa mùa vụ
```

### Garden APIs (Updated)

```
POST   /api/gardens                 ← Tạo (+ season_id optional)
GET    /api/gardens                 ← Danh sách (populated seasons)
GET    /api/gardens/:id             ← Chi tiết 1 (populated)
PUT    /api/gardens/:id             ← Cập nhật (+ season_id)
POST   /api/gardens/:id/change-season ← ⭐ New: Chuyển mùa vụ
DELETE /api/gardens/:id             ← Xóa
```

### Change Season Request

```json
POST /gardens/:gardenId/change-season
Body: {
  "season_id": "id_of_new_season"
}
```

---

## 📱 UI/UX Guidelines

### Season Status Colors
- **Đang diễn ra** → 🟢 Green (`bg-green-100 text-green-800`)
- **Đã kết thúc** → 🔴 Red (`bg-red-100 text-red-800`)

### Season Selection
- Only show **active** seasons in dropdowns
- Grey out ended seasons
- Message: "Hết mùa vụ - không thể gán"

### Garden without Season
- Display: "⊖ Chưa gán mùa vụ"
- Style: grey text, italic
- Allow: Change season anytime

---

## 🧪 Testing Checklist

- [ ] Create garden without season → Works
- [ ] Create garden with season → Works + populated
- [ ] Edit garden change season → Works + updated
- [ ] List shows season names → Correct
- [ ] Can't select ended season → Error message
- [ ] Auto-delete season when gardens exist → Error (conflict check)
- [ ] Season status updates correctly → Auto-logic works
- [ ] Admin seasons page shows trang_thai → Displays correctly

---

## 🔄 Migration (Already Done)

```javascript
// If existing data:
// 1. Remove all garden_id from Season
// 2. Set season_id = null on all Gardens
// 3. Manually map seasons to gardens (admin task)
```

---

## 📚 Database Validation

```javascript
// Season: NO garden_id
// Season: HAS trang_thai enum
// Garden: HAS season_id (optional)
// Garden: season_id refs Season
```

---

## 🚀 Deployment Order

1. ✅ Backend deploy (schemas + controllers)
2. 🔨 Frontend update (gradual)
3. 🧹 Data migration (admin) 
4. ✅ Testing

---

**Last Updated**: April 1, 2026
**Status**: Backend 100% | Frontend 0% (Ready to implement)
