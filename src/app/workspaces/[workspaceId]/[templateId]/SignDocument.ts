'use server';

import { s3Client } from '@/lib/s3Client';
import { Content } from '@/types/extendsRowDataPacket';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Reference } from '@/types/extendsRowDataPacket';
export async function signUrlsInContentObject(contentObject: Content) {
  // first we iterate over each key in the original
  for (const [, value] of Object.entries(contentObject)) {
    // keep in mind this object isn't supposed to be recursive

    // we only care about arrays and objects
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        await Promise.all(
          value.map(async (v) => {
            if (typeof v === 'object' && v !== null) {
              if (v['_referenceTo'] === 'file') {
                await signUrlsInContentObjectHelper(v);
              }
            }
          })
        );
      } else {
        if (value['_referenceTo'] === 'file') {
          // mutate and sign it!
          await signUrlsInContentObjectHelper(value);
        }
      }
    }
  }
}

async function signUrlsInContentObjectHelper(value: Reference) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: value._referenceId, // assuming key is the S3 object key
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    value._referenceId = signedUrl;
  } catch (e) {
    console.error('Error signing URL:', e);
  }
}
