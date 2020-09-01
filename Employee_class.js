const Role = require("./Role_Class.js");

class Employee extends Role {
    constructor(firstName, lastName, department, manager=null) {
        super(title, salary);
        this.firstName = firstName;
        this.lastName = lastName;
        this.department = department,
        this.manager = manager;
    }

    getFirstName = () => this.firstName;
    getLastName = () => this.lastName;
    getDepartment = () => this.department;
    getManager = () => this.manager;
}

module.exports = Employee;