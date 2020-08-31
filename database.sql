DROP DATABASE IF EXISTS employee_DB;

CREATE DATABASE employee_DB;

USE employee_DB;

CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT,
  dept_name VARCHAR(30) NOT NULL,
  PRIMARY KEY (id)
);

-- DROP TABLE role;
CREATE TABLE role (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL(15, 2) NOT NULL,
  department_id INT NOT NULL DEFAULT 1 REFERENCES department(id),
  PRIMARY KEY (id),
  FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT NOT NULL DEFAULT (1),
  manager_id INT,
  PRIMARY KEY (id),
  FOREIGN KEY (role_id) REFERENCES role(id)
);

INSERT INTO department (dept_name) VALUES ("water"), ("bouncehouses"), ("blankets");
SELECT * FROM department;

INSERT INTO role (title, salary, department_id) VALUES ("Chief Ice Thrower", 50000.50, 1), ("Fire Starter", 40000.25, 2), ("Suntanner", 10500, 3);
SELECT * FROM role;

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Lazarus", "Hearst", 1, 1), ("Kev", "M", 2, 2), ("Tris", "M", 3, 3);
SELECT first_name FROM employee;
