let { initQuestions, addEmpQuestions, removeEmpQuestions, updateQuestions, 
    updateEmpManagerQuestions1, updateEmpManagerQuestions2 } = require("./questions.js");
const inquirer = require("inquirer");
const mysql = require("mysql");
const Role = require("./Role_class.js");
const Employee = require("./Employee_class.js");
const connection = require("./app/config/connection")


initAsk();
/** searches database. Finds column, choice and 'id', from a table.
 * @param {string} table : the name of a table.
 * @param {string} choice : The name of one or more columns to add to the array.
 * Returns a promise to put all entries in that column into an array, for later use by inquirer.
 * The returned data contains objects, accessible through data[i][choice] and data[i]["id"] */
function createChoiceArray(table, ...choice) {
    return new Promise(function(resolve, reject) {
        let query = "SELECT ";
        for (let i = 0, j = choice.length; i < j; i++) {
            query += choice[i] + ", "
        }
        query += "id FROM " + table + ";";
        connection.query(query, (err, data) => {
            if (err) {console.error("choice array error!"); console.error(err); reject(err);}
            choiceArray = [];
            // console.log("data is:")
            // console.log(data)
            for (let i = 0, j = data.length; i < j; i++) {
                choiceArray.push(data[i]);
            }
            // console.log(choiceArray)
            resolve(choiceArray);
        })
    })
}
// let arrayPromise = createChoiceArray("role", "title")
// arrayPromise.then((data) => console.log(data[0]["id"]))

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
                connection.end();
                break;
        }
    })
}

/** View all employees, ordered by department name. */
function viewEmployeesByDept() {
    return new Promise(function(resolve, reject) {
        connection.query("SELECT first_name, last_name, role.title, role.salary, department.dept_name FROM employee"
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

/** View all employees, ordered by manager id. */
function viewEmployeesByManager() {
    return new Promise(function(resolve, reject) {
        connection.query("SELECT first_name, last_name, manager_id FROM employee"
            + " ORDER BY manager_id;",
            (err, data) => {
                if (err) reject(err);
                console.log(data);
                resolve(data);
            }
        )
    })
}

/** returns a promise that gets a manager's name, based on their id */
function getManagerName(...manager_id) {
    let query = "SELECT first_name, last_name, manager_id, id FROM employee where id = ";
    for (let i = 0, j = manager_id.length; i < j; i++) {
        query += manager_id[i];
        if (i < j - 1) {
            query += " OR id = "
        }
    }
    query += ";";
    return new Promise((resolve, reject) => {
        connection.query(query, (err, data) => {
            if (err) reject(err);
            data.forEach(elem => {
                let wholeName = elem["first_name"] + " " + elem["last_name"];
                elem['wholeName'] = wholeName;
            })
            resolve(data);
        })
    })
}

// getManagerName(1, 2, 3).then(data => console.log(data))

/** Gets an array of all titles, depts, and managers, along with their ids. Stores these 3 separate arrays
 * in a single object. */
function getEmployeeInfo() {
    // for each of the above, run the create choice array function
    return new Promise((resolve, reject) => {
        let titlePromise = createChoiceArray("role", "title");
        let deptPromise = createChoiceArray("department", "dept_name");

        let managerPromise = getEmployeeNamesArray();
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
                    // console.log(arr)
                    managerArr = arr
                    choiceObj.managers = managerArr;
                    // console.log("choice obj")
                    // console.log(choiceObj)
                }).then(() => {
                    resolve(choiceObj)
                });
            });
        });
    });
}

/** Given a obj consisting of arrays from createChoiceArray(), containing roles, depts, and managers, 
 * populates the choice arrays of the addEmpQuestions array. */
function populateAddChoices(choiceArrays) {
    addEmpQuestions[2].choices = [];
    addEmpQuestions[3].choices = [];
    addEmpQuestions[6].choices = [];
    for (let elem of choiceArrays.roles) {
        addEmpQuestions[2].choices.push(elem.title);
    }
    for (let elem of choiceArrays.depts) {
        addEmpQuestions[3].choices.push(elem.dept_name);
    }
    for (let elem of choiceArrays.managers) {
        addEmpQuestions[6].choices.push(elem.wholeName);
    }
}

