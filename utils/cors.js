import cors from 'cors';

const corsMiddleware = cors({
  origin: [
    'http://localhost:3001',
    'https://gift-easy-sender.vercel.app',
    'https://the-registry-web.site',
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Origin', 'Accept', 'Authorization'],
  credentials: true,
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Accept'
      );
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      return res.status(200).end();
    }

    // Set CORS headers for the actual request
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export { corsMiddleware, runMiddleware };
