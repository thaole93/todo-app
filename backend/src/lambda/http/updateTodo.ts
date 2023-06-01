import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const logger = createLogger('updateTodo');

    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);
    logger.info('UserId: ' + userId);
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
    try {
      const result = await updateTodo(todoId, userId, updatedTodo);
      return {
        statusCode: 200,
        body: result
      }
    } catch (e) {
      logger.error('updateTodo error: ' + e.message);
      return {
        statusCode: e.statusCode,
        body: 'Update item fail'
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
