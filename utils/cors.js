export const corsMiddleware = async (req, res) => {
    // Define allowed origins
    const allowedOrigins = ['*'];
    const origin = req.headers.origin;
  
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return true;
    }
    return false;
  }