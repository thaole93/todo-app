import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getTodoById, createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const logger = createLogger('generateUploadUrl');

    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    try {
      const todoId = event.pathParameters.todoId
      const userId = getUserId(event);
      const item = await getTodoById(todoId);
      if (item.userId !== userId) {
        logger.error('Invalid userId ' + userId);
        return {
          statusCode: 409,
          body: 'Invalid userId ' + userId
        }
      }
      const signedUrl = await createAttachmentPresignedUrl(todoId);
      logger.info('Get presignedURL for todoId: ' + todoId)
      return {
        statusCode: 200,
        body: JSON.stringify({
          uploadUrl: signedUrl
        })
      }
    } catch (e) {
      logger.error('generateUploadUrl error: ' + e.message)
      return {
        statusCode: 500,
        body: 'Get presigned URL error: ' + e.message
      }
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      origin: '*',
      credentials: true
    })
  )
