var express = require("express");
var createServer = require("../server/server");
var webdriver = require("selenium-webdriver");
var istanbul = require("istanbul");
var path = require("path");
var fs = require("fs");

var testPort = 52684;
var baseUrl = "http://localhost:" + testPort;
var instrumenter = new istanbul.Instrumenter();
var collector = new istanbul.Collector();
var gatheringCoverage = process.env.running_under_istanbul;
var coverageFilename = "build_artifacts/coverage-e2e.json";

var driver;
var router;
var server;

module.exports.setupDriver = function() {
    driver = new webdriver.Builder().forBrowser("chrome").build();
};

module.exports.setupServer = function(done) {
    router = express.Router();
    if (gatheringCoverage) {
        router.get("/main.js", function(req, res) {
            var absPath = path.join(__dirname, "..", "public", "main.js");
            res.send(instrumenter.instrumentSync(fs.readFileSync("public/main.js", "utf8"), absPath));
        });
    }
    server = createServer(testPort, router, done);
};

module.exports.teardownServer = function(done) {
    server.close(done);
};

module.exports.teardownDriver = function() {
    if (gatheringCoverage) {
        driver.executeScript("return __coverage__;").then(function(coverage) {
            collector.add(coverage);
        });
    }
    driver.quit();
};

module.exports.reportCoverage = function() {
    if (gatheringCoverage) {
        fs.writeFileSync(coverageFilename, JSON.stringify(collector.getFinalCoverage()), "utf8");
    }
};

module.exports.navigateToSite = function() {
    driver.get(baseUrl);
};

module.exports.getTitleText = function() {
    return driver.findElement(webdriver.By.css("h1")).getText();
};

module.exports.getInputText = function() {
    return driver.findElement(webdriver.By.id("new-todo")).getAttribute("value");
};

module.exports.getErrorText = function() {
    var errorElement = driver.findElement(webdriver.By.id("error"));
    driver.wait(webdriver.until.elementTextContains(errorElement, "Failed"), 5000);
    return errorElement.getText();
};

module.exports.getTodoList = function() {
    var todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list-placeholder"));
    driver.wait(webdriver.until.elementIsNotVisible(todoListPlaceholder), 5000);
    return driver.findElements(webdriver.By.css("#todo-list li"));
};

module.exports.getTodoText = function(id) {
    driver.wait(function() {
        return driver.isElementPresent(webdriver.By.id("todo-text" + id));
    }, 1000);
    var textElement = driver.findElement(webdriver.By.id("todo-text" + id));
    return textElement.getText();
};

module.exports.addTodo = function(text) {
    driver.findElement(webdriver.By.id("new-todo")).sendKeys(text);
    driver.findElement(webdriver.By.id("submit-todo")).click();
};

module.exports.removeTodo = function(id) {
    driver.wait(function() {
        return driver.isElementPresent(webdriver.By.id("del-btn" + id));
    }, 1000);

    driver.findElement(webdriver.By.id("del-btn" + id)).then(function(button) {
        button.click();
    });
};

module.exports.updateTodo = function(id, newText) {
    driver.wait(function() {
        return driver.isElementPresent(webdriver.By.id("upd-btn" + id));
    }, 1000);
    driver.findElement(webdriver.By.id("upd-btn" + id)).then(function(button) {
        button.click();
    });
    driver.wait(function() {
        return driver.isElementPresent(webdriver.By.id("upd-input" + id));
    }, 1000);
    driver.findElement(webdriver.By.id("upd-input" + id)).then(function(inputField) {
        inputField.sendKeys(newText);
    });
    driver.wait(function() {
        return driver.isElementPresent(webdriver.By.id("upd-confirm" + id));
    }, 1000);
    driver.findElement(webdriver.By.id("upd-confirm" + id)).then(function(button) {
        button.click();
    });
};

module.exports.toggleTodoComplete = function(id) {
    driver.wait(function() {
        return driver.isElementPresent(webdriver.By.id("completed-btn" + id));
    }, 1000);

    driver.findElement(webdriver.By.id("completed-btn" + id)).click();
};

module.exports.deleteCompletedTodos = function() {
    driver.wait(function() {
        return driver.isElementPresent(webdriver.By.id("delete-complete-btn"));
    }, 1000);

    driver.findElement(webdriver.By.id("delete-complete-btn")).click();
};

module.exports.getTodoTextClass = function(id) {
    driver.wait(function() {
        return driver.isElementPresent(webdriver.By.id("todo-text" + id));
    }, 1000);
    return driver.findElement(webdriver.By.id("todo-text" + id)).getAttribute("class");
};

module.exports.getCompleteCounterText = function() {
    driver.wait(function() {
        return driver.isElementPresent(webdriver.By.id("count-label"));
    }, 1000);

    return driver.findElement(webdriver.By.id("count-label")).getText();
};

module.exports.filterTodos = function(filter) {
    driver.wait(function() {
        return driver.isElementPresent(webdriver.By.id("filter-button-" + filter));
    }, 1000);
    driver.findElement(webdriver.By.id("filter-button-" + filter)).click();
};

module.exports.getTodoItemClass = function(id) {
    driver.wait(function() {
        return driver.isElementPresent(webdriver.By.id("todo-item" + id));
    }, 1000);

    return driver.findElement(webdriver.By.id("todo-item" + id)).getAttribute("class");
};

module.exports.setupErrorRoute = function(action, route) {
    if (action === "get") {
        router.get(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "post") {
        router.post(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "put") {
        router.put(route, function(req, res) {
            res.sendStatus(404);
        });
    }
};
