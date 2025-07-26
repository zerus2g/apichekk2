# API Proxy cho chkr.cc

Đây là API proxy PHP để kiểm tra thẻ tín dụng thông qua chkr.cc

## Cách sử dụng

### URL Format
```
https://your-domain.vercel.app/chk?user=CARD_DATA&key=API_KEY
```

### Ví dụ
```
https://ahihi.x10.mx/chk?user=4154644401584181|02|2027|555&key=khang
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
- `api/chk.php`: File API chính (trong thư mục api)
- `.htaccess`: Cấu hình URL rewriting
- `vercel.json`: Cấu hình cho Vercel
- `README.md`: Hướng dẫn sử dụng

## Cấu trúc thư mục
```
/
├── api/
│   └── chk.php
├── .htaccess
├── vercel.json
└── README.md
```

## Lưu ý
- API này sử dụng cURL để gọi đến chkr.cc
- Headers được cấu hình giống như request gốc
- Có xử lý lỗi và validation đầy đủ
- File PHP phải nằm trong thư mục `api/` để tương thích với Vercel 