/*global todoListApp, angular*/

todoListApp.controller("TodoListController", ["$scope", "todoListService", function ($scope, todoListService) {

    //Bindable variables
    $scope.todos = [];
    $scope.inputBoxText = "";
    $scope.errorText = "";
    $scope.todosLoaded = false;

    //Bindable methods
    $scope.getTodos = getTodos;
    $scope.addTodo = addTodo;
    $scope.deleteTodo = deleteTodo;
    $scope.updateTodo = updateTodo;
    $scope.numberOfCompletedTodos = numberOfCompletedTodos;
    $scope.deleteAllCompletedTodos = deleteAllCompletedTodos;
    $scope.filterTodos = filterTodos;

    angular.element(document).ready(function () {
        $scope.getTodos();
        var pollTimer = setInterval($scope.getTodos, 30000);
    });

    function getTodos() {
        $scope.todosLoaded = false;
        todoListService.getTodos()
            .then(function (response) {
                todoListService.updateTodoList($scope.todos, response.data);
                $scope.todosLoaded = true;
            }, function (response) {
                $scope.errorText =
                    "Failed to get list. Server returned " + response.status + " - " + response.statusText;
            });
    }

    function addTodo() {
        todoListService.addTodo($scope.inputBoxText)
            .then(function (response) {
                $scope.inputBoxText = "";
                $scope.getTodos();
            }, function (response) {
                $scope.errorText =
                    "Failed to create item. Server returned " + response.status + " - " + response.statusText;
            });
    }

    function deleteTodo(id) {
        todoListService.deleteTodo(id)
            .then(function (response) {
                $scope.getTodos();
            }, function (response) {
                $scope.errorText =
                    "Failed to delete item. Server returned " + response.status + " - " + response.statusText;
            });
    }

    function updateTodo(todo) {
        todoListService.updateTodo(todo)
            .then(function (response) {
                $scope.getTodos();
            }, function (response) {
                $scope.errorText =
                    "Failed to update item. Server returned " + response.status + " - " + response.statusText;
            });
    }

    function filterTodos(filter) {
        todoListService.filterTodos($scope.todos, filter);
    }

    function numberOfCompletedTodos() {
        return todoListService.numberOfCompletedTodos($scope.todos);
    }

    function deleteAllCompletedTodos() {
        $scope.todos.forEach(function (todo) {
            if (todo.isComplete) {
                $scope.deleteTodo(todo.id);
            }
        });
    }
}]);
