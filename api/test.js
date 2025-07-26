const https = require('https');

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  try {
    // Test connection to uncoder.eu.org
    const testData = '4154644401538872|03|2027|076';

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

    const formData = `data=${encodeURIComponent(testData)}`;
    const response = await makeTestRequest(formData, headers);
    
    res.status(200).json({
      status: 'success',
      message: 'Test kết nối thành công',
      uncoder_response: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Test kết nối thất bại',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

function makeTestRequest(formData, headers) {
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
      timeout: 10000 // 10 seconds for test
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve(parsedData);
        } catch (error) {
          resolve({
            status: 'error',
            message: 'Response không phải JSON',
            http_code: res.statusCode,
            raw_response: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout - server không phản hồi'));
    });

    req.write(formData);
    req.end();
  });
} 