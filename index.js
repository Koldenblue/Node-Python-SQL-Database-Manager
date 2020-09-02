let { initQuestions, addEmpQuestions, removeEmpQuestions, updateQuestions, 
    updateEmpManagerQuestions1, updateEmpManagerQuestions2, addRoleQuestions,
    addDeptQuestions, pythonQuestion, removeRoleQuestion, removeDeptQuestion } = require("./questions.js");
const inquirer = require("inquirer");
const connection = require("./app/config/connection")
const { spawn } = require("child_process");     // for connecting to python file

let pythonInstalled = false;    // tracks whether user has python 3 installed

// Initialize program.
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    console.log("Make sure the employee database has been initialized and is in use!")
    pythonAsk().then(() => initAsk());
});

/** Sets the pythonInstalled bool to true or false, depending on user input. */
async function pythonAsk() {
    pythonAnswer = await inquirer.prompt(pythonQuestion);
    pythonInstalled = pythonAnswer.python;
}

/** Initial menu. Directs user to new questions depending on the answer.
 * This function calls itself after each operation (unless user selects 'Quit'). */
function initAsk() {
    console.log(`\n=========================================\n`)
    inquirer.prompt(initQuestions).then(function(answer) {
        switch (answer.manageChoice) {
            // if data is returned, use formatDataTable() to arrange the data into a table, then print into log.
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

/** Basic search query. Searches database. SELECTS ...choice, id FROM table.
 * @param {string} table : the name of a table.
 * @param {string} choice : The name of one or more columns to add to the array.
 * Returns a promise for later use by inquirer.
 * The returned data array contains objects, accessible through data[i][choice] and data[i]["id"] */
function createChoiceArray(table, ...choice) {
    return new Promise(function(resolve, reject) {
        // form query using parameters
        let query = "SELECT ";
        for (let i = 0, j = choice.length; i < j; i++) {
            query += choice[i] + ", ";
        }
        // also query the id
        query += "id FROM " + table + ";";
        connection.query(query, (err, data) => {
            if (err) throw err;
            // add queried objects to an array
            choiceArray = [];
            for (let i = 0, j = data.length; i < j; i++) {
                choiceArray.push(data[i]);
            }
            resolve(choiceArray);
        })
    }).catch((err) => {
        connection.end();
        reject(err);
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
                // run function to find managers based on manager_id field
                getManagerName(data).then(managerIdArray => {
                    data.forEach(elem => {
                        elem["manager_name"] = managerIdArray[elem["manager_id"]];
                        elem["manager_name"] === undefined ? elem["manager_name"] = "None" : null;
                        // manager_id is deleted so that it will not be displayed in formatted table
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
                // run function to find managers based on manager_id field
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

/** returns a promise that gets a manager's full name, based on their id
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
            query += " OR id = ";
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

/** Promise to add an employee to the database. Several queries must be made, since
 * the questions in the inquirer choices are updated according to the database. */
function addEmployee() {
    return new Promise(function(resolve, reject) {
        // first get the choice arrays for departments, roles, and managers.
        getEmployeeInfo().then((choiceArrays) => {
            // edit the inquirer questions to include the choice arrays
            addEmpQuestions[2].choices = [];
            addEmpQuestions[4].choices = [];
            for (let elem of choiceArrays.roles) {
                addEmpQuestions[2].choices.push(elem.title);
            }
            for (let elem of choiceArrays.managers) {
                addEmpQuestions[4].choices.push(elem.wholeName);
            }

            // get inquirer answers, and create a new Employee object based on the answers.
            inquirer.prompt(addEmpQuestions).then(answer => {
                // if the user didn't pick a manager, set to null.
                answer.managerName === undefined ? answer.managerName = null : null;

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
                // Finally, the employee table must be updated.
                connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
                    [answer.firstName, answer.lastName, roleID, managerID],
                    (err, data) => {
                        if (err) throw err;
                        console.log(`Adding ${answer["firstName"]} ${answer["lastName"]} to database.`)
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

/** Gets an array of all role titles and managers, along with ids.
 * These separate arrays are stored in a single object.
 * This object is used for the inquirer questions in addEmployee(). */
function getEmployeeInfo() {
    return new Promise((resolve, reject) => {
        let titlePromise = createChoiceArray("role", "title");
        let managerPromise = getEmployeeNamesArray();
        let roleArr;
        let managerArr;

        // get promised title, manager, and id data, then store in a single object.
        let choiceObj = {};
        titlePromise.then((arr) => {
            roleArr = arr;
            choiceObj.roles = roleArr;
            managerPromise.then(arr => {
                managerArr = arr;
                choiceObj.managers = managerArr;
            }).then(() => {
                resolve(choiceObj);
            });
        });
    });
}


/** Returns a promise to get all employee first, last, whole names, as well as ids
 * Each employee is stored as an object in an array, with the properties accessible by 
 * array[i]["first_name"], ["last_name"], ["wholeName"], ["id"] */
function getEmployeeNamesArray() {
    return new Promise((resolve, reject) => {
        // first get employee info from the database
        createChoiceArray("employee", "first_name", "last_name").then(empArray => {

            // Concatenate the first and last names of each employee, and add to the employee objects returned from the database
            empArray.forEach(elem => {
                elem["wholeName"] = elem["first_name"] + " " + elem["last_name"];
            });
            resolve(empArray);
        });
    })
}

/** Remove an employee from the database. */
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
                            console.log(`${answer.name} removed from employee database.`)
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

/** Prompts user for input on updating the role of an employee */
function updateEmpRole() {
    return new Promise(function(resolve, reject) {
        // First get all employee names, for use in the inquirer questions
        getEmployeeNamesArray().then(empArray => {
            updateQuestions[0].choices = ["Cancel"];
            empArray.forEach(elem => {
                updateQuestions[0].choices.push(elem["wholeName"]);
            })
            // next get roles for use in inquirer questions
            createChoiceArray("role", "title").then(choiceArr => {
                updateQuestions[1].choices = [];
                for (let elem of choiceArr) {
                    updateQuestions[1].choices.push(elem["title"])
                }
                return choiceArr;
            }).then(choiceArr => {
                // finally ask questions
                inquirer.prompt(updateQuestions).then(answer => {
                    // find the ids of the employee and the role, based on the answers
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
                    // update the database, using the ids
                    connection.query("UPDATE employee SET role_id = ? WHERE id = ?",
                        [roleID, empID],
                        (err, data) => {
                            if (err) throw err;
                            console.log(`Role for ${answer.name} updated to ${answer.role}.`);
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

/** Updates employee managers by querying employee table. */
function updateEmpManager() {
    return new Promise(function(resolve, reject) {
        let empPromise = getEmployeeNamesArray();
        // first get the employee names, in order to update the inquirer questions.
        // Reset the inquirer choices array before updating it.
        updateEmpManagerQuestions1[0].choices = [];
        empPromise.then(arr => {
            for (let elem of arr) {
                updateEmpManagerQuestions1[0].choices.push(elem["wholeName"]);
            }
            return arr;
        }).then((arr) => {
            inquirer.prompt(updateEmpManagerQuestions1, answer => {
                return answer;
            }).then(answer => {
                // populate the choice array for the second question ("who is the manager?")
                updateEmpManagerQuestions2[0].choices = []; 
                for (let elem of arr) {
                    // an employee cannot be their own manager:
                    elem["wholeName"] !== answer.name ? updateEmpManagerQuestions2[0].choices.push(elem["wholeName"]) : null;
                }
                inquirer.prompt(updateEmpManagerQuestions2, answer2 => {
                    return (answer2)
                }).then(answer2 => {
                    let managerID;
                    let empID;
                    // find the ids for the names the user picked
                    for (let elem of arr) {
                        elem["wholeName"] === answer.name ? empID = elem["id"] : null;
                        elem["wholeName"] === answer2.manager ? managerID = elem["id"] : null;
                    }
                    // finally, use the ids to update the database
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

/** query to retrieve all roles */
function getAllRoles() {
    return new Promise((resolve, reject) => {
        connection.query("SELECT title, salary, department.dept_name FROM role"
            + " JOIN department ON role.department_id = department.id;", (err, data) => {
            if (err) throw err;
            resolve(data);
        })
    }).catch((err) => {
        connection.end();
        reject(err);
    })
}

/** query to retrieve all departments */
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

/** Takes an array of objects and returns them as a formatted table string, with the object keys as the headers
 * and the object values as the rows. All objects in the array must have the same keys.
 * This function uses python to format the table if it is installed. 
 * If python is not installed or cannot be found, JavaScript is used instead.
 * @param {Array} columns: an array of objects. All objects must have the same keys! */
function formatDataTable(columns) {
    return new Promise((resolve, reject) => {
        let args = ["./nodePythonApp/formatter.py"]     // array of argument vectors for python
        // add column names to argument vectors
        for (let columnName in columns[0]) {
            args.push(columnName)
        }
        // Add in the second argument vector as the number of columns to be formatted.
        let numColumns = args.length - 1;
        args.splice(1, 0, numColumns)
        // Now, args is the python filename, the number of columns, plus a list of the column names
        // Finally, add info for each object in the column to args list. These will become the table rows.
        for (let obj of columns) {
            for (let key in obj) {
                args.push(obj[key])
            }
        }

        // If python is installed, use python to format the table. If not, use JavaScript.
        if (pythonInstalled) {
            // Different terminal commands to try and open python. These may vary from computer to computer.
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
            columnCounter = 0;
            // args[1] is the number of columns. starting at args[2] is the data to go in each column
            let rowStr = "";
            let columnLength = 25;      // the max width of a column in the table
            for (let i = 2, j = args.length; i < j; i++) {
                let truncatedArg = args[i].toString().slice(0, columnLength);
                rowStr += truncatedArg;
                let remainingLength = columnLength - truncatedArg.length;
                for (let i = 0; i < remainingLength; i++) {
                    rowStr += " ";
                }
                rowStr += " ";
                columnCounter++;
                if (columnCounter % Number(args[1]) === 0) {
                    rowStr += "\n"
                }
                if (columnCounter === Number(args[1])) {
                    let headerStr = ""
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
        // run python using the command "<python> <argument vectors>"
        let py = spawn(pythonFile, args).on('error', (err) => {
            reject("Improper python path.");
        })
        let found = false;  // bool that gets set to true once proper python installation is found.
        // on data event emitted by python program, resolve promise.
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

/** Queries database for department to add a role to. Then gets user input for info on the new role. */
function addToAllRoles() {
    return new Promise((resolve, reject) => {
        // Present an array of department choices that the role could belong to.
        createChoiceArray("department", "dept_name").then(data => {
            addRoleQuestions[2].choices = [];
            for (let elem of data) {
                addRoleQuestions[2].choices.push(elem["dept_name"]);
            }
            return data;
        }).then((data) => {
            // get user input on the role
            inquirer.prompt(addRoleQuestions, answers => {
                return answers;
            }).then(answers => {
                // get id of department for use in query
                let deptID;
                for (let elem of data) {
                    if (elem["dept_name"] === answers["dept_name"]) {
                        deptID = elem["id"];
                        break;
                    }
                }
                // change roles based on id
                connection.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", [answers.title, answers.salary, deptID], (err, data) => {
                    if (err) throw err;
                    resolve();
                })
            })
        })
    }).catch((err) => {
        connection.end();
        reject(err);
    })
}

/** Queries database for all roles, then presents user with choice of roles to remove. */
function removeFromAllRoles() {
    return new Promise(function(resolve, reject) {
        createChoiceArray("role", "title").then(roleArr => {
            // add the employee names to the inquirer choices, after resetting choices array
            removeRoleQuestion[0].choices = ["Cancel"];
            roleArr.forEach(elem => {
                removeRoleQuestion[0].choices.push(elem["title"]);
            })
            inquirer.prompt(removeRoleQuestion).then(answer => {
                answer.title === "Cancel" ? resolve() : null;
                // find the role within the role array. Then delete that name from the database.
                for (let elem of roleArr) {
                    if (answer.title === elem["title"]) {
                        connection.query("DELETE FROM role WHERE ?;",
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

/** Asks question about department name, then inserts into database. */
function addDepartment() {
    return new Promise((resolve, reject) => {
        inquirer.prompt(addDeptQuestions, (answer) => {
            return answer;
        }).then(answer => {
            connection.query("INSERT INTO department (dept_name) VALUES (?)", answer.dept_name, (err, data) => {
                if (err) throw err;
                resolve(data);
            })
        })
    }).catch((err) => {
        connection.end();
        reject(err);
    })
}

/** Queries database for all departments, then presents user with choice of departments to remove. */
function removeDepartment() {
    return new Promise(function(resolve, reject) {
        createChoiceArray("department", "dept_name").then(deptArr => {
            // add the dept names to the inquirer choices, after resetting choices array
            removeDeptQuestion[0].choices = ["Cancel"];
            deptArr.forEach(elem => {
                removeDeptQuestion[0].choices.push(elem["dept_name"]);
            })
            inquirer.prompt(removeDeptQuestion).then(answer => {
                answer.dept_name === "Cancel" ? resolve() : null;
                // find the department within the dept array. Then delete that dept from the database.
                for (let elem of deptArr) {
                    if (answer.dept_name === elem["dept_name"]) {
                        connection.query("DELETE FROM department WHERE ?;",
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