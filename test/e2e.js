var testing = require("selenium-webdriver/testing");
var assert = require("chai").assert;
var expect = require("chai").expect;
var helpers = require("./e2eHelpers");

testing.describe("end to end", function() {
    this.timeout(20000);
    testing.before(helpers.setupDriver);
    testing.beforeEach(helpers.setupServer);
    testing.afterEach(helpers.teardownServer);
    testing.after(function() {
        helpers.teardownDriver();
        helpers.reportCoverage();
    });

    testing.describe("on page load", function() {
        testing.it("displays TODO title", function() {
            helpers.navigateToSite();
            helpers.getTitleText().then(function(text) {
                assert.equal(text, "TODO List");
            });
        });
        testing.it("displays empty TODO list", function() {
            helpers.navigateToSite();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute("get", "/api/todo");
            helpers.navigateToSite();
            helpers.getErrorText().then(function(text) {
                assert.equal(text, "Failed to get list. Server returned 500 - Internal Server Error");
            });
        });
    });
    testing.describe("on create todo item", function() {
        testing.it("clears the input field", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getInputText().then(function(value) {
                assert.equal(value, "");
            });
        });
        testing.it("adds the todo item to the list", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute("post", "/api/todo");
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getErrorText().then(function(text) {
                assert.equal(text, "Failed to create item. Server returned 500 - Internal Server Error");
            });
        });
        testing.it("can be done multiple times", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.addTodo("Another new todo item");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 2);
            });
        });
    });
    testing.describe("on deleting todo item", function() {
        testing.it("removes the todo from the list", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.removeTodo(0);
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
    });
    testing.describe("on updating todo item", function() {
        testing.it("shows the new text", function() {
            helpers.navigateToSite();
            helpers.addTodo("new todo item");
            helpers.updateTodo(0, " - now updated");
            helpers.getTodoText(0).then(function(text) {
                assert.equal(text, "new todo item - now updated");
            });
        });
    });
    testing.describe("on setting a todo item as complete", function() {
        testing.it("adds a new complete class to the todo text", function() {
            helpers.navigateToSite();
            helpers.addTodo("new todo item");
            helpers.toggleTodoComplete(0);
            helpers.getTodoTextClass(0).then(function(classname) {
                expect(classname).include("todo-text-complete");
            });
        });
        testing.it("takes complete class off when toggled twice", function() {
            helpers.navigateToSite();
            helpers.addTodo("new todo item");
            helpers.toggleTodoComplete(0);
            helpers.toggleTodoComplete(0);
            helpers.getTodoTextClass(0).then(function(classname) {
                expect(classname).not.include("todo-text-complete");
            });
        });
        testing.it("updates the complete counter", function() {
            helpers.navigateToSite();
            helpers.addTodo("new todo item");
            helpers.toggleTodoComplete(0);
            helpers.getCompleteCounterText().then(function(counterText) {
                assert.equal(counterText, "1/1 complete");
            });
        });
    });
    testing.describe("when deleting all completed todos", function() {
        testing.it("should updated complete counter", function() {
            helpers.navigateToSite();
            helpers.addTodo("1st todo");
            helpers.addTodo("2nd todo");
            helpers.addTodo("3rd todo");
            helpers.toggleTodoComplete(1);
            helpers.deleteCompletedTodos();
            helpers.getCompleteCounterText().then(function(counterText) {
                assert.equal(counterText, "0/2 complete");
            });
        });
        testing.it("should update todo list", function() {
            helpers.navigateToSite();
            helpers.addTodo("1st todo");
            helpers.addTodo("2nd todo");
            helpers.addTodo("3rd todo");
            helpers.toggleTodoComplete(1);
            helpers.deleteCompletedTodos();
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 2);
            });
        });
    });
    testing.describe("when filtering todos", function() {
        testing.it("should show all after clicking all", function() {
            helpers.navigateToSite();
            helpers.addTodo("1st todo");
            helpers.addTodo("2nd todo");
            helpers.addTodo("3rd todo");
            helpers.toggleTodoComplete(1);
            helpers.filterTodos("all");
            helpers.getTodoItemClass(0).then(function(output) {
                expect(output).to.not.contain("ng-hide");
            });
            helpers.getTodoItemClass(1).then(function(output) {
                expect(output).to.not.contain("ng-hide");
            });
            helpers.getTodoItemClass(2).then(function(output) {
                expect(output).to.not.contain("ng-hide");
            });
        });
        testing.it("should show only completed todos after clicking completed", function() {
            helpers.navigateToSite();
            helpers.addTodo("1st todo");
            helpers.addTodo("2nd todo");
            helpers.addTodo("3rd todo");
            helpers.toggleTodoComplete(1);
            helpers.filterTodos("completed");
            helpers.getTodoItemClass(0).then(function(output) {
                expect(output).to.contain("ng-hide");
            });
            helpers.getTodoItemClass(1).then(function(output) {
                expect(output).to.not.contain("ng-hide");
            });
            helpers.getTodoItemClass(2).then(function(output) {
                expect(output).to.contain("ng-hide");
            });

        });
        testing.it("should show only active todos after clicking active", function() {
            helpers.navigateToSite();
            helpers.addTodo("1st todo");
            helpers.addTodo("2nd todo");
            helpers.addTodo("3rd todo");
            helpers.toggleTodoComplete(1);
            helpers.filterTodos("active");
            helpers.getTodoItemClass(0).then(function(output) {
                expect(output).to.not.contain("ng-hide");
            });
            helpers.getTodoItemClass(1).then(function(output) {
                expect(output).to.contain("ng-hide");
            });
            helpers.getTodoItemClass(2).then(function(output) {
                expect(output).to.not.contain("ng-hide");
            });
        });
    });
});
