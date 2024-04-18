import { insertAndUploadMedia } from '@services/media'
import {
  endpointsFactory,
  requireLoginMiddleware,
} from '@utils/zod-api-helpers'
import { z } from 'zod'

export const uploadMediaHandler = endpointsFactory
  .addMiddleware(requireLoginMiddleware)
  .build({
    method: 'post',
    input: z.object({
      data: z.any(),
      contentType: z.string(),
      name: z.string().optional(),
    }),
    output: z.object({ id: z.string() }),
    async handler({ input: { data, contentType, name }, options: { user } }) {
      const buffer = data.split(',')[1]

      const mediaId = await insertAndUploadMedia(
        Buffer.from(buffer, 'base64'),
        contentType,
        user.id,
        name,
      )
      return { id: mediaId }
    },
  })
