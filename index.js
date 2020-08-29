let { initQuestions, addEmpQuestions, updateQuestions } = require("./questions.js");
const inquirer = require("inquirer");
const mysql = require("mysql");
const util = require("util");

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