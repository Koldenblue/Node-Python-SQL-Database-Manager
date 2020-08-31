const inquirer = require("inquirer");
let { initQuestions, addEmpQuestions, removeEmpQuestions, updateQuestions } = require("./questions.js");
const mysql = require("mysql");
let connection = mysql.createConnection({
    host: "localhost", 
    
    port: 3306,
    
    user:"root",
    
    password: "sqlpasskev",
    database: "employee_DB"
});

// more trouble than this is worth... have to get inquirer, then all the questions, get the sql connection working,
// etc. etc.
class Menu {
    constructor() {

    }
    /** Initial menu, stores the answer in the variable 'answer'.
     Then directs user to new questions depending on the answer. */
    initAsk() {
        console.log(`\n=========================================\n`)
        inquirer.prompt(initQuestions).then(function(answer) {
            // console.log(answer);
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
}

module.exports = Menu;