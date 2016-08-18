var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");

module.exports = function(port, middleware, callback) {
    var app = express();

    if (middleware) {
        app.use(middleware);
    }
    app.use(express.static("public"));
    app.use(bodyParser.json());

    var latestId = 0;
    var todos = [];

    function todo(id, title) {
        this.id = id;
        this.title = title;
        this.isComplete = false;
        this.beingUpdated = false;
        this.filtered = false;
    }

    // Create
    app.post("/api/todo", function(req, res) {
        var newTodo = new todo(latestId.toString(), req.body.title);
        latestId++;
        todos.push(newTodo);
        res.set("Location", "/api/todo/" + newTodo.id);
        res.sendStatus(201);
    });

    // Read
    app.get("/api/todo", function(req, res) {
        res.json(todos);
    });

    // Delete
    app.delete("/api/todo/:id", function(req, res) {
        var id = req.params.id;
        var todo = getTodo(id);
        if (todo) {
            todos = todos.filter(function(otherTodo) {
                return otherTodo !== todo;
            });
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    });

    //changing this
    app.put("/api/todo/:id", function(req, res) {
        var id = req.params.id;
        todos.forEach(function(todo, index) {
            if (todo.id === id) {
                todos[index] = req.body;
            }
        });
        if (getTodo(id)) {
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    });

    function getTodo(id) {
        return _.find(todos, function(todo) {
            return todo.id === id;
        });
    }

    var server = app.listen(port, callback);

    // We manually manage the connections to ensure that they're closed when calling close().
    var connections = [];
    server.on("connection", function(connection) {
        connections.push(connection);
    });

    return {
        close: function(callback) {
            connections.forEach(function(connection) {
                connection.destroy();
            });
            server.close(callback);
        }
    };
};