/** Promise to add an employee to the database. */
function addEmployee() {
    return new Promise(function(resolve, reject) {
        // first get the choice arrays for departments, roles, and managers.
        getEmployeeInfo().then((choiceArrays) => {
            console.log("choice arrays - choiceObj from getEmployeeInfo()")
            console.log(choiceArrays)
            // edit the inquirer questions to include the choice arrays
            populateAddChoices(choiceArrays);

            // get inquirer answers, and create a new Employee object based on the answers.
            inquirer.prompt(addEmpQuestions).then(answer => {
                // if the user didn't pick a manager, set to null.
                answer.managerName === undefined ? answer.managerName = null : null;
                console.log(answer);


                // after getting the user answers, get the ids of the titles, depts, and managers
                for (let elem of choiceArrays.roles) {
                    if (answer.role === elem["title"]) {
                        var roleID = elem["id"];
                        break;
                    }
                }
                for (let elem of choiceArrays.depts) {
                    if (answer.department === elem["dept_name"]) {
                        var deptID = elem["id"];
                        break;
                    }
                }
                if (answer.managerName !== null) {
                    for (let elem of choiceArrays.managers) {
                        if (answer.managerName === elem["wholeName"]) {
                            var managerID = elem["id"];
                            break;
                        }
                    }
                }
                else {
                    var managerID = null;
                }
                let newEmployee = new Employee(answer.firstName, answer.lastName, answer.role, answer.department, answer.salary, answer.managerName);
                console.log(newEmployee)
                // Finally, the employee table must be updated. To do this, the database must be queried for department and manager ids.
                connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
                    [newEmployee.getFirstName(), newEmployee.lastName, roleID, managerID],
                    (err, data) => {
                        if (err) throw err;
                        // console.log(data);
                        resolve();
                    }
                )
            })
        })
    })
}

/** Returns a promise to get all employee first, last, whole names, as well as ids
 * Each employee is stored as an object in an array, with the properties accessible by 
 * array[i]["first_name"], ["last_name"], ["wholeName"], ["id"] */
function getEmployeeNamesArray() {
    return new Promise((resolve, reject) => {
        // first get employee info from the database
        createChoiceArray("employee", "first_name", "last_name").then(empArray => {
            // console.log("the employee first name and last names array")
            // console.log(empArray);

            // Concatenate the first and last names of each employee, and add to the employee objects returned from the database
            empArray.forEach(elem => {
                elem["wholeName"] = elem["first_name"] + " " + elem["last_name"];
            });
            resolve(empArray);
        });
    })
}
// Also need to check if that employee manages anyone
function removeEmployee() {
    return new Promise(function(resolve, reject) {
        getEmployeeNamesArray().then(empArray => {
            // add the employee names to the inquirer choices, after resetting choices array
            removeEmpQuestions[0].choices = ["Cancel"];
            empArray.forEach(elem => {
                removeEmpQuestions[0].choices.push(elem["wholeName"]);
            })
            inquirer.prompt(removeEmpQuestions).then(answer => {
                answer.name === "Cancel" ? resolve() : null;
                // find the whole name within empArray. Then delete that name from the database.
                for (let elem of empArray) {
                    if (answer.name === elem["wholeName"]) {
                        connection.query("DELETE FROM employee WHERE ?;",
                            { id : elem["id"]},
                            (err) => {if (err) throw err});
                        break;
                    }
                }
                resolve();
            })
        })
    })
}

function updateEmpRole() {
    return new Promise(function(resolve, reject) {
        getEmployeeNamesArray().then(empArray => {
            updateQuestions[0].choices = ["Cancel"];
            empArray.forEach(elem => {
                updateQuestions[0].choices.push(elem["wholeName"]);
            })
            // next get roles
            createChoiceArray("role", "title").then(choiceArr => {
                console.log(choiceArr);
                updateQuestions[1].choices = [];
                for (let elem of choiceArr) {
                    updateQuestions[1].choices.push(elem["title"])
                }
                return choiceArr;
            }).then(choiceArr => {
                inquirer.prompt(updateQuestions).then(answer => {
                    console.log(answer);
                    console.log(empArray)
                    console.log(choiceArr)
                    for (let elem of empArray) {
                        if (answer.name === elem["wholeName"]) {
                            var empID = elem["id"];
                            break;
                        }
                    }
                    for (let elem of choiceArr) {
                        if (answer.role === elem["title"]) {
                            var roleID = elem["id"];
                        }
                    }
                    connection.query("UPDATE employee SET role_id = ? WHERE id = ?",
                        [roleID, empID],
                        (err, data) => {
                            if (err) throw err;
                            console.log(data);
                            resolve();
                        }
                    )
                })
            })
        })
    })
}


function updateEmpManager() {
    return new Promise(function(resolve, reject) {
        let empPromise = getEmployeeNamesArray();
        empPromise.then(arr => {
            for (let elem of arr) {
                updateEmpManagerQuestions1[0].choices.push(elem["wholeName"]);
            }
            console.log(arr)
            return arr;
        }).then(arr => {
            for (let elem of arr) {
                updateEmpManagerQuestions1[0].choices.push(elem["wholeName"]);
            }
            inquirer.prompt(updateEmpManagerQuestions1, answer => {
                return answer
            }).then(answer => {
                console.log(arr)
                console.log(answer)
                for (let elem of arr) {
                    updateEmpManagerQuestions2[0].choices.push(elem["wholeName"]);
                }
                (inquirer.prompt(updateEmpManagerQuestions2), answer2 => {
                    console.log(answer2)
                })
            })
        })
        // connection.query("INSERT INTO manager (manager_name) VALUES ?",
        //     (err, data) => {
        //         if (err) throw err;
        //         console.log(data);
        //         resolve();
        //     }
        // )
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