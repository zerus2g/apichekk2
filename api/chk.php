<?php

// --- CẤU HÌNH VÀ CẢNH BÁO QUAN TRỌNG ---
header('Content-Type: application/json; charset=utf-8'); // Đảm bảo trả về JSON và hỗ trợ UTF-8

$requiredApiKey = 'khang'; // API Key của bạn
$targetUrl = 'https://api.chkr.cc/'; // URL API đích

// --- KẾT THÚC CẤU HÌNH VÀ CẢNH BÁO ---

// --- XỬ LÝ INPUT ---
// Kiểm tra xem các tham số cần thiết có tồn tại không
if (!isset($_GET['key']) || !isset($_GET['user'])) {
    echo json_encode(['status' => 'error', 'message' => 'Thiếu tham số bắt buộc: key và user']);
    exit; // Dừng script
}

$providedKey = $_GET['key'];
$cardData = trim($_GET['user']); // Lấy dữ liệu thẻ và loại bỏ khoảng trắng thừa

// Xác thực API Key
if ($providedKey !== $requiredApiKey) {
    echo json_encode(['status' => 'error', 'message' => 'API key không hợp lệ']);
    exit;
}

// Kiểm tra dữ liệu thẻ có rỗng không
if (empty($cardData)) {
     echo json_encode(['status' => 'error', 'message' => 'Dữ liệu thẻ không được để trống']);
    exit;
}
// --- KẾT THÚC XỬ LÝ INPUT ---

// --- CHUẨN BỊ YÊU CẦU cURL ---
// Chuẩn bị Headers (tương tự Python)
$headers = [
    'accept: application/json, text/javascript, */*; q=0.01',
    'accept-language: vi,en-US;q=0.9,en;q=0.8,fr-FR;q=0.7,fr;q=0.6',
    'content-type: application/json; charset=UTF-8',
    'origin: https://chkr.cc',
    'priority: u=1, i',
    'referer: https://chkr.cc/',
    'sec-ch-ua: "Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
    'sec-ch-ua-mobile: ?0',
    'sec-ch-ua-platform: "Windows"',
    'sec-fetch-dest: empty',
    'sec-fetch-mode: cors',
    'sec-fetch-site: same-site',
    'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
];

// Chuẩn bị dữ liệu JSON gửi đi (dưới dạng mảng PHP)
$jsonData = [
    'data' => $cardData, // Sử dụng dữ liệu thẻ từ input
    'charge' => false
];

// Khởi tạo cURL
$ch = curl_init();

// Thiết lập các tùy chọn cURL
curl_setopt($ch, CURLOPT_URL, $targetUrl); // Đặt URL đích
curl_setopt($ch, CURLOPT_POST, true); // Đặt phương thức là POST
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($jsonData)); // Mã hóa mảng PHP thành chuỗi JSON và đặt làm dữ liệu POST
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Trả về kết quả dưới dạng chuỗi thay vì in ra trực tiếp
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers); // Đặt các header HTTP
curl_setopt($ch, CURLOPT_TIMEOUT, 30); // Thời gian chờ tối đa cho toàn bộ yêu cầu (giây)
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10); // Thời gian chờ tối đa để kết nối (giây)
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true); // Bật kiểm tra chứng chỉ SSL (nên bật)
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2); // Kiểm tra tên host trong chứng chỉ

// --- THỰC THI cURL VÀ XỬ LÝ KẾT QUẢ ---
$response = curl_exec($ch); // Thực thi yêu cầu
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE); // Lấy mã trạng thái HTTP trả về
$curlError = curl_error($ch); // Lấy thông báo lỗi cURL (nếu có)
$curlErrno = curl_errno($ch); // Lấy mã lỗi cURL (nếu có)

// Đóng phiên cURL
curl_close($ch);

// Kiểm tra lỗi cURL (ví dụ: lỗi mạng, không kết nối được)
if ($curlErrno) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Lỗi cURL khi kết nối đến API chkr.cc',
        'error_code' => $curlErrno,
        'error_details' => $curlError
    ]);
    exit;
}

// Kiểm tra mã trạng thái HTTP
// Các mã từ 400 trở lên thường là lỗi từ phía client hoặc server
if ($httpCode >= 400) {
     echo json_encode([
        'status' => 'error',
        'message' => 'API chkr.cc trả về lỗi HTTP',
        'http_code' => $httpCode,
        'response_body' => $response // Bao gồm body phản hồi thô để debug
    ]);
    exit;
}

// Cố gắng giải mã phản hồi JSON từ chkr.cc
$responseData = json_decode($response, true); // Giải mã thành mảng kết hợp PHP
// Kiểm tra xem giải mã JSON có thành công không
if (json_last_error() === JSON_ERROR_NONE) {
    // Nếu API chkr.cc trả về lỗi bên trong cấu trúc JSON của nó
    if (isset($responseData['status']) && $responseData['status'] !== 'success' && isset($responseData['message'])) {
         echo json_encode([
            'status' => 'error', // Đặt trạng thái lỗi chung cho API của bạn
            'message' => 'Lỗi từ API chkr.cc: ' . $responseData['message'],
            'chkr_response' => $responseData // Bao gồm toàn bộ phản hồi gốc từ chkr.cc
        ]);
    }
    // Nếu không có lỗi nào ở trên, coi như thành công và trả về dữ liệu từ chkr.cc
    else {
         echo json_encode($responseData); // Mã hóa lại thành JSON và gửi về client
    }
} else {
    // Nếu phản hồi từ chkr.cc không phải là JSON hợp lệ
    echo json_encode([
        'status' => 'error',
        'message' => 'Không thể giải mã phản hồi JSON từ API chkr.cc',
        'http_code' => $httpCode,
        'raw_response' => $response // Trả về phản hồi thô để kiểm tra
    ]);
}

exit; // Kết thúc script

?> 