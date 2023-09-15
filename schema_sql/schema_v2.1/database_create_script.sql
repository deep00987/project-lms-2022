create database dev_s6_test;
use dev_s6_test;

CREATE TABLE `student` (
	`student_id` INT NOT NULL AUTO_INCREMENT,
	`fname` varchar(255) NOT NULL,
	`lname` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL UNIQUE,
	`password` varchar(4000) NOT NULL,
	`dept_id` INT NOT NULL,
	`term_id` INT NOT NULL,
    `auth_secret` VARCHAR(255),
	PRIMARY KEY (`student_id`)
    
);

CREATE TABLE `department` (
	`dept_id` INT NOT NULL AUTO_INCREMENT,
	`dept_name` varchar(255) NOT NULL UNIQUE,
	PRIMARY KEY (`dept_id`)
);

CREATE TABLE `term` (
	`term_id` INT NOT NULL AUTO_INCREMENT,
	`term_name` varchar(255) NOT NULL UNIQUE,
	PRIMARY KEY (`term_id`)
);

CREATE TABLE `course` (
	`course_id` INT NOT NULL AUTO_INCREMENT,
	`course_name` varchar(255) NOT NULL UNIQUE,
	PRIMARY KEY (`course_id`)
);

CREATE TABLE `term_course` (
	`term_id` INT NOT NULL,
	`course_id` INT NOT NULL
);

CREATE TABLE `student_course` (
	`student_id` INT NOT NULL,
	`course_id` INT NOT NULL
);

CREATE TABLE `teacher` (
	`teacher_id` INT NOT NULL AUTO_INCREMENT,
	`fname` varchar(255) NOT NULL,
	`lname` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL UNIQUE,
	`password` varchar(4000) NOT NULL,
	`dept_id` INT NOT NULL,
    `auth_secret` VARCHAR(255),
	PRIMARY KEY (`teacher_id`)
);

CREATE TABLE `teacher_course` (
	`teacher_id` INT NOT NULL,
	`course_id` INT NOT NULL
);

CREATE TABLE `dept_course` (
	`dept_id` INT NOT NULL,
	`course_id` INT NOT NULL
);


ALTER TABLE `student` ADD CONSTRAINT `student_fk0` FOREIGN KEY (`dept_id`) REFERENCES `department`(`dept_id`);

ALTER TABLE `student` ADD CONSTRAINT `student_fk1` FOREIGN KEY (`term_id`) REFERENCES `term`(`term_id`);

ALTER TABLE `term_course` ADD CONSTRAINT `term_course_fk0` FOREIGN KEY (`term_id`) REFERENCES `term`(`term_id`);

ALTER TABLE `term_course` ADD CONSTRAINT `term_course_fk1` FOREIGN KEY (`course_id`) REFERENCES `course`(`course_id`);

ALTER TABLE `student_course` ADD CONSTRAINT `student_course_fk0` FOREIGN KEY (`student_id`) REFERENCES `student`(`student_id`) ON DELETE CASCADE;

ALTER TABLE `student_course` ADD CONSTRAINT `student_course_fk1` FOREIGN KEY (`course_id`) REFERENCES `course`(`course_id`) ON DELETE CASCADE;

ALTER TABLE `teacher` ADD CONSTRAINT `teacher_fk0` FOREIGN KEY (`dept_id`) REFERENCES `department`(`dept_id`);

ALTER TABLE `teacher_course` ADD CONSTRAINT `teacher_course_fk0` FOREIGN KEY (`teacher_id`) REFERENCES `teacher`(`teacher_id`) ON DELETE CASCADE;

ALTER TABLE `teacher_course` ADD CONSTRAINT `teacher_course_fk1` FOREIGN KEY (`course_id`) REFERENCES `course`(`course_id`) ON DELETE CASCADE;

ALTER TABLE `dept_course` ADD CONSTRAINT `dept_course_fk0` FOREIGN KEY (`dept_id`) REFERENCES `department`(`dept_id`);

