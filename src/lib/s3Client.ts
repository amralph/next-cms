import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  region: `${process.env.S3_REGION}`,
  endpoint: `${process.env.S3_ENDPOINT}`, // LocalStack endpoint
  credentials: {
    accessKeyId: `${process.env.S3_ACCESS_KEY_ID}`,
    secretAccessKey: `${process.env.S3_SECRET_ACCESS_KEY}`,
  },
  forcePathStyle: true, // important for LocalStack
});
