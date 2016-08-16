var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo(title, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("POST", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title
    }));
    createRequest.onload = function() {
        if (this.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function removeTodo(id, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("DELETE", "/api/todo/" + id);
    createRequest.onload = function() {
        if (this.status === 200) {
            callback();
        } else {
            error.textContent = "Failed to delete todo. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function updateTodo(id, newText, completeState, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("PUT", "/api/todo/" + id);
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: newText,
        completeState: completeState
    }));
    createRequest.onload = function() {
        if (this.status === 200) {
            callback();
        } else {
            error.textContent = "Failed to update todo. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function getTodoList(callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("GET", "/api/todo");
    createRequest.onload = function() {
        if (this.status === 200) {
            callback(JSON.parse(this.responseText));
        } else {
            error.textContent = "Failed to get list. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            todoList.appendChild(generateTodoListElement(todo));
        });
    });
}

function generateTodoListElement(todo) {
    var listItem = document.createElement("li");
    var todoText = document.createElement("p");
    todoText.class = "todo-text";
    todoText.id = "todo-text" + todo.id;
    todoText.textContent = todo.title;
    listItem.appendChild(todoText);
    //listItem.textContent = todo.title;
    var delBtn = document.createElement("button");
    delBtn.className = "del-btn";
    delBtn.id = "del-btn" + todo.id;
    delBtn.onclick = function() {
        removeTodo(todo.id, reloadTodoList);
    };
    delBtn.innerHTML = "Delete";
    var updBtn = document.createElement("button");
    updBtn.className = "upd-btn";
    updBtn.id = "upd-btn" + todo.id;
    updBtn.innerHTML = "Update";
    updBtn.onclick = function() {
        //create input field for updating the todo
        var updForm = document.createElement("form");
        var updInput = document.createElement("input");
        updInput.id = "upd-input" + todo.id;
        updInput.setAttribute("type", "text");
        var updConfirmButton = document.createElement("input");
        updConfirmButton.id = "upd-confirm" + todo.id;
        updConfirmButton.setAttribute("type", "submit");
        updConfirmButton.setAttribute("value", "Confirm");
        updForm.appendChild(updInput);
        updForm.appendChild(updConfirmButton);
        updInput.setAttribute("value", todo.title);
        todoText.parentNode.replaceChild(updForm, todoText);
        updForm.onsubmit = function() {
            updateTodo(todo.id, updInput.value, todo.isComplete, reloadTodoList);
        };
    };
    var completedBtn = document.createElement("button");
    completedBtn.innerHTML = "Done";
    completedBtn.className = "completed-btn";

    if (todo.isComplete) {
        todoText.classList.add("todo-complete");
    } else if (todoText.classList.contains("todo-complete")) {
        todoText.classList.remove("todo-complete");
    }

    completedBtn.id = "completed-btn" + todo.id;
    completedBtn.onclick = function() {
        updateTodo(todo.id, todoText.textContent, !todo.isComplete, reloadTodoList);
    };
    listItem.appendChild(completedBtn);
    listItem.appendChild(updBtn);
    listItem.appendChild(delBtn);
    return listItem;
}

reloadTodoList();
