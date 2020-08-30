const mysql = require("mysql");

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
        let query = this.createSelectQuery();
        let myConnection = connection.query(query, (err, data) => {
            if (err) throw err;
            console.log(data);

        })
        return myConnection;
    }
}

module.exports = SQLSelect;

