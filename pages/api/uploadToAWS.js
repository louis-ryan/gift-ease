import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Images only. Both apps resize photos in the browser before uploading, so 10 MB is generous
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

export default async function uploadToS3(req, res) {
  // Open to any origin: the public sender app uploads gift photos here
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('AWS credentials not found in environment variables');
    return res.status(500).json({ error: 'AWS configuration error' });
  }

  let file;
  try {
    const form = formidable({ maxFiles: 1, maxFileSize: MAX_BYTES });
    const [, files] = await form.parse(req);
    file = files.file?.[0];
  } catch (error) {
    const tooBig = /maxFileSize|maxTotalFileSize/i.test(error.message);
    return res.status(tooBig ? 413 : 400).json({ error: tooBig ? 'That image is too large (10 MB max)' : 'Upload failed' });
  }

  if (!file) return res.status(400).json({ error: 'No file provided' });
  const extension = ALLOWED_TYPES[file.mimetype];
  if (!extension) {
    fs.unlink(file.filepath, () => {});
    return res.status(415).json({ error: 'Please upload a JPG, PNG, WebP, GIF or HEIC image' });
  }

  try {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Random key: never use the uploaded filename in the URL
    const key = `uploads/${Date.now()}-${randomUUID()}.${extension}`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AMAZON_BUCKET,
        Key: key,
        Body: fs.readFileSync(file.filepath),
        ContentType: file.mimetype,
      })
    );

    return res.status(200).json({
      message: 'Upload successful',
      url: `https://${process.env.AMAZON_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  } finally {
    fs.unlink(file.filepath, () => {});
  }
}
