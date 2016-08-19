/*global angular, _*/

angular.module("todoList", ["ngAnimate"])
    .controller("TodoListController", ["$scope", "$http", function($scope, $http) {

        $scope.todos = [];
        $scope.inputBoxText = "";
        $scope.errorText = "";
        $scope.todosLoaded = false;

        $scope.getTodos = function() {
            $scope.todosLoaded = false;
            $http({
                    method: "GET",
                    url: "api/todo/"
                })
                .then(function(response) {
                    var newList = response.data;
                    $scope.updateTodoList(newList);
                    $scope.todosLoaded = true;
                }, function(response) {
                    $scope.errorText =
                        "Failed to get list. Server returned " + response.status + " - " + response.statusText;
                });
        };

        $scope.addTodo = function() {
            $http({
                    method: "POST",
                    url: "api/todo/",
                    data: {
                        title: $scope.inputBoxText
                    }
                })
                .then(function(response) {
                    $scope.inputBoxText = "";
                    $scope.getTodos();
                }, function(response) {
                    $scope.errorText =
                        "Failed to create item. Server returned " + response.status + " - " + response.statusText;
                });
        };

        $scope.deleteTodo = function(id) {
            $http({
                    method: "DELETE",
                    url: "api/todo/" + id,
                })
                .then(function(response) {
                    $scope.getTodos();
                }, function(response) {
                    $scope.errorText =
                        "Failed to delete item. Server returned " + response.status + " - " + response.statusText;
                });
        };

        $scope.updateTodo = function(todo) {
            $http({
                    method: "PUT",
                    url: "api/todo/" + todo.id,
                    data: todo,
                })
                .then(function(response) {
                    $scope.getTodos();
                }, function(response) {
                    $scope.errorText =
                        "Failed to update item. Server returned " + response.status + " - " + response.statusText;
                });
        };

        $scope.numberOfCompletedTodos = function() {
            return $scope.todos.filter(function(todo) {
                return todo.isComplete;
            }).length;
        };

        $scope.deleteAllCompletedTodos = function() {
            $scope.todos.forEach(function(todo) {
                if (todo.isComplete) {
                    $scope.deleteTodo(todo.id);
                }
            });
        };

        $scope.filterTodos = function(filter) {
            switch (filter) {
                //displays both complete and uncomplete todos
                case "all":
                    $scope.todos.forEach(function(todo) {
                        todo.filtered = false;
                    });
                    break;
                    //only displays the active (uncompleted) todos
                case "active":
                    $scope.todos.forEach(function(todo) {
                        todo.filtered = todo.isComplete ? true : false;
                    });
                    break;
                    //only displays the completed todos
                case "complete":
                    $scope.todos.forEach(function(todo) {
                        todo.filtered = todo.isComplete ? false : true;
                    });
                    break;
            }
        };

        /*
            Rather than replace the whole local list with the fetched list we
            find the differences in the lists and updated the local list accordingly.
            This removes flicker on reloads and allows use of angular animations.
        */
        $scope.updateTodoList = function(newList) {
            var type = "";
            if ($scope.todos.length > newList.length) {
                type = "deletion";
            } else if ($scope.todos.length < newList.length) {
                type = "addition";
            } else if ($scope.todos.length === newList.length) {
                type = "update";
            }
            var i = 0;
            switch (type) {
                case "deletion":
                    for (i = 0; i < $scope.todos.length; i++) {
                        if (!newList[i] || $scope.todos[i].id !== newList[i].id) {
                            $scope.todos.splice(i, 1);
                            i--;
                        }
                    }
                    break;
                case "addition":
                    for (i = 0; i < newList.length; i++) {
                        if (!$scope.todos[i] || $scope.todos[i].id !== newList[i].id) {
                            $scope.todos.splice(i, 0, newList[i]);
                            i--;
                        }
                    }
                    break;
                case "update":
                    for (i = 0; i < $scope.todos.length; i++) {
                        if (!_.isMatch($scope.todos[i], newList[i])) {
                            $scope.todos.splice(i, 1, newList[i]);
                        }
                    }
                    break;
            }
        };

        angular.element(document).ready(function() {
            $scope.getTodos();
        });
        var pollTimer = setInterval($scope.getTodos, 30000);

    }]);
