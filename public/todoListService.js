/*global todoListApp, _ */

todoListApp.service("todoListService", ["$http", function ($http) {
    var self = this;

    //public methods for use in controllers
    self.getTodos = getTodos;
    self.addTodo = addTodo;
    self.deleteTodo = deleteTodo;
    self.updateTodo = updateTodo;
    self.numberOfCompletedTodos = numberOfCompletedTodos;
    self.filterTodos = filterTodos;
    self.updateTodoList = updateTodoList;

    //public method implementation
    function getTodos() {
        return $http({
            method: "GET",
            url: "api/todo/"
        });
    }

    function addTodo(inputBoxText) {
        return $http({
            method: "POST",
            url: "api/todo/",
            data: {
                title: inputBoxText
            }
        });
    }

    function deleteTodo(id) {
        return $http({
            method: "DELETE",
            url: "api/todo/" + id,
        });

    }

    function updateTodo(todo) {
        return $http({
            method: "PUT",
            url: "api/todo/" + todo.id,
            data: todo,
        });
    }

    function numberOfCompletedTodos(todos) {
        return todos.filter(function (todo) {
            return todo.isComplete;
        }).length;
    }

    function filterTodos(todos, filter) {
        switch (filter) {
            //displays both complete and uncomplete todos
        case "all":
            todos.forEach(function (todo) {
                todo.filtered = false;
            });
            break;
            //only displays the active (uncompleted) todos
        case "active":
            todos.forEach(function (todo) {
                todo.filtered = todo.isComplete ? true : false;
            });
            break;
            //only displays the completed todos
        case "complete":
            todos.forEach(function (todo) {
                todo.filtered = todo.isComplete ? false : true;
            });
            break;
        }
    }

    /*
    Rather than replace the whole local list with the fetched list we
    find the differences in the lists and updated the local list accordingly.
    self removes flicker on reloads and allows use of angular animations.
    */
    function updateTodoList(oldList, newList) {
        var type = "";
        if (oldList.length > newList.length) {
            type = "deletion";
        } else if (oldList.length < newList.length) {
            type = "addition";
        } else if (oldList.length === newList.length) {
            type = "update";
        }
        var i = 0;
        switch (type) {
        case "deletion":
            for (i = 0; i < oldList.length; i++) {
                if (!newList[i] || oldList[i].id !== newList[i].id) {
                    oldList.splice(i, 1);
                    i--;
                }
            }
            break;
        case "addition":
            for (i = 0; i < newList.length; i++) {
                if (!oldList[i] || oldList[i].id !== newList[i].id) {
                    oldList.splice(i, 0, newList[i]);
                    i--;
                }
            }
            break;
        case "update":
            for (i = 0; i < oldList.length; i++) {
                if (!_.isMatch(oldList[i], newList[i])) {
                    oldList.splice(i, 1, newList[i]);
                }
            }
            break;
        }
    }
}]);
