/** a class that contains functions for getting a particular list from the SQL database. */
class SQLSelect {
    /** @param {string} choice
     *  @param {string} table */
    constructor(choice, table) {
        // for this program, choice can be 'manager', 'department', 'employee', 'role'
        this.choice = choice;
        this.table = table;
    }

    createSelectQuery () {
        let query = `SELECT ${this.choice} FROM ${this.table};`
        return query;
    };

    createChoiceArray () {
        connection.query("SELECT first_name, last_name, department.dept_name FROM employee")
    }
}

module.exports = SQLSelect;