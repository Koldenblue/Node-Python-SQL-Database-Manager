let mysql = require("mysql")

let connection = mysql.createConnection({
    host: "localhost", 
    
    port: 3306,
    
    user:"root",
    
    password: "sqlpasskev",
    database: "employee_DB"
});


module.exports = connection;