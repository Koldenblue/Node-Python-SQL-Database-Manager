const initQuestions = [
  {
    type: "list",
    message: "What would you like to do?",
    name: "manageChoice",
    choices: ["View all employees by department", "View all employees by manager", "Add employee",
      "Remove employee", "Update employee role", "Update employee manager", "View all roles",
      "Add role", "Remove role", "Quit"]
  }
]

let addEmpQuestions = [
  {
    type: "input",
    message: "What is the first name of the employee to add?",
    name: "firstName"
  },  
  {
    type: "input",
    message: "What is the last name of the employee to add?",
    name: "lastName"
  },
  {
    type: "input",
    message: "What is the role of the employee?",
    name: "role"
  },
  {
    type: "input",
    message: "What is the department of the employee?",
    name: "department"
  },
  {
    type: "input",
    message: "What is the salary of the employee?",
    name: "salary"
  },
  {
    type: "confirm",
    message: "Does the employee have a manager?",
    name: "managerConfirm"
  },
  {
    type: "input",
    message: "What is the name of the manager?",
    name: "managerName",
    when: (answers) => answers.managerConfirm
  }
]

let getEmployeeName = [
  {
    type: "list",
    message: "Would you like to choose employee names from a list, or enter a name?",
    choices: ["Choose employees from a list of names.", "Enter the name of an employee."]
  }
]


let updateQuestions = [
  {
    type: "list",
    message: "Which "
  }
]

module.exports = {
  initQuestions,
  addEmpQuestions,
  updateQuestions
}