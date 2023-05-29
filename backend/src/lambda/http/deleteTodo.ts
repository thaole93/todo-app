import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    // TODO: Remove a TODO item by id

    const logger = createLogger('deleteTodo');
    const userId = getUserId(event);
    try {
      await deleteTodo(todoId, userId);
      logger.info('Deleted item ' + todoId)
      return {
        statusCode: 200,
        body: ''
      }
    } catch (e) {
      logger.error('deleteTodo error: ', e.message)
      return {
        statusCode: e.statusCode,
        body: 'Delete item fail'
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
