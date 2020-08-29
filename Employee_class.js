const Role = require("./Role_Class.js");

class Employee extends Role {
    constructor(firstName, lastName, role, department, salary, manager=null) {
        super(role);
        this.firstName = firstName;
        this.lastName = lastName;
        this.department = department,
        this.salary = salary;
        this.manager = manager;
    }

    getFirstName = () => this.firstName;
    getLastName = () => this.lastName;
    getDepartment = () => this.department;
    getSalary = () => this.salary;
    getManager = () => this.manager;
}

let me = new Employee("k", "m", "manager", "sales", 80)
console.log(me)

module.exports = Employee;