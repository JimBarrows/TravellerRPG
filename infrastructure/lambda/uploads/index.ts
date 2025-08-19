import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.UPLOADS_BUCKET_NAME!;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface PresignedUrlRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  userId: string;
  characterId?: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    // Parse request body
    const body: PresignedUrlRequest = JSON.parse(event.body || '{}');
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(body.fileType)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Invalid file type. Allowed types: ' + ALLOWED_FILE_TYPES.join(', '),
        }),
      };
    }

    // Validate file size
    if (body.fileSize > MAX_FILE_SIZE) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'File size exceeds maximum allowed size of 5MB',
        }),
      };
    }

    // Extract user ID from JWT token (simplified - in production, validate the token)
    const userId = body.userId || 'anonymous';
    
    // Generate unique file key
    const fileExtension = body.fileName.split('.').pop();
    const uniqueId = uuidv4();
    const timestamp = Date.now();
    
    // Organize files by user and character
    const fileKey = body.characterId 
      ? `characters/${body.characterId}/portraits/${timestamp}-${uniqueId}.${fileExtension}`
      : `users/${userId}/uploads/${timestamp}-${uniqueId}.${fileExtension}`;

    // Create presigned URL for upload
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: body.fileType,
      ContentLength: body.fileSize,
      Metadata: {
        userId: userId,
        characterId: body.characterId || '',
        originalName: body.fileName,
        uploadTimestamp: timestamp.toString(),
      },
    });

    const uploadUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 3600, // URL expires in 1 hour
    });

    // Create presigned URL for viewing
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    const viewUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 86400, // URL expires in 24 hours
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        uploadUrl,
        viewUrl,
        fileKey,
        expiresIn: 3600,
      }),
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Failed to generate presigned URL',
      }),
    };
  }
};