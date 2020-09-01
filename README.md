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
This project creates a basic terminal interface for managing a database of employees. MySQL is used to manage the database. The main controller functions are all written in JavaScript. An option to use Python 3 is included for table formatting, but a Python 3 installation is not necessary. The goal of this project is to demonstrate how a database Content Management System can be programmed to manage a large SQL database. Although some programming knowledge may be required to get Node.js, Python, SQL, etc running, it is important that this database management interface can be used by a non-programmer. To that end, Inquirer package from Node Package Manager provides a simple interface for database questions. Employees, managers, employee roles, and departments can all be updated, added, or removed from the SQL database. Output to a terminal is formatted using Python or JavaScript, depending on user preference.  


This program is just a sample database program for conceptual demonstration. Protection against SQL injection attacks, the most widespread website vulnerability, is provided through simple parameratized SQL statements. Although the program is unfortunately rather long, some program functionalities are split into modules. This encapsulation of program functionalities could be further improved, given more time spent coding. Promise-based programming is also heavily utilized, with the majority of written functions returning promises. Promises and asynchronous programming techniques are especially important for database management, given that large databases can take rather long to perform read and write actions on. This program also demonstrates a simple connection between a Python script and Node.js. And finally, this program demonstrates the four basic actions necessary for managing a database - Create, Read, Update, and Delete (CRUD). In mySQL terms, these actions roughly correspond to CREATE, SELECT, UPDATE, and DELETE.  


This program was written fairly quickly (in under a week), and could certainly benefit from refactoring. For example, using async functions with the await keyword could provide easier-to-read functions. Given more time, there are several other ways that this program could be improved. Currently, SQL queries are managed by individual functions. This could be done better through an Object Relational Mapper (ORM). Not only would this make the program less cluttered and easier to debug, but it would also allow for more varied SQL statements. A custom ORM could be written, or a currently existing library, such as Sequelize, could be used. Another way of improving the program would be adding functionality to the database - for example, employees could have individual salaries, or roles could be created that don't belong to any department. An even more ambitious improvement would be to add a front-end interface for use in a web browser. Overall, this program is more of a conceptual demonstration, and would need further work and customization for actual use. Lastly, the biggest way that this program could be improved is probably through splitting of functionality into smaller pieces - creating modules, perhaps utilizing an ORM, making functions for more specific use, and other techniques that were discussed earlier.

<h3 id='installation'>Installation</h3>
Make sure Node.js is installed. Inquirer must also be installed from node package manager, using 'npm install inquirer' in the terminal. The SQL database must also be created, if it does not exist. The database can be created by running the commands in the database.sql file with mySQL. Python is optional. If the user wishes to use python, it must be installed and added to the PATH environment variable. In Windows, the python executables are usually located at C:\Users\<username>\AppData\Local\Programs\Python\Python38, as well as the ...\Python38\scripts folder.

<h3 id='usage'>Usage</h3>
Make sure all installation instructions have been followed. The program can be run with the command 'node index.js'. From there, simply follow the on-screen prompts in the terminal. The program will always start out by asking whether python is installed. This could possibly be changed to be stored as a value in the SQL database. In this way the program would have an option to change Python use, rather than asking the user about Python on every startup.

<h3 id='contributions'>Contributions</h3>
Contact the author on GitHub or through email.

<h3 id='license'>License</h3>
This project is licensed under the MIT License.

<h3 id='test'>Tests</h3>
The database can be seeded with test values by executing the SQL statements from the database_seeds.SQL file.

<h3 id='questions'>Issues and Questions</h3>
Issues and questions can be emailed to 'kmillergit' at the domain 'outlook.com'. The author's GitHub profile may be found at https://github.com/Koldenblue.<p><sub><sup>This readme was generated with the help of the readme generator program at https://github.com/Koldenblue/readme-generator.</sup></sub></p>