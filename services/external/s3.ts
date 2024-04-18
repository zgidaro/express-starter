import { S3 } from '@aws-sdk/client-s3'
import { config } from '@/config'
import { Readable } from 'stream'

const s3 = new S3({
  region: config.aws.s3.region,
  forcePathStyle: true,
  credentials: {
    accessKeyId: config.aws.accessKey,
    secretAccessKey: config.aws.secretAccessKey,
  },
})

const streamToBuffer = (stream: Readable): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks)))
  })
}

export const uploadMedia = async (
  mediaId: string,
  file: Buffer,
  contentType: string,
  fileName?: string,
) => {
  const key = `media/${mediaId}`

  await s3.putObject({
    Bucket: config.aws.s3.bucket,
    Key: key,
    Body: file,
    ContentType: contentType,
    ContentDisposition: fileName
      ? `attachment; filename="${fileName}"`
      : undefined,
  })
}

export const getMedia = async (mediaId: string): Promise<Buffer | null> => {
  const key = `media/${mediaId}`

  try {
    const data = await s3.getObject({
      Bucket: config.aws.s3.bucket,
      Key: key,
    })

    if (!data.Body) {
      return null
    }

    return streamToBuffer(data.Body as Readable)
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const deleteMedia = async (mediaId: string): Promise<void> => {
  const key = `media/${mediaId}`

  try {
    await s3.deleteObject({
      Bucket: config.aws.s3.bucket,
      Key: key,
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}
