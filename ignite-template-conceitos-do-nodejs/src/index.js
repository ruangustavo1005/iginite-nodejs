const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = getExistentUser(username);

  if (!!username) {
    request.user = user;
    return next();
  }

  return response.status(404).json({
    error: "User not found"
  });
}

function getExistentUser(username) {
  return users.find((existentUser) => {
    return existentUser.username == username;
  });
}

function findExistentTodo(request, response, next) {
  const { id } = request.params;

  const todo = request.user.todos.find((existentTodo) => {
    return existentTodo.id == id;
  });

  if (!!todo) {
    request.todo = todo;
    return next();
  }

  return response.status(404).json({
    error: "Todo not found"
  });
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if (getExistentUser(username)) {
    return response.status(400).json({
      error: "Users already exists"
    });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  return response.json(request.user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  request.user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, findExistentTodo, (request, response) => {
  const { title, deadline } = request.body;
  const { todo } = request;

  todo.title = title;
  todo.deadline = new Date(deadline);
  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, findExistentTodo, (request, response) => {
  const { todo } = request;

  todo.done = true;
  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, findExistentTodo, (request, response) => {
  const { user, todo } = request;

  const indexTodo = user.todos.findIndex((existentTodo) => {
    return existentTodo.id == todo.id;
  });

  user.todos.splice(indexTodo, 1);

  return response.status(204).json(todo);
});

module.exports = app;