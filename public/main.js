var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var completeCounter = document.getElementById("count-label");
var deleteCompletedTodoBtn = document.getElementById("delete-complete-btn");
var filterButtonAll = document.getElementById("filter-button-all");
var filterButtonActive = document.getElementById("filter-button-active");
var filterButtonComplete = document.getElementById("filter-button-completed");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

deleteCompletedTodoBtn.onclick = function() {
    getTodoList(function(todos) {
        todos.forEach(function(todo) {
            if (todo.isComplete) {
                removeTodo(todo.id, reloadTodoList);
            }
        });
    });
};

filterButtonAll.onclick = function() {
    filterTodos("all");
};
filterButtonActive.onclick = function() {
    filterTodos("active");
};
filterButtonComplete.onclick = function() {
    filterTodos("complete");
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
    todoList = document.getElementById("todo-list");
    var newList = document.createElement("ul");
    newList.id = "todo-list";

    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        var totalNumberOfCompletedTodos = todos.filter(function(todo) {
            return todo.isComplete;
        }).length;

        if (totalNumberOfCompletedTodos > 0) {
            deleteCompletedTodoBtn.style.display = "block";
        } else {
            deleteCompletedTodoBtn.style.display = "none";
        }
        completeCounter.textContent = "" + totalNumberOfCompletedTodos + "/" + todos.length + " complete";
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            newList.appendChild(generateTodoListElement(todo));
        });
    });

    todoList.parentNode.replaceChild(newList, todoList);
}

function generateTodoListElement(todo) {
    var listItem = document.createElement("li");
    listItem.className = "todo-item";
    listItem.id = "todo-item" + todo.id;
    var todoText = document.createElement("p");
    todoText.className = "todo-text";
    todoText.id = "todo-text" + todo.id;
    todoText.textContent = todo.title;
    listItem.appendChild(todoText);

    var delBtn = document.createElement("button");
    delBtn.className = "del-btn";
    delBtn.classList.add("button");
    delBtn.id = "del-btn" + todo.id;
    delBtn.onclick = function() {
        removeTodo(todo.id, reloadTodoList);
    };
    delBtn.innerHTML = "Delete";

    var updBtn = document.createElement("button");
    updBtn.className = "upd-btn";
    updBtn.classList.add("button");
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
        updConfirmButton.classList.add("button");
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
    completedBtn.classList.add("button");
    completedBtn.id = "completed-btn" + todo.id;

    if (todo.isComplete) {
        listItem.classList.add("todo-item-complete");
        todoText.classList.add("todo-text-complete");
    } else if (todoText.classList.contains("todo-text-complete")) {
        listItem.classList.remove("todo-item-complete");
        todoText.classList.remove("todo-text-complete");
    }

    completedBtn.onclick = function() {
        updateTodo(todo.id, todoText.textContent, !todo.isComplete, reloadTodoList);
    };
    listItem.appendChild(completedBtn);
    listItem.appendChild(updBtn);
    listItem.appendChild(delBtn);
    return listItem;
}

function filterTodos(filter) {
    var todoListItems = document.getElementsByClassName("todo-item");
    var i = 0;
    switch (filter) {
        case "all":
            for (i = 0; i < todoListItems.length; i++) {
                todoListItems[i].style.display = "list-item";
            }
            break;
        case "active":
            for (i = 0; i < todoListItems.length; i++) {
                todoListItems[i].style.display =
                    todoListItems[i].classList.contains("todo-item-complete") ? "none" : "list-item";
            }
            break;
        case "complete":
            for (i = 0; i < todoListItems.length; i++) {
                todoListItems[i].style.display =
                    todoListItems[i].classList.contains("todo-item-complete") ? "list-item" : "none";
            }
            break;
    }
}

reloadTodoList();
