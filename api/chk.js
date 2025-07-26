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
  const targetUrl = 'https://uncoder.eu.org/cc-checker/api.php';

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

  // Prepare headers for uncoder.eu.org
  const headers = {
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'origin': 'https://uncoder.eu.org',
    'priority': 'u=1, i',
    'referer': 'https://uncoder.eu.org/cc-checker/',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    'x-requested-with': 'XMLHttpRequest'
  };

  // Prepare form data
  const formData = `data=${encodeURIComponent(cardData)}`;

  // Make request to uncoder.eu.org
  try {
    const response = await makeRequest(targetUrl, formData, headers);
    res.status(200).json(response);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi kết nối đến API uncoder.eu.org',
      error_details: error.message,
      suggestion: 'Có thể server uncoder.eu.org đang bảo trì hoặc quá tải. Vui lòng thử lại sau.'
    });
  }
}

function makeRequest(url, formData, headers) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'uncoder.eu.org',
      port: 443,
      path: '/cc-checker/api.php',
      method: 'POST',
      headers: {
        ...headers,
        'Content-Length': Buffer.byteLength(formData)
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
              message: 'API uncoder.eu.org trả về response rỗng',
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
            message: 'Không thể giải mã phản hồi JSON từ API uncoder.eu.org',
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
      reject(new Error('Request timeout - server uncoder.eu.org không phản hồi trong 30 giây'));
    });

    req.write(formData);
    req.end();
  });
} 