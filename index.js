let { initQuestions, addEmpQuestions, removeEmpQuestions, updateQuestions, 
    updateEmpManagerQuestions1, updateEmpManagerQuestions2, addRoleQuestions,
    addDeptQuestions, pythonQuestion } = require("./questions.js");
const inquirer = require("inquirer");
const connection = require("./app/config/connection")
const { spawn } = require("child_process");

let pythonInstalled = false;    // tracks whether user has python 3 installed


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

async function pythonAsk() {
    pythonAnswer = await inquirer.prompt(pythonQuestion);
    pythonInstalled = pythonAnswer.python;
}

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    pythonAsk().then(() => initAsk());
});

/** Initial menu, stores the answer in the variable 'answer'.
 Then directs user to new questions depending on the answer. */
function initAsk() {
    console.log(`\n=========================================\n`)
    inquirer.prompt(initQuestions).then(function(answer) {
        switch (answer.manageChoice) {
            case "View all employees by department":
                viewEmployeesByDept().then(data => {
                    formatDataTable(data)
                    .then(table => console.log(table))
                    .then(initAsk);
                })
                break;
            case "View all employees by manager":
                viewEmployeesByManager().then(data => {
                    formatDataTable(data)
                    .then(table => console.log(table))
                    .then(initAsk);
                })
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
                getAllRoles().then(data => {
                    formatDataTable(data)
                    .then(table => console.log(table))
                    .then(initAsk);
                })
                break;
            case "Add role":
                addToAllRoles().then(initAsk);  // TODO: update with params about role
                break;
            case "Remove role":
                removeFromAllRoles().then(initAsk); // TODO: role params
                break;
            case "View all departments":
                getAllDepartments().then(data => {
                    formatDataTable(data)
                    .then(table => console.log(table))
                    .then(initAsk);
                })
                break;
            case "Add department":
                addDepartment().then(initAsk);
                break;
            case "Remove department":
                removeDepartment().then(initAsk);
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
        connection.query("SELECT first_name, last_name, role.title, role.salary, department.dept_name, manager_id FROM employee"
            + " JOIN role ON employee.role_id = role.id"
            + " JOIN department ON department.id = role.department_id"
            + " ORDER BY department.dept_name;",
            (err, data) => {
                if (err) throw err;
                getManagerName(data).then(managerIdArray => {
                    data.forEach(elem => {
                        elem["manager_name"] = managerIdArray[elem["manager_id"]];
                        elem["manager_name"] === undefined ? elem["manager_name"] = "None" : null;
                        delete elem.manager_id;
                    })
                    resolve(data);
                })
            }
        )
    }).catch((err) => {
        connection.end();
        reject(err);
    })
}

/** View all employees, ordered by manager id. */
function viewEmployeesByManager() {
    return new Promise(function(resolve, reject) {
        connection.query("SELECT first_name, last_name, manager_id FROM employee"
            + " ORDER BY manager_id;",
            (err, data) => {
                if (err) throw err;
                getManagerName(data).then(managerIdArray => {
                    data.forEach(elem => {
                        elem["manager_name"] = managerIdArray[elem["manager_id"]];
                        elem["manager_name"] === undefined ? elem["manager_name"] = "None" : null;
                        delete elem.manager_id;
                    })
                    resolve(data);
                })
            }
        )
    }).catch((err) => {
        connection.end();
        reject(err);
    })
}

/** returns a promise that gets a manager's name, based on their id
 * The resolved promise data will be of the format { id : wholeName, id : wholeName, ...}
 * @param {Array} objArr : an array of objects, each of which MUST contain a manager_id value. */
function getManagerName(objArr) {
    // create an array consisting of all manager ids
    managerIdArray = [];
    for (let elem of objArr) {
        elem["manager_id"] !== null ? managerIdArray.push(elem["manager_id"]) : null;
    }

    // query the names corresponding to all manager ids
    let query = "SELECT first_name, last_name, id FROM employee where id = ";
    for (let i = 0, j = managerIdArray.length; i < j; i++) {
        query += managerIdArray[i];
        // if not yet at final element, add in an OR statement
        if (i < j - 1) {
            query += " OR id = "
        }
    }
    query += ";";

    // query for the names of the managers.
    return new Promise((resolve, reject) => {
        connection.query(query, (err, data) => {
            if (err) throw err;
            data.forEach(elem => {
                let wholeName = elem["first_name"] + " " + elem["last_name"];
                elem['wholeName'] = wholeName;
            })
            // create an object with employee ids as keys, and whole names as values.
            let idNameObj = {};
            data.forEach(elem => {
                idNameObj[elem["id"]] = elem["wholeName"];
            })
            resolve(idNameObj);
        })
    }).catch((err) => {
        connection.end();
        reject(err);
    })
}


/** Gets an array of all titles and managers, along with their ids. Stores these separate arrays
 * in a single object. */
function getEmployeeInfo() {
    // for each of the above, run the create choice array function
    return new Promise((resolve, reject) => {
        let titlePromise = createChoiceArray("role", "title");
        let managerPromise = getEmployeeNamesArray();
        let roleArr;
        let managerArr;
        
        // get the appropriate arrays of choices, before returning the promise for the choice array.
        let choiceObj = {}
        titlePromise.then((arr) => {
            roleArr = arr;
            choiceObj.roles = roleArr;
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
}

/** Given a obj consisting of arrays from createChoiceArray(), containing roles, depts, and managers, 
 * populates the choice arrays of the addEmpQuestions array. */
function populateAddChoices(choiceArrays) {
    addEmpQuestions[2].choices = [];
    addEmpQuestions[4].choices = [];
    for (let elem of choiceArrays.roles) {
        addEmpQuestions[2].choices.push(elem.title);
    }
    for (let elem of choiceArrays.managers) {
        addEmpQuestions[4].choices.push(elem.wholeName);
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

                // Finally, the employee table must be updated. To do this, the database must be queried for department and manager ids.
                connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
                    [answer.firstName, answer.lastName, roleID, managerID],
                    (err, data) => {
                        if (err) throw err;
                        // console.log(data);
                        resolve();
                    }
                )
            })
        })
    }).catch((err) => {
        connection.end();
        reject(err);
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
    }).catch((err) => {
        connection.end();
        reject(err);
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
    }).catch((err) => {
        connection.end();
        reject(err);
    })
}


