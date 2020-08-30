let { initQuestions, addEmpQuestions, updateQuestions } = require("./questions.js");
const inquirer = require("inquirer");
const mysql = require("mysql");

const Role = require("./Role_class.js");
const Employee = require("./Employee_class.js");
const Choice = require("inquirer/lib/objects/choice");


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


function createChoiceArray(choice, table) {
    return new Promise(function(resolve, reject) {
        let query = "SELECT " + choice + " FROM " + table;
        connection.query(query, (err, data) => {
            if (err) reject(err);
            // console.log(data);
            // console.log(data[0][choice])
            choiceArray = [];
            for (let i = 0, j = data.length; i < j; i++) {
                choiceArray.push(data[i][choice]);
            }
            // console.log(choiceArray)
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
    // neet to get the titles of all roles, the lists of depatments, and the lists of managers.
    // the salary and name questions will be typed in

    // for each of the above, run the create choice array function
    return new Promise((resolve, reject) => {
        let titlePromise = createChoiceArray("title", "role");
        let deptPromise = createChoiceArray("dept_name", "department");
        let managerPromise = createChoiceArray("manager_name", "manager");
        let roleArr;
        roleReturned = false;
        let deptArr;
        deptReturned = false;
        let managerArr;
        managerReturned = false;

        let choiceObj = {}
        // get the appropriate arrays of choices
        titlePromise.then((arr) => {
            roleArr = arr;
            console.log(roleArr);
            choiceObj.roles = roleArr;
            roleReturned = true;
        }).then(() => {
            deptPromise.then(arr => {
                deptArr = arr;
                deptReturned = true;
                choiceObj.depts = deptArr;
                console.log("2nd")
                console.log(choiceObj)
            })
        }).then(() => {
            managerPromise.then(arr => {
                managerArr = arr;
                managerReturned = true;
                choiceObj.managers = managerArr;
            })
        }).then(() => {
            console.log("choice obj is")
            console.log(choiceObj)
            
            resolve(choiceObj)
        })
        // wait for all three choice arrays to return.
        // while (true) {
        //     console.log("w")
        //     if (roleReturned && managerReturned && deptReturned) {
        //         console.log("d")
        //         resolve(choiceObj);
        //         break;
        //     }
        // }
    })
}



//             roleTitles => {
//             inquirer.prompt(addEmpQuestions).then(answer => {
//                 answer.managerName === undefined ? answer.managerName = null : null;
//                 let newEmployee = new Employee(answer.firstName, answer.lastName, answer.role, answer.department, answer.salary, answer.managerName);
//                 console.log(newEmployee);
//                 resolve(newEmployee);
//             });
//         });
//     })
// }

function addEmployee() {
    return new Promise(function(resolve, reject) {
        getEmployeeInfo().then((newEmployee) => {
            console.log(newEmployee)
            connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
                [newEmployee.firstName, newEmployee.lastName, newEmployee.role, newEmployee.managerName],
                (err, data) => {
                    if (err) throw err;
                    console.log(data);
                    resolve();
                }
            )
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