const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

let users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(m => (m.username === username))

  if (!user) return response.status(404).send({ error: 'User not found'})

  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  const user = { id: uuidv4(), name, username, todos: [] }

  const userExists = users.find(m=>(m.username === username))

  if (userExists) return response.status(400).send({error: 'username already exists'})

  users = [user, ...users]

  return response.status(201).send(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user
  return response.status(201).send(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const user = request.user
  const todo = { id: uuidv4(), title, done: false, deadline: new Date(deadline), created_at: new Date() }
  user.todos.push(todo)
  return response.status(201).send(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { title, deadline } = request.body
  const user = request.user

  const todo = user.todos.find(t => {
    if(t.id === id){
      t.title = title
      t.deadline = new Date(deadline)
      return t
    }
  })

  if (!todo) response.status(404).send({ error: 'a non existing todo' })

  return response.status(201).send(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const{ id } = request.params
  const user = request.user

  const todo = user.todos.find(t => {
    if (t.id === id) {
      t.done = true
      return t
    }
  })

  if (!todo) response.status(404).send({ error: 'non existing todo as done'})

  return response.status(201).send(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const user = request.user

  const todo = user.todos.find(t => t.id === id)

  if (!todo) response.status(404).send({ error: 'non existing todo'})

  user.todos.splice(todo, 1)

  return response.status(204).send(todo)
});

module.exports = app;