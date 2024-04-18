import { uploadMedia } from '@services/external/s3'
import convert from 'heic-convert'

export const insertAndUploadMedia = async (
  data: Buffer,
  contentType: string,
  userId: string,
  fileName?: string,
): Promise<string> => {
  let updatedData = data
  let updatedContentType = contentType
  if (contentType.includes('heic')) {
    updatedContentType = 'image/png'
    const outputBuffer = await convert({
      buffer: data,
      format: 'PNG',
      quality: 0.5,
    })
    updatedData = Buffer.from(outputBuffer)
  }

  // insert into db
  const mediaId = ''
  const mediaContentType = ''

  await uploadMedia(mediaId, updatedData, mediaContentType, fileName)

  return mediaId
}
