# API Proxy cho chkr.cc (Node.js)

Đây là API proxy Node.js để kiểm tra thẻ tín dụng thông qua chkr.cc

## Cách sử dụng

### URL Format
```
https://your-domain.vercel.app/chk?user=CARD_DATA&key=API_KEY
```

### Ví dụ
```
https://apichekk2-n195.vercel.app/chk?user=4154644401584181|02|2027|555&key=khang
```

### Tham số
- `user`: Dữ liệu thẻ (format: số_thẻ|tháng|năm|cvv)
- `key`: API key (mặc định: `khang`)

### Response Format
```json
{
  "status": "success",
  "message": "Thông báo từ API chkr.cc",
  "data": {
    // Dữ liệu phản hồi từ chkr.cc
  }
}
```

## Deployment lên Vercel

1. Upload tất cả file lên GitHub repository
2. Kết nối repository với Vercel
3. Deploy tự động sẽ được thực hiện

## Files cần thiết
- `api/chk.js`: File API chính (Node.js)
- `api/index.js`: File test API
- `vercel.json`: Cấu hình cho Vercel
- `package.json`: Cấu hình Node.js project
- `index.html`: Trang chủ
- `test.html`: Trang test API
- `README.md`: Hướng dẫn sử dụng

## Cấu trúc thư mục
```
/
├── api/
│   ├── chk.js
│   └── index.js
├── vercel.json
├── package.json
├── index.html
├── test.html
└── README.md
```

## Lưu ý
- API này sử dụng Node.js để gọi đến chkr.cc
- Headers được cấu hình giống như request gốc
- Có xử lý lỗi và validation đầy đủ
- Tương thích hoàn toàn với Vercel
- Hỗ trợ CORS cho frontend 