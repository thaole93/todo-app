import { TodosAccess } from '../dataLayer/todosAccess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

import {getUserId} from "../lambda/utils";
import {APIGatewayProxyEvent} from "aws-lambda";
import { s3Helper } from '../fileStorage/s3Helper'

const todoAccess = new TodosAccess();
const logger = createLogger('todo')

// TODO: Implement businessLogic

export async function createTodo(req: CreateTodoRequest, 
                                event: APIGatewayProxyEvent): Promise<TodoItem>{
    
    const userId = getUserId(event);
    if(!userId) logger.error('Invalid user with id ' + userId)

    const todoId = uuid.v4();
    const item: TodoItem = {
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        name: req.name,
        dueDate: req.dueDate,
        done: false
    }
    const result = await todoAccess.createTodo(item);
    return result;
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]>{
    const result = await todoAccess.getTodosForUser(userId);
    return result;
}

export async function getTodoById(todoId : string){
    return await todoAccess.getTodoById(todoId);
}

export async function updateTodo(todoId: string, userId: string, 
                                updateRequest: UpdateTodoRequest): Promise<any>{
    const item = await getTodoById(todoId);
    if( item.userId !== userId)
    {
        logger.error('User ' + userId + ' do not have permission to update item' + todoId);
        throw createError(409, 'User ' + userId + ' do not have permission to update item' + todoId);
    }
    return todoAccess.updateTodo(todoId, userId, updateRequest);
}

export async function deleteTodo(todoId: string, userId: string): Promise<any>{
    const item = await getTodoById(todoId);
    if( item.userId !== userId){
        logger.error('User ' + userId + ' do not have permission to delete item ' + todoId);
        throw createError(409, 'User ' + userId + ' do not have permission to delete item ' + todoId);
    }
    await todoAccess.deleteItem(todoId, userId);
}

export async function createAttachmentPresignedUrl(todoId: string): Promise<string>{
    return s3Helper.getReadSignedUrl(todoId);
}