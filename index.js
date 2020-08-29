let { initQuestions, addEmpQuestions, updateQuestions } = require("./questions.js");
const inquirer = require("inquirer");
const mysql = require("mysql");
const util = require("util");
const Role = require("./Role_class.js");
const Employee = require("./Employee_class.js");

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

function initAsk() {
    console.log(`\n=========================================\n`)
    inquirer.prompt(initQuestions).then(function(answer) {
        console.log(answer);
        switch (answer.manageChoice) {
            case "View all employees by department":
                viewEmployeesByDept();
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


allRoles = [];


function viewEmployeesByDept() {
    connection.query("SELECT first_name, last_name, department.name FROM employee"
        + " JOIN role ON employee.role_id = role.id"
        + " JOIN department ON department.id = role.department_id;",
        (err, data) => {
            if (err) throw err;
            console.log(data);
        }
    )
    initAsk();
}


function getAllRoles() {
    connection.query("SELECT name FROM role", (err, data) => {
        if (err) throw err;

    })
}

/** if a role already exists. If not, adds it to the allRoles array. */
addToAllRoles = (role) => {
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
removeFromAllRoles = (role) => {
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