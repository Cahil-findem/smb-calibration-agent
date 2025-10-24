export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'API health check successful',
    timestamp: new Date().toISOString()
  });
}
