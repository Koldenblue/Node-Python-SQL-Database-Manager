INSERT INTO department (dept_name) 
VALUES ("water"), ("bouncehouses"), ("blankets");

INSERT INTO role (title, salary, department_id) 
VALUES ("Chief Ice Thrower", 50000.50, 1), ("Fire Starter", 40000.25, 2), ("Suntanner", 10500, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES ("Lazarus", "Hearst", 1, 2), ("Kev", "M", 2, 3), ("Tris", "M", 3, 1);
