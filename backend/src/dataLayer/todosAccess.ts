import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk-core'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";
import { s3Helper } from '../fileStorage/s3Helper';

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
  
  docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient();
  todoTable: string = 'todos';
  indexName: string = 'createdAt';

  async getTodosForUser(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient.query({
      TableName: this.todoTable,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      }
    }).promise();

    if (result.Count !== 0) {
      for (const record of result.Items) {
        const attachmentUrl = s3Helper.getReadSignedUrl(record.todoId);
        record.attachmentUrl = attachmentUrl;
      }
    }

    return result.Items as TodoItem[];
  }

  async createTodo(item: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todoTable,
      Item: item
    }).promise();

    return item;
  }

  async getTodoById(todoId: string): Promise<TodoItem> {
    const result = await this.docClient.query({
      TableName: this.todoTable,
      IndexName: this.indexName,
      KeyConditionExpression: "todoId = :todoId",
      ExpressionAttributeValues: {
        ":todoId": todoId
      }
    }).promise();

    if (result.Count == 0) {
      logger.error('Not found todo id ' + todoId);
      throw new Error('Not found todo id ' + todoId);
    }

    const item = result.Items[0] as TodoItem;
    item.attachmentUrl = s3Helper.getReadSignedUrl(todoId);
    return item;
  }

  async updateTodo(todoId: string, userId: string, item: UpdateTodoRequest): Promise<String> {
    await this.docClient.update({
      TableName: this.todoTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression: " SET name = :name , dueDate = :dueDate, done = :done ",
      ExpressionAttributeValues: {
        ":name": item.name || null,
        ":dueDate": item.dueDate || null,
        ":done": item.done || null
      }
    }).promise();
    return "updated Todo " + todoId;
  }

  async deleteItem(todoId: string, userId: string): Promise<any> {
    return this.docClient.delete({
      TableName: this.todoTable,
      Key: {
        todoId: todoId,
        userId: userId
      }
    }).promise();
  }
}