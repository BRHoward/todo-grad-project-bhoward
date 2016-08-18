/*global angular*/

angular.module("todoList", [])
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
                    $scope.todos = response.data;
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

        angular.element(document).ready(function() {
            $scope.getTodos();
        });
        var pollTimer = setInterval($scope.getTodos, 30000);

    }]);
