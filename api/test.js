const https = require('https');

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  try {
    // Test connection to chkr.cc
    const testData = {
      data: '4154644401584181|02|2027|555',
      charge: false
    };

    const headers = {
      'accept': 'application/json, text/javascript, */*; q=0.01',
      'content-type': 'application/json; charset=UTF-8',
      'origin': 'https://chkr.cc',
      'referer': 'https://chkr.cc/',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
    };

    const response = await makeTestRequest(testData, headers);
    
    res.status(200).json({
      status: 'success',
      message: 'Test kết nối thành công',
      chkr_response: response,
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

function makeTestRequest(data, headers) {
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

    req.write(postData);
    req.end();
  });
} 