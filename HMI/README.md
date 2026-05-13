# 🚢 HMI Monitor Dashboard

HMI này dùng:

- ⚛️ React + Vite cho frontend
- 🐍 Flask + `pymodbus` cho backend
- 🔌 Modbus TCP để đọc dữ liệu thật từ PLC / thiết bị

Kiến trúc hiện tại đã thống nhất theo kiểu **page-based API**:

- `Overview.jsx` gọi `/api/overview`
- `Engine.jsx` gọi `/api/engine`
- `PAndID.jsx` gọi `/api/pid`
- `/api/debug/modbus-snapshot` chỉ dùng để debug raw Modbus khi cần

---

## ✨ Kiến trúc tổng thể

```text
Frontend page
  -> gọi /api/<page_name>
Backend Flask
  -> đọc config theo page trong backend_config.json
  -> gom các địa chỉ Modbus cần dùng
  -> đọc Modbus theo nhóm địa chỉ liên tiếp
  -> map dữ liệu thành JSON phù hợp cho page
PLC / Modbus TCP device
```

Ví dụ:

- `/api/overview` trả dữ liệu gauge cho trang Overview
- `/api/engine` trả dữ liệu bar chart + summary cho trang Engine
- `/api/pid` trả dữ liệu flow + digital cho trang P&ID
- `/api/debug/modbus-snapshot` trả dữ liệu thô để kiểm tra nhanh

---

## 📁 Cấu trúc thư mục chính

```text
backend/
  app.py
  backend_config.json
  requirements.txt

public/
  Monitor items.svg
  Monitor items 1.svg
  P&IDbackground.png

src/
  components/
    EngineBarChart.jsx
    EngineGauge.jsx
  pages/
    Overview.jsx
    Engine.jsx
    PAndID.jsx
  services/
    pidMonitorApi.js
  utils/
    PIDMonitor.js
```

---

## ⚙️ Cấu hình backend

File cấu hình chính:

[`backend/backend_config.json`](./backend/backend_config.json)

Cấu trúc hiện tại:

```json
{
  "modbus": {
    "host": "10.0.0.205",
    "port": 502,
    "unit_id": 16,
    "timeout_seconds": 3,
    "poll_interval_ms": 2000
  },
  "pages": {
    "overview": {
      "gauges": []
    },
    "engine": {
      "bar_chart": [],
      "summary": [],
      "status": []
    },
    "pid": {
      "flows": [],
      "digitals": []
    }
  }
}
```

### 🔎 Ý nghĩa

#### `modbus`

- `host`: IP của PLC / thiết bị Modbus TCP
- `port`: thường là `502`
- `unit_id`: slave id / unit id
- `timeout_seconds`: timeout mỗi lần đọc
- `poll_interval_ms`: chu kỳ polling frontend có thể tham khảo

#### `pages`

Mỗi page có các section riêng.

Ví dụ:

- `overview.gauges` cho gauge
- `engine.bar_chart` cho biểu đồ cột
- `engine.summary` cho các giá trị text
- `engine.status` cho trạng thái số
- `pid.flows` và `pid.digitals` cho trang P&ID

---

## 🔌 Quy ước địa chỉ Modbus

Trong config, bạn nhập địa chỉ theo kiểu tài liệu PLC quen dùng:

- `40001` cho holding register
- `10001` cho discrete input

Backend sẽ tự đổi về offset `0-based` cho `pymodbus`.

Ví dụ:

- `40001` -> offset `0`
- `40002` -> offset `1`
- `10001` -> offset `0`

---

## 🐍 Backend hoạt động như thế nào

File chính:

[`backend/app.py`](./backend/app.py)

Luồng chính:

1. 📥 load config từ `backend_config.json`
2. 📄 lấy config của page đang được gọi
3. 🧮 gom tất cả địa chỉ cần đọc
4. ⚡ nhóm các địa chỉ liên tiếp để giảm số lần đọc Modbus
5. 🔄 đọc holding registers và discrete inputs
6. 🧩 map dữ liệu thô thành payload có nghĩa
7. 📤 trả JSON cho frontend

Backend hiện có 2 kiểu API:

### API chính theo page

```text
/api/<page_name>
```

Ví dụ:

- `GET /api/overview`
- `GET /api/engine`
- `GET /api/pid`

### API debug raw Modbus

```text
/api/debug/modbus-snapshot
```

API này hữu ích khi bạn muốn:

- kiểm tra PLC có trả dữ liệu không
- xem giá trị raw trước khi map
- so sánh xem lỗi nằm ở Modbus hay ở logic mapping

---

## ⚛️ Frontend hoạt động như thế nào

Service gọi API nằm ở:

[`src/services/pidMonitorApi.js`](./src/services/pidMonitorApi.js)

Hiện có:

- `fetchPagePayload(pageName)` cho API chính theo page
- `fetchDebugModbusSnapshot()` cho API debug

### `Overview.jsx`

[`src/pages/Overview.jsx`](./src/pages/Overview.jsx)

Trang này:

