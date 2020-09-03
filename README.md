# Node-Python-SQL-Database Manager

![image](https://img.shields.io/badge/license-MIT%20License-green)

## Table of Contents

1. <a href="#description">Description</a>
2. <a href="#installation">Installation</a>
3. <a href="#usage">Usage</a>
4. <a href="#contributions">Contributions</a>
5. <a href="#license">License</a>
6. <a href="#test">Tests</a>
7. <a href="#questions">Issues and Questions</a>
<hr><h3 id='description'>Description</h3>
<p>This project creates a basic terminal interface for managing a database of employees. A quick 5-minute demonstration can be found at https://youtu.be/ZgNN19BSUyg. MySQL is used to manage the database. The main controller functions are all written in JavaScript. An option to use Python 3 is included for table formatting, but a Python 3 installation is not necessary. The goal of this project is to demonstrate how a database Content Management System can be programmed to manage a large SQL database. Although some programming knowledge may be required to get Node.js, Python, SQL, etc running, this database management interface can be used by a non-programmer. To that end, the Inquirer package from Node Package Manager provides a simple interface for database questions. Employees, managers, employee roles, and departments can all be updated, added, or removed from the SQL database. Output to a terminal is formatted using Python or JavaScript, depending on user preference.</p>


<p>This program is a sample database management program for conceptual demonstration. Protection against SQL injection attacks, the most widespread website vulnerability, is provided through simple parameratized SQL statements. Consideration is also given to splitting program functionality into functions and modules. Even so, encapsulation of functionalities could be further improved, given more time spent coding. Promise-based programming is also heavily utilized, with the majority of written functions returning promises. Promises and asynchronous programming techniques are especially important for database management, given that large databases can take rather long to perform read and write actions on. And finally, this program demonstrates the four basic actions necessary for managing a database - Create, Read, Update, and Delete (CRUD). In mySQL terms, these actions roughly correspond to CREATE, SELECT, UPDATE, and DELETE.</p>

<p>This program also demonstrates a simple connection between a Python script and Node.js. Node.js spawns a Python child process, and then listens for data streams emitted by the Python script. Although the program is completely functional without the Python script, the connection between Node.js and Python is another good proof-of-concept of what may be accomplished, given time. In this case, Python can be easier to work with in a terminal, given its formatting options and synchronous nature.</p>

<p>This program was written fairly quickly (in less than a week), and could certainly benefit from refactoring. For example, using async functions with the await keyword could provide easier-to-read functions. Given more time, there are several other ways that this program could be improved. Currently, SQL queries are managed by individual functions. This could be done better through an Object Relational Mapper (ORM). Not only would this make the program less cluttered and easier to debug, but it would also allow for more varied SQL statements. A custom ORM could be written, or a currently existing library, such as Sequelize, could be used. Another way of improving the program would be adding functionality to the database - for example, employees could have individual salaries, or roles could be created that don't belong to any department. Validation for queries could be added as well. Additionally, a bug with inquirer persists, where inquirer exits after a delete query is performed. An even more ambitious improvement would be to add a front-end interface for use in a web browser. Overall, this program is a conceptual demonstration that would need further work and customization for actual use. The program does accomplish its main goal of demonstrating database management through SQL queries.</p>

<h3 id='installation'>Installation</h3>
Make sure Node.js is installed. Inquirer must also be installed from node package manager, using 'npm install inquirer' in the terminal. The SQL database must be created, if it does not exist. The database can be created and used by running the database.sql file with mySQL workbench. Python is optional. If the user wishes to use Python, it must be installed and added to the PATH environment variable. In Windows, the Python executables are usually located at C:\Users\<username>\AppData\Local\Programs\Python\Python38, as well as the ...\Python38\scripts folder.

<h3 id='usage'>Usage</h3>
Make sure all installation instructions have been followed. The program can be run with the command 'node index.js'. From there, simply follow the on-screen prompts in the terminal. The program will always start out by asking whether Python is installed. As an aside, one possible small improvement would storing a bool in the SQL database, denoting whether the user has Python installed or not. In this way the program not have to ask the user about Python on every startup.

<h3 id='contributions'>Contributions</h3>
Contact the author on GitHub or through email.

<h3 id='license'>License</h3>
This project is licensed under the MIT License.

<h3 id='test'>Tests</h3>
The database can be seeded with test values by executing the SQL statements from the database_seeds.SQL file.

<h3 id='questions'>Issues and Questions</h3>
Issues and questions can be emailed to 'kmillergit' at the domain 'outlook.com'. The author's GitHub profile may be found at https://github.com/Koldenblue.<p><sub><sup>This readme was generated with the help of the readme generator program at https://github.com/Koldenblue/readme-generator.</sup></sub></p>