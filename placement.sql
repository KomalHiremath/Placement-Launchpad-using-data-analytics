CREATE DATABASE IF NOT EXISTS University;

USE University;

-- Department table
CREATE TABLE IF NOT EXISTS Department (
    dept_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(50),
    dept_location VARCHAR(50),
    dept_HOD VARCHAR(50),
    dept_placement_officer VARCHAR(50)
);

-- Education table
CREATE TABLE IF NOT EXISTS Education (
    usn CHAR(50) PRIMARY KEY,
    cgpa VARCHAR(50),
    tenth_passing_year VARCHAR(50),
    tenth_percentage FLOAT,
    twelfth_passing_year VARCHAR(50),
    twelfth_percentage FLOAT,
    skills VARCHAR(50),
    technologies VARCHAR(45),
    Cet_comedk_rank INT
);



-- Company table
CREATE TABLE IF NOT EXISTS Company (
    c_id INT AUTO_INCREMENT PRIMARY KEY,
    c_name VARCHAR(50),
    address VARCHAR(50),
    contact VARCHAR(50),
    email VARCHAR(50),
    city VARCHAR(50),
    state VARCHAR(50),
    package FLOAT,
    expected_skills VARCHAR(50),
    expected_technology_awarness VARCHAR(45)
);

-- Admin table
CREATE TABLE IF NOT EXISTS Admin (
    f_name VARCHAR(50),
    l_name VARCHAR(50),
    email VARCHAR(50),
    password VARCHAR(50),
    contact CHAR(50),
    designation VARCHAR(50),
    Login_name VARCHAR(50),
    PRIMARY KEY (email)
);

-- Previous_year_Students table
CREATE TABLE IF NOT EXISTS Previous_year_Students (
    usn CHAR(50) PRIMARY KEY,
    f_name VARCHAR(50),
    l_name VARCHAR(50),
    Previous_year_Studentscol VARCHAR(45),
    address VARCHAR(35),
    email VARCHAR(50),
    contact CHAR(50),
    c_id INT,
    DOB VARCHAR(50),
    year_of_passing VARCHAR(50),
    city VARCHAR(50),
    state VARCHAR(50),
    work_city VARCHAR(50),
    salary FLOAT,
    designation VARCHAR(20),
    dept_id INT,
    gender VARCHAR(50),
    category VARCHAR(50),
    FOREIGN KEY (c_id) REFERENCES Company(c_id)
);

-- Current Student table
CREATE TABLE IF NOT EXISTS Current_Student (
    usn CHAR(50) PRIMARY KEY,
    name VARCHAR(50),
    address VARCHAR(35),
    email VARCHAR(50),
    DOB VARCHAR(50),
    city VARCHAR(50),
    state VARCHAR(50),
    dept_id INT,
    gender VARCHAR(50),
    contact CHAR(50),
    category VARCHAR(50)
);


-- Interviewer table
CREATE TABLE IF NOT EXISTS Interviewer (
    emp_id INT AUTO_INCREMENT PRIMARY KEY,
    Interviewer_name VARCHAR(50),
    Designation VARCHAR(50),
    Contact CHAR(50),
    Email VARCHAR(50),
    c_id INT,
    FOREIGN KEY (c_id) REFERENCES Company(c_id)
);

-- Interview table
CREATE TABLE IF NOT EXISTS Interview (
    interview_id INT AUTO_INCREMENT PRIMARY KEY,
    c_id INT,
    interview_date DATE,
    inter_time TIME,
    expected_skills VARCHAR(50),
    cgpa VARCHAR(50),
    expected_technology_awarness VARCHAR(45),
    location VARCHAR(100),
    FOREIGN KEY (c_id) REFERENCES Company(c_id)
);


CREATE TABLE IF NOT EXISTS applyInterview (
    usn CHAR(50),
    interview_id INT,
    c_id INT,
    expected_skills VARCHAR(50),
    cgpa VARCHAR(50),
    expected_technology_awarness VARCHAR(45),
    email VARCHAR(100), 
    PRIMARY KEY (usn, interview_id),
    FOREIGN KEY (usn) REFERENCES Current_Student(usn),
    FOREIGN KEY (interview_id) REFERENCES Interview(interview_id),
    FOREIGN KEY (c_id) REFERENCES Company(c_id)
);

CREATE TABLE IF NOT EXISTS Employment (
    usn CHAR(50),
    name VARCHAR(100),
    gender VARCHAR(10),
    num_of_offers INT,
    employer_name VARCHAR(100),
    designation VARCHAR(100),
    campus_type VARCHAR(50),
    company_type VARCHAR(50),
    ctc DECIMAL(10, 2),
    employer_email VARCHAR(100),
    PRIMARY KEY (usn)
);

CREATE TABLE IF NOT EXISTS student (
    usn CHAR(50),
    student_name VARCHAR(100),
    company_type VARCHAR(50),
    PRIMARY KEY (usn)
);
-- Indexes
CREATE INDEX idx_department_id ON Department(dept_id);
CREATE INDEX idx_education_usn ON Education(usn);
CREATE INDEX idx_previous_students_usn ON Previous_year_Students(usn);
CREATE INDEX idx_current_students_usn ON Current_Student(usn);
CREATE INDEX idx_interview_c_id ON Interview(c_id);
CREATE INDEX idx_company_c_id ON Company(c_id);
CREATE INDEX idx_admin_email ON Admin(email);
