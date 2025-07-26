export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  res.status(200).json({
    status: 'success',
    message: 'Node.js API đang hoạt động!',
    timestamp: new Date().toISOString(),
    node_version: process.version,
    platform: process.platform
  });
} 