ALTER TABLE `dept_course` ADD CONSTRAINT `dept_course_fk1` FOREIGN KEY (`course_id`) REFERENCES `course`(`course_id`);

ALTER TABLE course
ADD course_code varchar(255);

INSERT INTO department (dept_name) 
VALUES
	("CS"),
    ("MATH");


INSERT INTO term (term_name) 
VALUES
	("TERM_1"),
    ("TERM_2"),
    ("TERM_3");
    

INSERT INTO course (course_code , course_name)
VALUES 
("CSCORE01" , "Programming in C/C++"),
("CSCORE02" ,"Computer System Architecture"),
("CSCORE03", "Discreate Structure"),
("CSCORE04" , "Object Oriented Programming"),
("CSCORE05" , "Data Structures and Algorithms"),
("CSCORE06" , "Networking And DBMS"),
("MTCORE01" , "Differential Equations"),
("MTCORE02" , "Linear Algebra"),
("MTCORE03" , "Calculus 2"),
("MTCORE04" , "Vector Calculus"),
("MTCORE05" , "Discreate Math and Graph Theory" ),
("MTCORE06" , "Calculus 3");

INSERT INTO dept_course (dept_id,course_id) 
VALUES
	(1,1),
    (1,2),
    (1,3),
    (1,4),
    (1,5),
    (1,6),
    (2,7),
    (2,8),
    (2,9),
    (2,10),
    (2,11),
    (2,12);

ALTER TABLE term_course
ADD dept_id INT NOT NULL;
ALTER TABLE `term_course` ADD CONSTRAINT `term_course_fk2` FOREIGN KEY (`dept_id`) REFERENCES `department`(`dept_id`);

INSERT INTO term_course (term_id, dept_id, course_id) 
VALUES
(1,1,1),
(1,1,2),
(1,1,7),
(2,1,3),
(2,1,4),
(2,1,9),
(3,1,5),
(3,1,6),
(1,2,7),
(1,2,8),
(1,2,1),
(2,2,9),
(2,2,10),
(2,2,4),
(3,2,11),
(3,2,12),
(3,2,5);


CREATE TABLE `class_room` (
	`class_room_id` INT NOT NULL AUTO_INCREMENT,
	`teacher_id` INT NOT NULL,
	`course_id` INT NOT NULL,
	`class_name` varchar(255) NOT NULL,
	`varchar` varchar(255) NOT NULL UNIQUE,
	PRIMARY KEY (`class_room_id`)
);

CREATE TABLE `student_class` (
	`class_room_id` INT NOT NULL,
	`student_id` INT NOT NULL
);

CREATE TABLE `class_post` (
	`class_post_id` INT NOT NULL AUTO_INCREMENT,
	`class_room_id` INT NOT NULL,
	`teacher_id` INT,
	`student_id` INT,
	`content` varchar(255) NOT NULL,
    `attachment` varchar(255) NULL,
	PRIMARY KEY (`class_post_id`)
);

ALTER TABLE `class_room` ADD CONSTRAINT `class_room_fk0` FOREIGN KEY (`teacher_id`) REFERENCES `teacher`(`teacher_id`) ON DELETE CASCADE;

ALTER TABLE `class_room` ADD CONSTRAINT `class_room_fk1` FOREIGN KEY (`course_id`) REFERENCES `course`(`course_id`) ON DELETE CASCADE;

ALTER TABLE `student_class` ADD CONSTRAINT `student_class_fk0` FOREIGN KEY (`class_room_id`) REFERENCES `class_room`(`class_room_id`) ON DELETE CASCADE;

ALTER TABLE `student_class` ADD CONSTRAINT `student_class_fk1` FOREIGN KEY (`student_id`) REFERENCES `student`(`student_id`) ON DELETE CASCADE;

ALTER TABLE `class_post` ADD CONSTRAINT `class_post_fk0` FOREIGN KEY (`class_room_id`) REFERENCES `class_room`(`class_room_id`);

ALTER TABLE `class_post` ADD CONSTRAINT `class_post_fk1` FOREIGN KEY (`teacher_id`) REFERENCES `teacher`(`teacher_id`);

