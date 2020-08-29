const initQuestions = [
  {
    type: "list",
    message: "What would you like to do?",
    name: "manageChoice",
    choices: ["View all employees by department", "View all employees by manager", "Add employee",
      "Remove employee", "Update employee role", "Update employee manager", "View all roles",
      "Add role", "Remove role"]
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
    message: "What is the title of the employee?",
    name: "title"
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