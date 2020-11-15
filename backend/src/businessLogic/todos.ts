import * as uuid from 'uuid'
import { TodosAccess } from '../dataLayer/todosAccess'
import { TodoItem } from "../models/TodoItem"
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from "../requests/CreateTodoRequest"
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todosAccess = new TodosAccess()

export async function updateTodo(
    userId: string,
    todoId: string,
    updateTodoRequest: UpdateTodoRequest
): Promise<TodoUpdate> {

    return await todosAccess.updateTodo(userId, todoId, updateTodoRequest)
}

export async function createTodo(
    userId: string,
    createTodoRequest: CreateTodoRequest,
): Promise<TodoItem> {

    const itemId = uuid.v4()
    const createdAt = new Date().toISOString()

    return await todosAccess.createTodo({
        todoId: itemId,
        userId: userId,
        name: createTodoRequest.name,
        done: false,
        dueDate: createTodoRequest.dueDate,
        createdAt: createdAt,
    })
}

export async function deleteTodo(todoId: string, userId: string) {
    return todosAccess.deleteTodo(todoId, userId)
}

export async function getTodosPerUser(userId: string): Promise<AWS.DynamoDB.DocumentClient.ItemList> {
    return todosAccess.getTodosPerUser(userId)
}
