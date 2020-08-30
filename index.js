let { initQuestions, addEmpQuestions, updateQuestions } = require("./questions.js");
const inquirer = require("inquirer");
const mysql = require("mysql");
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
});

/** searches database. Finds a column, choice, from a table.
 * Returns a promise to put all entries in that column into an array, for later use by inquirer. */
function createChoiceArray(choice, table) {
    return new Promise(function(resolve, reject) {
        let query = "SELECT " + choice + " FROM " + table;
        connection.query(query, (err, data) => {
            if (err) reject(err);
            choiceArray = [];
            for (let i = 0, j = data.length; i < j; i++) {
                choiceArray.push(data[i][choice]);
            }
            resolve(choiceArray);
        })
    })
}
// let arrayPromise = createChoiceArray("title", "role")
// arrayPromise.then((data) => console.log(data))

/** Initial menu, stores the answer in the variable 'answer'.
 Then directs user to new questions depending on the answer. */
function initAsk() {
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

/** View all employees, ordered by department name. */
function viewEmployeesByDept() {
    return new Promise(function(resolve, reject) {
        connection.query("SELECT first_name, last_name, department.dept_name FROM employee"
            + " JOIN role ON employee.role_id = role.id"
            + " JOIN department ON department.id = role.department_id"
            + " ORDER BY department.dept_name;",
            (err, data) => {
                if (err) throw err;
                console.log(data);
                resolve(data);
            }
        )
    })
}

/** View all employees, ordered by manager name. */
function viewEmployeesByManager() {
    return new Promise(function(resolve, reject) {
        connection.query("SELECT first_name, last_name, manager.manager_name FROM employee"
            + " JOIN manager ON employee.manager_id = manager.id"
            + " ORDER BY manager.manager_name;",
            (err, data) => {
                if (err) throw err;
                console.log(data);
                resolve(data);
            }
        )
    })
}

/** Gets an array of all titles from the role table.  Stores these values in arrays. 
 * Asks questions about a new employee, using the array values as choices. */
async function getEmployeeInfo() {
    // for each of the above, run the create choice array function
    return new Promise((resolve, reject) => {
        let titlePromise = createChoiceArray("title", "role");
        let deptPromise = createChoiceArray("dept_name", "department");
        let managerPromise = createChoiceArray("manager_name", "manager");
        let roleArr;
        let deptArr;
        let managerArr;

        // get the appropriate arrays of choices, before returning the promise for the choice array.
        let choiceObj = {}
        titlePromise.then((arr) => {
            roleArr = arr;
            choiceObj.roles = roleArr;
            deptPromise.then(arr => {
                deptArr = arr;
                choiceObj.depts = deptArr;
                managerPromise.then(arr => {
                    managerArr = arr;
                    choiceObj.managers = managerArr;
                }).then(() => {
                    resolve(choiceObj)
                });
            });
        });
    });
}


function addEmployee() {
    return new Promise(function(resolve, reject) {
        // first get the choice arrays for departments, roles, and managers.
        let newChoice = getEmployeeInfo()
        newChoice.then((choiceArrays) => {
            console.log("choice arrays")
            console.log(choiceArrays)
            // edit the inquirer questions to include the choice arrays
            addEmpQuestions[2].choices = choiceArrays.roles;
            addEmpQuestions[3].choices = choiceArrays.depts;
            addEmpQuestions[6].choices = choiceArrays.managers;
            // get inquirer answers, and create a new Employee object based on the answers.
            inquirer.prompt(addEmpQuestions).then(answer => {
                answer.managerName === undefined ? answer.managerName = null : null;
                console.log(answer);
                let newEmployee = new Employee(answer.firstName, answer.lastName, answer.role, answer.department, answer.salary, answer.managerName);
                console.log(newEmployee);
                // Finally, the employee table must be updated. To do this, the database must be queried for department and manager ids.
                connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
                    [newEmployee.firstName, newEmployee.lastName, newEmployee.title, newEmployee.managerName],
                    (err, data) => {
                        if (err) throw err;
                        console.log(data);
                        resolve();
                    }
                )
                // connection.query(INSERT INTO)

            })
        })
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

function formatDataTable() {

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