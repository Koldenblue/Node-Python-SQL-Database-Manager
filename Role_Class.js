class Role {
    constructor(title, salary) {
        this.title = title;
        this.salary = salary;
    }

    // getters and setters
    getRole = () => this.title;
    setRole = (role) => this.title = title;
}

module.exports = Role