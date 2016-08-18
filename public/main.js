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
    var dataToSend = JSON.stringify({
        title: title
    });
    makeRequest("api/todo", "POST", dataToSend, "Failed to create item.")
        .then(reloadTodoList);
    todoTitle.value = "";
    event.preventDefault();
};

deleteCompletedTodoBtn.onclick = function() {
    makeRequest("api/todo/", "GET", null, "Failed to get list.")
        .then(function(response) {
            return response.json();
        })
        .then(function(todos) {
            todos.forEach(function(todo) {
                if (todo.isComplete) {
                    makeRequest("api/todo/" + todo.id, "DELETE", null, "Failed to delete item.")
                        .then(reloadTodoList);
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

function makeRequest(url, method, body, errorText) {
    return fetch(url, {
            method: method,
            headers: {
                //"Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: body
        })
        .then(function(response) {
            if (response.ok) {
                return response;
            } else {
                var err = errorText + " Server returned " + response.status + " - " + response.statusText;
                throw err;
            }
        })
        .catch(function(err) {
            error.textContent = err;
        });
}

function reloadTodoList() {
    todoList = document.getElementById("todo-list");
    var newList = document.createElement("ul");
    newList.id = "todo-list";

    todoListPlaceholder.style.display = "block";

    makeRequest("api/todo/", "GET", null, "Failed to get list.")
        .then(function(response) {
            return response.json();
        })
        .then(function(todos) {
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

    var delBtn = makeButton(todo.id, "del", "Delete");
    delBtn.onclick = function() {
        makeRequest("api/todo/" + todo.id, "DELETE", null, "Failed to delete item.")
            .then(reloadTodoList);
    };

    var completedBtn = makeButton(todo.id, "completed", "Done");
    completedBtn.onclick = function() {
        var dataToSend = JSON.stringify({
            title: todoText.textContent,
            completeState: !todo.isComplete
        });
        makeRequest("api/todo/" + todo.id, "PUT", dataToSend, "Failed to update item.")
            .then(reloadTodoList);
    };

    var updBtn = makeButton(todo.id, "upd", "Update");
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
            var dataToSend = JSON.stringify({
                title: updInput.value,
                completeState: todo.isComplete
            });
            makeRequest("api/todo/" + todo.id, "PUT", dataToSend, "Failed to update item.")
                .then(reloadTodoList);
        };
    };

    //if the todo has been tagged as complete then add the complete css class to the element
    //if the todo is uncomplete but already has the complete css class then remove it
    if (todo.isComplete) {
        listItem.classList.add("todo-item-complete");
        todoText.classList.add("todo-text-complete");
    } else if (todoText.classList.contains("todo-text-complete")) {
        listItem.classList.remove("todo-item-complete");
        todoText.classList.remove("todo-text-complete");
    }

    listItem.appendChild(completedBtn);
    listItem.appendChild(updBtn);
    listItem.appendChild(delBtn);
    return listItem;
}

function makeButton(id, tag, label) {
    var newButton = document.createElement("button");
    newButton.className = tag + "-btn button";
    newButton.id = tag + "-btn" + id;
    newButton.innerHTML = label;
    return newButton;
}

function filterTodos(filter) {
    var todoListItems = document.getElementsByClassName("todo-item");
    var i = 0;
    switch (filter) {
        //displays both complete and uncomplete todos
        case "all":
            for (i = 0; i < todoListItems.length; i++) {
                todoListItems[i].style.display = "list-item";
            }
            break;
            //only displays the active (uncompleted) todos
        case "active":
            for (i = 0; i < todoListItems.length; i++) {
                todoListItems[i].style.display =
                    todoListItems[i].classList.contains("todo-item-complete") ? "none" : "list-item";
            }
            break;
            //only displays the completed todos
        case "complete":
            for (i = 0; i < todoListItems.length; i++) {
                todoListItems[i].style.display =
                    todoListItems[i].classList.contains("todo-item-complete") ? "list-item" : "none";
            }
            break;
    }
}
reloadTodoList();
var timerId = setInterval(reloadTodoList, 30000);
