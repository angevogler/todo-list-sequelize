/* ******** CONFIGURE APP ******** */
// required
const express = require('express');
const mustache = require('mustache-express');
const bodyparser = require('body-parser');
const Sequelize = require('sequelize');

// configure server
const app = express();

// configure mustache-express
app.engine('mustache', mustache());
app.set('views', './views');
app.set('view engine', 'mustache');

// configure body-parser
app.use(bodyparser.urlencoded({ extended: true }));

/* ******** TODO LIST SCHEMA ******** */
const db = new Sequelize('todo-list', 'angelavogler', '', {
    dialect: 'postgres',
});

const Todos = db.define('todos', {
    task: Sequelize.STRING,
    completed: Sequelize.BOOLEAN
});

// synchronize schema with db
Todos.sync().then(function () {
    console.log('todo list synched');

    // Todos.create({
    //   task: 'finish todo list project',
    //   completed: false,
    // });

});

/* ******** REQUESTS ******** */
// display list
app.get('/todo', function (req, res) {
  Todos.findAll()
    .then(function (todos) {
      res.render('todo', {
        todos: todos,
      });
    })
});

// add new task
app.post('/new_task', function (req, res) {
  Todos.create({
    task: req.body.new_task,
    completed: false,
  }).then(function (todos) {
    // wait until insertion of new task is compeleted then refresh
    res.redirect('/todo');
  });
});

/* ******** START SERVER ******** */
app.listen(4000);
