const initQuestions = [
  {
    type: "list",
    message: "What would you like to do?",
    name: "manageChoice",
    choices: ["View all employees by department", "View all employees by manager", "Add employee",
      "Remove employee", "Update employee role", "Update employee manager", "View all roles",
      "Add role", "Remove role", "View all departments", "Add department", "Remove department", "Quit"]
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
    type: "list",
    message: "What is the role of the employee?",
    name: "role",
    choices: []
  },
  {
    type: "confirm",
    message: "Does the employee have a manager?",
    name: "managerConfirm"
  },
  {
    type: "list",
    message: "What is the name of the manager?",
    name: "managerName",
    choices: [],
    when: (answers) => answers.managerConfirm
  }
]

let removeEmpQuestions = [
  {
    type: "list",
    message: "Which employee should be removed?",
    name: "name",
    choices: ["Cancel"]
  }
]


let updateQuestions = [
  {
    type: "list",
    message: "Which employee should be updated?",
    name: "name",
    choices: ["Cancel"]
  },
  {
    type: "list",
    message: "What role should the employee be assigned?",
    name: "role",
    choices: []
  }
]

let updateEmpManagerQuestions1 = [
  {
    type: "list",
    message: "Which employee should be updated?",
    name: "name",
    choices: []
  }
]
updateEmpManagerQuestions2 = [
  {
    type: "list",
    message: "Who should the new manager be?",
    name: "manager",
    choices: []
  }
]

addRoleQuestions = [
  {
    type: "input",
    message: "What is the title of the new role?",
    name: "title"
  },
  {
    type: "input",
    message: "What is the salary of the new role?",
    name: "salary"
  },
  {
    type: "list",
    message: "What department does this role belong to?",
    name: "dept_name",
    choices: []
  }
]

addDeptQuestions = [
  {
    type: "input",
    message: "What is the name of the new department?",
    name: "dept_name"
  }
]

pythonQuestion = [
  {
    type: "confirm",
    message: "Do you have python installed and would you like to use python for the table formatting?",
    name: "python"
  }
]
module.exports = {
  initQuestions,
  addEmpQuestions,
  removeEmpQuestions,
  updateQuestions,
  updateEmpManagerQuestions1,
  updateEmpManagerQuestions2,
  addRoleQuestions,
  addDeptQuestions,
  pythonQuestion
}