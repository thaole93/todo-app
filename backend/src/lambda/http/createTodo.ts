import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item

    const logger = createLogger('createToDo');

    try {
      const result = await createTodo(newTodo, event);
      return {
        statusCode: 201,
        body: JSON.stringify({
          item: result
        })
      }
    } catch (e) {
      logger.error('createToDo error: ', e.message);
      return {
        statusCode: e.statusCode,
        body: 'Create item fail'
      }
    }
  }
)

handler.use(
  cors({
    origin: '*',
    credentials: true
  })
)
