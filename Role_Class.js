class Role {
    constructor(title, salary) {
        this.title = title;
        this.salary = salary;
    }

    // getters and setters
    getTitle = () => this.title;
    setTitle = (role) => this.title = title;
    getSalary = () => this.salary;
    setSalary = () => this.salary;
}

module.exports = Role