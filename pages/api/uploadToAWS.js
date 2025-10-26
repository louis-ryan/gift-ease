import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function uploadToS3(req, res) {
  // Set CORS headers to allow cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check if environment variables are set
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('AWS credentials not found in environment variables');
    return res.status(500).json({ error: 'AWS configuration error' });
  }

  try {
    // Initialize S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Create formidable instance (corrected syntax)
    const form = formidable();

    // Parse form data
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Get the file (handle new formidable file structure)
    const fileArray = files.file;
    if (!fileArray || !fileArray[0]) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const file = fileArray[0];

    const fileBuffer = fs.readFileSync(file.filepath);

    const params = {
      Bucket: process.env.AMAZON_BUCKET,
      Key: `uploads/${Date.now()}-${file.originalFilename || 'untitled'}`,
      Body: fileBuffer,
      ContentType: file.mimetype || 'application/octet-stream',
    };

    // Upload to S3
    const command = new PutObjectCommand(params);
    const result = await s3Client.send(command);

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      message: 'Upload successful',
      url: `https://${process.env.AMAZON_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: 'Upload failed',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
