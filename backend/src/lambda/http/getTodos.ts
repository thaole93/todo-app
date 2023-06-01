import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils';

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const logger = createLogger('getTodos');

    // Write your code here

    try {
      const userId = getUserId(event);
      logger.info('Get list todos of user ' + userId);
      const todos = await getTodosForUser(userId);
      return {
        statusCode: 200,
        body: JSON.stringify({ todos })
      }
    } catch (e) {
      logger.error('getTodos error: ' + e.message );
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: e.message
        })
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
