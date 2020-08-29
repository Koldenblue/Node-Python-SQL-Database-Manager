let { initQuestions, addEmpQuestions, updateQuestions } = require("./questions.js");
const inquirer = require("inquirer");
const mysql = require("mysql");
const util = require("util");
const Role = require("Role_class.js");
const Employee = require("Employee_class.js");

let connection = mysql.createConnection({
    host: "localhost", 

    port: 3306,

    user:"root",

    password: "",
    database: "employee_DB"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    initAsk();
    connection.end();
});

function initAsk() {
    inquirer.prompt(initQuestions).then(function(answers) {
        console.log(answers);
    })
}


allRoles = [];

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