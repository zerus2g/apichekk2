const https = require('https');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Set JSON content type
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const requiredApiKey = 'khang';
  const targetUrl = 'https://api.chkr.cc/';

  // Check required parameters
  const { key, user } = req.query;
  
  if (!key || !user) {
    return res.status(400).json({
      status: 'error',
      message: 'Thiếu tham số bắt buộc: key và user'
    });
  }

  // Validate API key
  if (key !== requiredApiKey) {
    return res.status(401).json({
      status: 'error',
      message: 'API key không hợp lệ'
    });
  }

  // Check card data
  const cardData = user.trim();
  if (!cardData) {
    return res.status(400).json({
      status: 'error',
      message: 'Dữ liệu thẻ không được để trống'
    });
  }

  // Prepare headers
  const headers = {
    'accept': 'application/json, text/javascript, */*; q=0.01',
    'accept-language': 'vi,en-US;q=0.9,en;q=0.8,fr-FR;q=0.7,fr;q=0.6',
    'content-type': 'application/json; charset=UTF-8',
    'origin': 'https://chkr.cc',
    'priority': 'u=1, i',
    'referer': 'https://chkr.cc/',
    'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
  };

  // Prepare JSON data
  const jsonData = {
    data: cardData,
    charge: false
  };

  // Make request to chkr.cc
  try {
    const response = await makeRequest(targetUrl, jsonData, headers);
    res.status(200).json(response);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi kết nối đến API chkr.cc',
      error_details: error.message,
      suggestion: 'Có thể server chkr.cc đang bảo trì hoặc quá tải. Vui lòng thử lại sau.'
    });
  }
}

function makeRequest(url, data, headers) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'api.chkr.cc',
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        ...headers,
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000, // 30 seconds timeout
      keepAlive: true,
      keepAliveMsecs: 1000
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          // Check if response is valid JSON
          if (responseData.trim() === '') {
            resolve({
              status: 'error',
              message: 'API chkr.cc trả về response rỗng',
              http_code: res.statusCode
            });
            return;
          }

          const parsedData = JSON.parse(responseData);
          resolve(parsedData);
        } catch (error) {
          // If not JSON, return raw response for debugging
          resolve({
            status: 'error',
            message: 'Không thể giải mã phản hồi JSON từ API chkr.cc',
            http_code: res.statusCode,
            raw_response: responseData,
            error: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request Error:', error);
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout - server chkr.cc không phản hồi trong 30 giây'));
    });

    req.write(postData);
    req.end();
  });
} 