- gọi `/api/overview`
- lấy `sections.gauges`
- render bằng `EngineGauge`
- có `loading`, `error`, `empty state`

### `Engine.jsx`

[`src/pages/Engine.jsx`](./src/pages/Engine.jsx)

Trang này:

- gọi `/api/engine`
- lấy `sections.bar_chart`
- lấy `sections.summary`
- lấy `sections.status`
- render `EngineBarChart` + summary card
- có `loading`, `error`, `empty state`

### `PAndID.jsx`

[`src/pages/PAndID.jsx`](./src/pages/PAndID.jsx)

Trang này hiện dùng:

- `/api/pid`
- `buildPIDMonitorDataFromPagePayload()`
- `updatePIDMonitorElements()`

để cập nhật text flow và trạng thái digital trong SVG `Monitor items.svg`.

---

## 🚀 Chạy local

### 1. Cài frontend dependencies

```bash
npm install
```

### 2. Cài backend dependencies

```bash
pip install -r backend/requirements.txt
```

### 3. Chạy backend

```bash
python backend/app.py
```

Backend chạy mặc định ở:

```text
http://127.0.0.1:8001
```

Ví dụ test nhanh:

```text
http://127.0.0.1:8001/api/overview
http://127.0.0.1:8001/api/engine
http://127.0.0.1:8001/api/pid
http://127.0.0.1:8001/api/debug/modbus-snapshot
```

### 4. Chạy frontend

```bash
npm run start
```

Frontend Vite thường chạy ở:

```text
http://localhost:5173
```

---

## 🌐 Proxy frontend

Vite đã được cấu hình để frontend có thể gọi `/api/*` qua backend.

Ý tưởng là:

```text
Frontend -> /api/overview
Vite proxy -> http://127.0.0.1:8001/api/overview
```

Nếu có lỗi gọi API, hãy kiểm tra:

- backend có đang chạy không
- `vite.config.mjs` có proxy đúng không
- trình duyệt có báo lỗi network không

---

## 🛠️ Ví dụ response

### `/api/overview`

```json
{
  "page": "overview",
  "sections": {
    "gauges": [
      {
        "key": "engine_1_load",
        "title": "Engine 1",
        "subtitle": "Main propulsion load",
        "unit": "%",
        "color": "#22c55e",
        "value": 72
      }
    ]
  }
}
```

### `/api/pid`

```json
{
  "page": "pid",
  "sections": {
    "flows": [
      {
        "key": "flow_1",
        "name": "Flow 1",
        "unit": "L/H",
        "value": 100
      }
    ],
    "digitals": [
      {
        "key": "pump_1",
        "label": "Pump 1",
        "value": true
      }
    ]
  }
}
```

### `/api/debug/modbus-snapshot`

```json
{
  "holdingRegisters": {
    "40001": 72,
    "40002": 64
  },
  "discreteInputs": {
    "10001": 1
  }
}
```

---

## 🧪 Mẫu mở rộng page mới

Nếu bạn muốn thêm page mới, ví dụ `power`, flow nên là:

1. 🗂️ thêm `pages.power` trong `backend_config.json`
2. ⚛️ tạo `Power.jsx`
3. 🔌 trong page gọi:

```js
fetchPagePayload("power");
```

4. 🎨 render dữ liệu vào component phù hợp

Bạn không cần viết API route riêng nếu vẫn dùng pattern `/api/<page_name>`.

---

## 📌 Gợi ý cải tiến tiếp theo

- 🔁 thêm polling tự động theo `poll_interval_ms`
- 🧱 thêm cache backend để tránh đọc Modbus quá nhiều
- ❤️ thêm `/api/health`
- 📝 thêm logging lỗi Modbus
- 🧪 thêm test cho logic mapping
- 📊 thêm các page mới như `power`, `alarms`, `exhaust`

---

## 🐞 Troubleshooting

### Frontend không có dữ liệu

Kiểm tra:

- backend đã chạy chưa
- `/api/overview`, `/api/engine`, `/api/pid` có trả JSON không
- Vite proxy có hoạt động không
- console trình duyệt có báo lỗi không

### Backend không kết nối được Modbus

Kiểm tra:

- `host`
- `port`
- `unit_id`
- firewall
- thiết bị có bật Modbus TCP không

### `PAndID` không cập nhật SVG

Kiểm tra:

- `/api/pid` có trả dữ liệu không
- `Monitor items.svg` có đúng `id` không
- `PIDMonitor.js` có đang map đúng trường không

### Python không chạy được

Nếu máy đang trỏ vào alias của Microsoft Store, hãy cài Python chính thức từ:

- https://www.python.org/downloads/

Sau đó kiểm tra lại:

```bash
python --version
```

---

## 📄 Ghi chú

README này hiện đã khớp với code hiện tại:

- ✅ API chính theo page
- ✅ `Overview`, `Engine`, `PAndID` đều dùng page-based API
- ✅ endpoint debug raw riêng vẫn được giữ lại
- ✅ config nhóm theo page
- ✅ frontend gọi API qua service chung
