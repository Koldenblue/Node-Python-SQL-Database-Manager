let { initQuestions, addEmpQuestions, updateQuestions } = require("./questions.js");
const inquirer = require("inquirer");
const mysql = require("mysql");
const util = require("util");
const Role = require("./Role_class.js");
const Employee = require("./Employee_class.js");
const SQLSelect = require("./SQLSelect_class.js");



let connection = mysql.createConnection({
    host: "localhost", 
    
    port: 3306,
    
    user:"root",
    
    password: "sqlpasskev",
    database: "employee_DB"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    initAsk();
    // connection.end();
});


let myQuery = new SQLSelect("first_name", "employee");
console.log(myQuery)
console.log(myQuery.createSelectQuery());
console.log("disp")

function initAsk() {
    console.log(`\n=========================================\n`)
    inquirer.prompt(initQuestions).then(function(answer) {
        console.log(answer);
        switch (answer.manageChoice) {
            case "View all employees by department":
                viewEmployeesByDept().then(initAsk);
                break;
            case "View all employees by manager":
                viewEmployeesByManager().then(initAsk);
                break;
            case "Add employee":
                addEmployee().then(initAsk);
                break;
            case "Remove employee":
                removeEmployee().then(initAsk);
                break;
            case "Update employee role":
                updateEmpRole().then(initAsk);
                break;
            case "Update employee manager":
                updateEmpManager().then(initAsk);
                break;
            case "View all roles":
                getAllRoles().then(initAsk);
                break;
            case "Add role":
                addToAllRoles().then(initAsk);  // TODO: update with params about role
                break;
            case "Remove role":
                removeFromAllRoles().then(initAsk); // TODO: role params
                break;
            case "Quit":
                connection.end();
                break;
            default:
                console.log("switch error!");
                break;
        }
    })
}


function viewEmployeesByDept() {
    return new Promise(function(resolve, reject) {
        connection.query("SELECT first_name, last_name, department.dept_name FROM employee"
            + " JOIN role ON employee.role_id = role.id"
            + " JOIN department ON department.id = role.department_id"
            + " ORDER BY department.dept_name;",
            (err, data) => {
                if (err) throw err;
                console.log(data);
                resolve();
            }
        )
    })
}

function viewEmployeesByManager() {
    return new Promise(function(resolve, reject) {
        connection.query("SELECT first_name, last_name, manager.manager_name FROM employee"
            + " JOIN manager ON employee.manager_id = manager.id"
            + " ORDER BY manager.manager_name;",
            (err, data) => {
                if (err) throw err;
                console.log(data);
                resolve();
            }
        )
    })
}

function addEmployee() {
    return new Promise(function(resolve, reject) {
        // first find manager - select manager names and offer choice
        // or enter manager name

        // then:
        connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ",

            (err, data) => {
                if (err) throw err;
                console.log(data);
                resolve();
            }
        )
    })
}

function removeEmployee() {
    return new Promise(function(resolve, reject) {
        connection.query("DELETE FROM employee",

            (err, data) => {
                if (err) throw err;
                console.log(data);
                resolve();
            }
        )
    })
}

function updateEmpRole() {
    return new Promise(function(resolve, reject) {
        connection.query("INSERT INTO role (title, salary) VALUES ?",

            (err, data) => {
                if (err) throw err;
                console.log(data);
                resolve();
            }
        )
    })
}


function updateEmpManager() {
    return new Promise(function(resolve, reject) {
        connection.query("INSERT INTO manager (manager_name) VALUES ?",
            (err, data) => {
                if (err) throw err;
                console.log(data);
                resolve();
            }
        )
    })
}


allRoles = [];

function getAllRoles() {
    connection.query("SELECT name FROM role", (err, data) => {
        if (err) throw err;

    })
}


/** if a role already exists. If not, adds it to the allRoles array. */
let addToAllRoles = (role) => {
    let roleAlreadyPresent = false;
    for (let elem of this.allRoles) {
        console.log(elem);
        if (elem === role) {
            console.log("Role already exists in database!");
            roleAlreadyPresent = true;
        }
    }
    roleAlreadyPresent ? null : this.allRoles.push(role);
}

/** Removes a role from the allRoles array. */
let removeFromAllRoles = (role) => {
    let foundRole = false;
    for (let i = 0, j = this.allRoles.length; i < j; i++) {
        if (this.allRoles[i] === role) {
            this.allRoles.splice(i, 1);
            foundRole = true;
            break;
        }
    }
    foundRole ? console.log(`The ${role} role was removed from the database.`)
        : console.log(`The ${role} role was not found in the database!`);
}