ALTER TABLE `class_post` ADD CONSTRAINT `class_post_fk2` FOREIGN KEY (`student_id`) REFERENCES `student`(`student_id`);

ALTER TABLE `class_post` ADD CONSTRAINT `class_post_fk3` FOREIGN KEY (`class_room_id`) REFERENCES `class_room`(`class_room_id`) ON DELETE CASCADE;

ALTER TABLE class_room 
ADD created_at timestamp NOT NULL  DEFAULT CURRENT_TIMESTAMP;

alter TABLE class_post ADD created_at timestamp NOT NULL  DEFAULT CURRENT_TIMESTAMP;

alter table class_room drop `varchar`;
alter table class_room add course_code varchar(255) not null;

CREATE TABLE `class_comments` (
	`comment_id` INT NOT NULL AUTO_INCREMENT,
	`class_room_id` INT NOT NULL,
	`class_post_id` INT NOT NULL,
	`student_id` INT,
	`teacher_id` INT,
	`content` varchar(255) NOT NULL,
	`created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp,
	PRIMARY KEY (`comment_id`)
);

ALTER TABLE `class_comments` ADD CONSTRAINT `class_comments_fk0` FOREIGN KEY (`class_room_id`) REFERENCES `class_room`(`class_room_id`) ON DELETE CASCADE;

ALTER TABLE `class_comments` ADD CONSTRAINT `class_comments_fk1` FOREIGN KEY (`class_post_id`) REFERENCES `class_post`(`class_post_id`) ON DELETE CASCADE;

ALTER TABLE `class_comments` ADD CONSTRAINT `class_comments_fk2` FOREIGN KEY (`student_id`) REFERENCES `student`(`student_id`) ON DELETE CASCADE;

ALTER TABLE `class_comments` ADD CONSTRAINT `class_comments_fk3` FOREIGN KEY (`teacher_id`) REFERENCES `teacher`(`teacher_id`) ON DELETE CASCADE;

CREATE TABLE `student_dp` (
`dp_id` INT NOT NULL AUTO_INCREMENT,
`student_id` INT NOT NULL,
`dp_path` varchar(255) NOT NULL,
`uploaded_at` TIMESTAMP NOT NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (`dp_id`)
);
ALTER TABLE `student_dp` ADD CONSTRAINT `student_dp_fk0` FOREIGN KEY 
(`student_id`) REFERENCES `student`(`student_id`) ON DELETE CASCADE;

CREATE TABLE `teacher_dp` (
`dp_id` int NOT NULL AUTO_INCREMENT,
`teacher_id` int NOT NULL,
`dp_path` varchar(255) NOT NULL,
`uploaded_at` TIMESTAMP NOT NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (`dp_id`)
);
ALTER TABLE `teacher_dp` ADD CONSTRAINT `teacher_dp_fk0` FOREIGN KEY 
(`teacher_id`) REFERENCES `teacher`(`teacher_id`) ON DELETE CASCADE;

CREATE TABLE `notifications` (
	`notification_id` INT NOT NULL AUTO_INCREMENT,
	`class_room_id` INT NOT NULL,
	`class_post_id` INT NOT NULL,
	`teacher_id` INT NOT NULL,
	`content` varchar(255) NOT NULL,
	`created_at` TIMESTAMP NOT NULL DEFAULT current_timestamp ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`notification_id`)
);

ALTER TABLE `notifications` ADD CONSTRAINT `notifications_fk0` FOREIGN KEY (`class_room_id`) REFERENCES `class_room`(`class_room_id`) ON DELETE CASCADE;

ALTER TABLE `notifications` ADD CONSTRAINT `notifications_fk1` FOREIGN KEY (`class_post_id`) REFERENCES `class_post`(`class_post_id`) ON DELETE CASCADE;

ALTER TABLE `notifications` ADD CONSTRAINT `notifications_fk2` FOREIGN KEY (`teacher_id`) REFERENCES `teacher`(`teacher_id`) ON DELETE CASCADE;



