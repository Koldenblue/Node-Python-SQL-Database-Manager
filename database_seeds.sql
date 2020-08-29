INSERT INTO department (name) VALUES ("water"), ("bouncehouses"), ("blankets");
SELECT * FROM department;


INSERT INTO role (title, salary) VALUES ("Chief Ice Thrower", 50000.50), ("Fire Starter", 40000.25), ("Suntanner", 10500);
SELECT * FROM role;

INSERT INTO manager (name) VALUES ("Adjudicator");

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Lazarus", "Hearst", "1", "1");