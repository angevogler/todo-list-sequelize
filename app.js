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

// configure CSS
app.use(express.static('public'));

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
  Todos.findAll({
    order: [
      ['createdAt', 'DESC'],
    ]
  })
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

// mark task complete
app.post('/completed/:todos_id', function (req, res) {
  const id = req.params.todos_id;

  Todos.update({
    completed: true,
  }, {
    where: {
      id: id
    },
  }) .then(function() {
    res.redirect('/todo');
  });
});

// mark incomplete
app.post('/not_completed/:todos_id', function (req, res) {
  const id = req.params.todos_id;

  Todos.update({
    completed: false,
  }, {
    where: {
      id: id
    },
  }) .then(function() {
    res.redirect('/todo');
  });
});

// edit task
app.get('/edit/:todos_id', function (req, res) {
  const id = parseInt(req.params.todos_id);

  Todos.findAll({
    order: [
      ['createdAt', 'DESC'],
      ]
  })
    .then(function (todos) {
      for (let i = 0; i < todos.length; i++) {
        if (todos[i].id === id ) {
          todos[i].edit = true;
        } else {
          todos[i].edit = false;
        }
      }
      res.render('todo', {
        todos: todos,
      });
    })
});

app.post('/edit/:todos_id', function (req, res) {
  const id=req.params.todos_id;
    res.redirect('/edit/' + id);
});

app.post('/edited/:todos_id', function (req, res) {
  const id=req.params.todos_id;

  Todos.update({
    task: req.body.edited_task,
  }, {
    where: {
      id: id,
    } }, {
    order: [
      ['createdAt', 'DESC'],
      ]
  }) .then(function (todos) {
    res.redirect('/todo');
  }) .catch(function () {
    console.log("error")
  })
})

// delete task
app.post('/delete/:todo_id', function (req, res) {
  const id = req.params.todo_id;

  Todos.destroy({
    where: {
      id: id,
    }
  }) .then(function () {
    res.redirect('/todo');
  });
});

// delete all completed tasks
app.post('/delete_completed', function (req, res) {
  Todos.destroy({
    where: {
      completed: true,
    }
  }) .then(function() {
    res.redirect('/todo');
  });
});


/* ******** START SERVER ******** */
app.listen(4000);