function updateEmpManager() {
    return new Promise(function(resolve, reject) {
        let empPromise = getEmployeeNamesArray();
        empPromise.then(arr => {
            for (let elem of arr) {
                updateEmpManagerQuestions1[0].choices.push(elem["wholeName"]);
            }
            return arr
        }).then((arr) => {
            inquirer.prompt(updateEmpManagerQuestions1, answer => {
                return answer;
            }).then(answer => {
                for (let elem of arr) {
                    elem["wholeName"] !== answer.name ? updateEmpManagerQuestions2[0].choices.push(elem["wholeName"]) : null;
                }
                inquirer.prompt(updateEmpManagerQuestions2, answer2 => {
                    return (answer2)
                }).then(answer2 => {
                    let managerID;
                    let empID;
                    for (let elem of arr) {
                        elem["wholeName"] === answer.name ? empID = elem["id"] : null;
                        elem["wholeName"] === answer2.manager ? managerID = elem["id"] : null;
                    }
                    connection.query("UPDATE employee SET manager_id = ? WHERE id = ?", [managerID, empID], (err, data) => {
                        if (err) throw err;
                        console.log(`Manager for ${answer.name} updated to ${answer2.manager}`);
                        resolve();
                    })
                })
            })
        })
    }).catch((err) => {
        connection.end();
        reject(err);
    })
}

function getAllRoles() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT title, salary FROM role", (err, data) => {
            if (err) throw err;
            resolve(data);
        })
    }).catch((err) => {
        connection.end();
        reject(err);
    })
}


function getAllDepartments() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT dept_name FROM department", (err, data) => {
            if (err) throw err;
            resolve(data);
        })
    }).catch((err) => {
        connection.end();
        reject(err);
    })
}


