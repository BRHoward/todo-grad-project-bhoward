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
    var todoText = document.createElement("span");
    todoText.textContent = todo.title;
    listItem.appendChild(todoText);
    //listItem.textContent = todo.title;
    var delBtn = document.createElement("button");
    delBtn.className = "del-btn";
    delBtn.id = "del-btn" + todo.id;
    delBtn.onclick = function() {
        //remove the 
        removeTodo(todo.id, reloadTodoList);
    };
    delBtn.innerHTML = "Delete";
    var updBtn = document.createElement("button");
    updBtn.className = "upd-btn";
    updBtn.id = "upd-btn" + todo.id;
    updBtn.innerHTML = "Update";
    updBtn.onclick = function() {
        //create input field for updating the todo
        var updInput = document.createElement("input");
        updInput.setAttribute("type","text");
        updInput.setAttribute("value", todo.title);
        todoText.parentNode.replaceChild(updInput, todoText);
        updBtn.innerHTML = "Confirm";
        updBtn.onclick = function() {
            updateTodo(todo.id);
        }
    };
    listItem.appendChild(delBtn);
    listItem.appendChild(updBtn);
    return listItem;
}

reloadTodoList();