function formatDataTable(columns) {
    return new Promise((resolve, reject) => {
        // add columns array to argument vectors to be passed to python
        let args = ["./nodePythonApp/formatter.py"]
        // console.log(columns)
        for (let columnName in columns[0]) {
            args.push(columnName)
        }
        numColumns = args.length - 1;
        args.splice(1, 0, numColumns)
        // now args is the python filename, the number of columns, plus a list of the column names

        // finally, add info for each object in the column (an employee, for example) to args list
        for (let obj of columns) {
            for (let key in obj) {
                args.push(obj[key])
            }
        }

        // use a different function to print the table, depending on whether python is installed or not.
        if (pythonInstalled) {
            // different terminal commands to open python.
            let pythonFilenames = ["py", "python3", "python"]
            let pythonFile = 0;
            spawnPython(pythonFilenames[pythonFile], args).then(data => {
                resolve(data);
            })
            // try the different terminal commands one at a time
            .catch((err) => {
                pythonFile++;
                spawnPython(pythonFilenames[pythonFile], args).then(data => {
                    resolve(data);
                }).catch((err) => {
                    pythonFile++;
                    spawnPython(pythonFilenames[pythonFile], args).then(data => {
                        resolve(data);
                    }).catch((err) => {
                        reject("Error: Could not find python filepath. Changing configuration to use JavaScript instead.");
                    })
                })
            })
        }
        
        // if python is not installed, can still use the same args list.
        // This code block is roughly equivalent to the code in the formatter.py file
        if (!pythonInstalled) {
            let columnsString = "";
            columnCounter = 0;
            // console.log(args)
            // args[1] is the number of columns. starting at args[2] is the data to go in each column
            let rowStr = "";
            let columnLength = 25;
            for (let i = 2, j = args.length; i < j; i++) {
                let truncatedArg = args[i].toString().slice(0, columnLength);
                rowStr += truncatedArg;
                // console.log(rowStr)
                let remainingLength = columnLength - truncatedArg.length;
                for (let i = 0; i < remainingLength; i++) {
                    rowStr += " ";
                }
                rowStr += " ";
                // console.log(rowStr)
                columnCounter++;
                if (columnCounter % Number(args[1]) === 0) {
                    rowStr += "\n"
                }
                if (columnCounter === Number(args[1])) {
                    headerStr = ""
                    for (let i = 0; i < Number(args[1]); i++) {
                        for (let j = 0; j < columnLength; j++) {
                            headerStr += "_";
                        }
                    }
                    headerStr += "\n";
                    rowStr += headerStr;
                }
            }
            resolve(rowStr)
        }
    }).catch((err) => {
        // if cannot find python, try again without python
        if (err === "Error: Could not find python filepath. Changing configuration to use JavaScript instead.") {
            console.log(err);
            pythonInstalled = false;
            formatDataTable(columns)
        }
        else {
            connection.end();
            reject(err);
        }
    })
}

/** Spawn new python program designed to accept an array of arguments and format into a table.
 * On data event, return promised data (the formatted table) as a string
 * @param {array} args : An array in the format [python_script_name, number of columns, column data ...,]
 * @param {string} pythonFile : The command to access python in a terminal. This is usually "python3", "python", or "py"*/
function spawnPython(pythonFile, args) {
    return new Promise((resolve, reject) => {
        let py = spawn(pythonFile, args).on('error', (err) => {
            reject("Improper python path.");
        })
        let found = false;
        py.stdout.on('data', (data) => {
            data = data.toString();
            found = true;
            resolve(data);
        })
        // If system hangs due to permission error, etc, wait to see if python file has been found before returning promise rejection
        setTimeout(() => {
            if (!found) {
                console.log("Could not find python filepath. Searching...")
                reject("Improper python path.");
            }
        }, 1500);
    })
}

function addToAllRoles() {
    return new Promise((resolve, reject) => {
        getAllDepartments().then(data => {
            addRoleQuestions[2].choices = [];
            for (let elem of data) {
                addRoleQuestions[2].choices.push(elem["dept_name"]);
            }
            return data;
        }).then((data) => {
            inquirer.prompt(addRoleQuestions, answers => {
                console.log(answers)
                return answers;
            }).then(answers => {
                for (let elem of data) {
                    if (elem["dept_name"] === answers["dept_name"]) {
                        var deptID = elem["id"];
                        break;
                    }
                }
                connection.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", [answers.title, answers.salary, deptID], (err, data) => {
                    if (err) throw err;
                    console.log(data)
                    resolve();
                })
            })
        })
    }).catch((err) => {
        connection.end();
        reject(err);
    })
}


function removeFromAllRoles() {

}

function addDepartment() {
    return new Promise((resolve, reject) => {
        inquirer.prompt(addDeptQuestions, (answer) => {
            return answer;
        }).then(answer => {
            connection.query("INSERT INTO department (dept_name) VALUES (?)", answer.dept_name, (err, data) => {
                if (err) throw err;
                console.log(data);
                resolve(data);
            })
        })
    }).catch((err) => {
        connection.end();
        reject(err);
    })
}

function removeDepartment() {

}