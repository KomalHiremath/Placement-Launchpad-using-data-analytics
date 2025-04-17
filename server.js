const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');
const ejs = require('ejs');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'university'
});

// Connect to MySQL
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the 'views' directory
app.use(express.static(path.join(__dirname, 'views')));


// Routes
app.get('/', (req, res) => {
  res.render('homepage');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/send_email', (req, res) => {
    res.render('send_email');
  });

  app.post('/send_email', (req, res) => {
    const { toEmails, password, subject, message } = req.body;
  
    // Set up Nodemailer transporter
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'shreyushinde9909@gmail.com', // Replace with your email
        pass: password
      }
    });
  
    // Mail options
    let mailOptions = {
      from: 'shreyushinde9909@gmail.com', // Replace with your email
      to: toEmails.join(', '),
      subject: subject,
      text: message
    };
  
    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Failed to send email' });
      }
      console.log('Email sent: ' + info.response);
      res.status(200).json({ message: 'Email sent successfully' });
    });
  });
  
app.get('/datag', (req, res) => {
    res.render('datag');
  });

// Function to get students' details based on criteria
app.get('/students_eligible', (req, res) => {
    const query = `
      SELECT * FROM education
      WHERE cgpa > 6 AND tenth_percentage > 60 AND twelfth_percentage > 60
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query', err);
        res.status(500).send('An error occurred while fetching data.');
        return;
      }
      res.render('students_eligible', { students: results });
    });
  });
  
app.get('/xstudents', (req, res) => {
    const sql = 'SELECT * FROM Student';
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching departments');
            return;
        }
        res.render('xstudents_read', { xstudents: result });
    });
  });
app.get('/xstudent', (req, res) => {
    res.render('interviewer_delete');
  });

app.get('/analytics', (req, res) => {
    res.render('apply');
  });
app.get('/admin', (req, res) => {
  res.render('admin_navigation');
});
app.get('/interviewerh', (req, res) => {
  res.render('interviewer_navigation');
});
app.get('/student', (req, res) => {
  res.render('student_navigation');
});

// Serve registration form
app.get('/register', (req, res) => {
  res.render('registration_form'); // assuming a registration form view named 'registration_form.ejs'
});

// Registration route
app.post('/register', (req, res) => {
  // Extract registration data from request body
  const { f_name, l_name, email, password, contact, designation, Login_name } = req.body;

  // Insert into database
  const sql = 'INSERT INTO Admin (f_name, l_name, email, password, contact, designation, Login_name) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [f_name, l_name, email, password, contact, designation, Login_name], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error registering user');
          return;
      }
      res.render('login_form');
  });
});

app.get('/login', (req, res) => {
  res.render('login_form'); // assuming a registration form view named 'registration_form.ejs'
});

// Login route
app.post('/login', (req, res) => {
  // Extract login credentials from request body
  const { email, password } = req.body;

  // Check credentials against database
  const sql = 'SELECT * FROM Admin WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error logging in');
          return;
      }

      if (result.length === 0) {
          res.status(401).send('Invalid email or password');
          return;
      }

      const user = result[0];
      // Redirect based on designation
      switch (user.designation) {
          case 'admin':
          case 'Admin':
          case 'ADMIN':
              res.render('admin_navigation');
              break;
          case 'interviewer':
          case 'Interviewer':
          case 'INTERVIEWER':
              res.render('interviewer_navigation');
              break;
          case 'STUDENT':
          case 'Student':
          case 'student':
              res.render('student_navigation');
              break;
          default:
              res.status(401).send('Invalid designation');
      }
  });
});

// Logout route
app.get('/logout', (req, res) => {
  // Check if session exists before destroying
  if (req.session) {
      req.session.destroy(err => {
          if (err) {
              console.error('Error destroying session:', err);
              res.status(500).send('Error logging out');
              return;
          }
          // Redirect to the homepage or any other page after logout
          res.redirect('/');
      });
  } else {
      res.redirect('/');
  }

  // If you're using tokens (JWT), you would invalidate the token here
});



// #########create_department
app.get('/departments/create', (req, res) => {
  res.render('department_create'); // assuming a registration form view named 'registration_form.ejs'
});

// Department creation route
app.post('/departments/create', (req, res) => {
  const { dept_name, dept_location, dept_HOD, dept_placement_officer } = req.body;
  const sql = 'INSERT INTO Department (dept_name, dept_location, dept_HOD, dept_placement_officer) VALUES (?, ?, ?, ?)';
  db.query(sql, [dept_name, dept_location, dept_HOD, dept_placement_officer], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error creating department');
          return;
      }
      res.redirect('/departments'); // Redirect to the page displaying department details
  });
});

// Route to display department details
app.get('/departments', (req, res) => {
  const sql = 'SELECT * FROM Department';
  db.query(sql, (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error fetching departments');
          return;
      }
      res.render('department_read', { departments: result });
  });
});

// Update department route (handles both GET and POST requests)
app.all('/departments/update/:dept_id', (req, res) => {
  const dept_id = req.params.dept_id;
  const sql = 'SELECT * FROM Department WHERE dept_id = ?';
  db.query(sql, [dept_id], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error fetching department details');
          return;
      }
      if (result.length === 0) {
          res.status(404).send('Department not found');
          return;
      }
      const department = result[0];
      if (req.method === 'POST') {
          // Handling POST request
          const { dept_name, dept_location, dept_HOD, dept_placement_officer } = req.body;
          const updateSql = 'UPDATE Department SET dept_name=?, dept_location=?, dept_HOD=?, dept_placement_officer=? WHERE dept_id=?';
          db.query(updateSql, [dept_name, dept_location, dept_HOD, dept_placement_officer, dept_id], (updateErr, updateResult) => {
              if (updateErr) {
                  console.error(updateErr);
                  res.status(500).send('Error updating department');
                  return;
              }
              res.redirect('/departments'); // Redirect to the page displaying department details
          });
      } else {
          // Handling GET request
          res.render('department_update', { department }); // Pass department object to the template
      }
  });
});

// Delete department route
app.get('/departments/delete/:dept_id', (req, res) => {
  const dept_id = req.params.dept_id;
  const sql = 'DELETE FROM Department WHERE dept_id=?';
  db.query(sql, [dept_id], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error deleting department');
          return;
      }
      res.redirect('/departments'); // Redirect to the page displaying department details
  });
});



// #####
// education department education_create.ejs,education_read.ejs, education_update.ejs
// Create Education department route
app.get('/education/create', (req, res) => {
  res.render('education_create'); // Render the education creation form view
});

// Education department creation route
app.post('/education/create', (req, res) => {
  const { usn, cgpa, tenth_passing_year, tenth_percentage, twelfth_passing_year, twelfth_percentage, skills, technologies, Cet_comedk_rank } = req.body;
  const sql = 'INSERT INTO Education (usn, cgpa, tenth_passing_year, tenth_percentage, twelfth_passing_year, twelfth_percentage, skills, technologies, Cet_comedk_rank) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [usn, cgpa, tenth_passing_year, tenth_percentage, twelfth_passing_year, twelfth_percentage, skills, technologies, Cet_comedk_rank], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error creating education record');
          return;
      }
      res.redirect('/education'); // Redirect to the page displaying education details
  });
});

// Route to display education details
app.get('/education', (req, res) => {
  const sql = 'SELECT * FROM Education';
  db.query(sql, (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error fetching education records');
          return;
      }
      res.render('education_read', { educationRecords: result });
  });
});

// Update education department route (handles both GET and POST requests)
app.all('/education/update/:usn', (req, res) => {
  const usn = req.params.usn;
  const sql = 'SELECT * FROM Education WHERE usn = ?';
  db.query(sql, [usn], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error fetching education details');
          return;
      }
      if (result.length === 0) {
          res.status(404).send('Education record not found');
          return;
      }
      const educationRecord = result[0];
      if (req.method === 'POST') {
          // Handling POST request
          const { cgpa, tenth_passing_year, tenth_percentage, twelfth_passing_year, twelfth_percentage, skills, technologies, Cet_comedk_rank } = req.body;
          const updateSql = 'UPDATE Education SET cgpa=?, tenth_passing_year=?, tenth_percentage=?, twelfth_passing_year=?, twelfth_percentage=?, skills=?, technologies=?, Cet_comedk_rank=? WHERE usn=?';
          db.query(updateSql, [cgpa, tenth_passing_year, tenth_percentage, twelfth_passing_year, twelfth_percentage, skills, technologies, Cet_comedk_rank, usn], (updateErr, updateResult) => {
              if (updateErr) {
                  console.error(updateErr);
                  res.status(500).send('Error updating education record');
                  return;
              }
              res.redirect('/education'); // Redirect to the page displaying education details
          });
      } else {
          // Handling GET request
          res.render('education_update', { educationRecord }); // Pass education record object to the template
      }
  });
});

// Delete education department route
app.get('/education/delete/:usn', (req, res) => {
  const usn = req.params.usn;
  const sql = 'DELETE FROM Education WHERE usn=?';
  db.query(sql, [usn], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error deleting education record');
          return;
      }
      res.redirect('/education'); // Redirect to the page displaying education details
  });
});


// Company department Company_create.ejs,Company_read.ejs, Company_update.ejs

// Create Company department route
app.get('/company/create', (req, res) => {
  res.render('company_create'); // Render the company creation form view
});

// Company department creation route
app.post('/company/create', (req, res) => {
  const { c_name, address, contact, email, city, state, package, expected_skills, expected_technology_awarness } = req.body;
  const sql = 'INSERT INTO Company (c_name, address, contact, email, city, state, package, expected_skills, expected_technology_awarness) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [c_name, address, contact, email, city, state, package, expected_skills, expected_technology_awarness], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error creating company record');
          return;
      }
      res.redirect('/company'); // Redirect to the page displaying company details
  });
});

// Route to display company details
app.get('/company', (req, res) => {
  const sql = 'SELECT * FROM Company';
  db.query(sql, (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error fetching company records');
          return;
      }
      res.render('company_read', { companyRecords: result });
  });
});

// Update company department route (handles both GET and POST requests)
app.all('/company/update/:c_id', (req, res) => {
  const c_id = req.params.c_id;
  const sql = 'SELECT * FROM Company WHERE c_id = ?';
  db.query(sql, [c_id], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error fetching company details');
          return;
      }
      if (result.length === 0) {
          res.status(404).send('Company record not found');
          return;
      }
      const companyRecord = result[0];
      if (req.method === 'POST') {
          // Handling POST request
          const { c_name, address, contact, email, city, state, package, expected_skills, expected_technology_awarness } = req.body;
          const updateSql = 'UPDATE Company SET c_name=?, address=?, contact=?, email=?, city=?, state=?, package=?, expected_skills=?, expected_technology_awarness=? WHERE c_id=?';
          db.query(updateSql, [c_name, address, contact, email, city, state, package, expected_skills, expected_technology_awarness, c_id], (updateErr, updateResult) => {
              if (updateErr) {
                  console.error(updateErr);
                  res.status(500).send('Error updating company record');
                  return;
              }
              res.redirect('/company'); // Redirect to the page displaying company details
          });
      } else {
          // Handling GET request
          res.render('company_update', { companyRecord }); // Pass company record object to the template
      }
  });
});

// Delete company department route
app.get('/company/delete/:c_id', (req, res) => {
  const c_id = req.params.c_id;
  const sql = 'DELETE FROM Company WHERE c_id=?';
  db.query(sql, [c_id], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error deleting company record');
          return;
      }
      res.redirect('/company'); // Redirect to the page displaying company details
  });
});


// Previous_year_Students  Previous_year_Students_create.ejs,Previous_year_Students_read.ejs, Previous_year_Students_update.ejs

// Create Previous_year_Students department route
app.get('/previous_year_students/create', (req, res) => {
  res.render('previous_year_students_create'); // Render the Previous_year_Students creation form view
});

// Previous_year_Students department creation route
app.post('/previous_year_students/create', (req, res) => {
  const { usn, f_name, l_name, Previous_year_Studentscol, address, email, contact, c_id, DOB, year_of_passing, city, state, work_city, salary, designation, dept_id, gender, category } = req.body;
  const sql = 'INSERT INTO Previous_year_Students (usn, f_name, l_name, Previous_year_Studentscol, address, email, contact, c_id, DOB, year_of_passing, city, state, work_city, salary, designation, dept_id, gender, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [usn, f_name, l_name, Previous_year_Studentscol, address, email, contact, c_id, DOB, year_of_passing, city, state, work_city, salary, designation, dept_id, gender, category], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error creating Previous_year_Students record');
          return;
      }
      res.redirect('/education_create'); // Redirect to the page displaying Previous_year_Students details
  });
});

// Route to display Previous_year_Students details
app.get('/previous_year_students', (req, res) => {
  const sql = 'SELECT * FROM Previous_year_Students';
  db.query(sql, (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error fetching Previous_year_Students records');
          return;
      }
      res.render('previous_year_students_read', { previousYearStudents: result });
  });
});
// Update Previous_year_Students department route (handles both GET and POST requests)
app.all('/previous_year_students/update/:usn', (req, res) => {
    const usn = req.params.usn;
    const sql = 'SELECT * FROM Previous_year_Students WHERE usn = ?';
    db.query(sql, [usn], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching Previous_year_Students details');
            return;
        }
        if (result.length === 0) {
            res.status(404).send('Previous_year_Students record not found');
            return;
        }
        const previousYearStudent = result[0];
        if (req.method === 'POST') {
            // Handling POST request
            if (req.user.isAdmin || req.user.email === previousYearStudent.email) {
                const { f_name, l_name, Previous_year_Studentscol, address, email, contact, c_id, DOB, year_of_passing, city, state, work_city, salary, designation, dept_id, gender, category } = req.body;
                const updateSql = 'UPDATE Previous_year_Students SET f_name=?, l_name=?, Previous_year_Studentscol=?, address=?, email=?, contact=?, c_id=?, DOB=?, year_of_passing=?, city=?, state=?, work_city=?, salary=?, designation=?, dept_id=?, gender=?, category=? WHERE usn=?';
                db.query(updateSql, [f_name, l_name, Previous_year_Studentscol, address, email, contact, c_id, DOB, year_of_passing, city, state, work_city, salary, designation, dept_id, gender, category, usn], (updateErr, updateResult) => {
                    if (updateErr) {
                        console.error(updateErr);
                        res.status(500).send('Error updating Previous_year_Students record');
                        return;
                    }
                    res.redirect('/previous_year_students'); // Redirect to the page displaying Previous_year_Students details
                });
            } else {
                res.status(403).send('Forbidden: You do not have permission to update this record');
            }
        } else {
            // Handling GET request
            res.render('previous_year_students_update', { previousYearStudent }); // Pass Previous_year_Students record object to the template
        }
    });
});

// Delete Previous_year_Students department route
app.get('/previous_year_students/delete/:usn', (req, res) => {
    const usn = req.params.usn;
    const sql = 'DELETE FROM Previous_year_Students WHERE usn=?';
    db.query(sql, [usn], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting Previous_year_Students record');
            return;
        }
        res.redirect('/previous_year_students'); // Redirect to the page displaying Previous_year_Students details
    });
});

// Current_Student  Current_Student_create.ejs,Current_Student_read.ejs, Current_Student_update.ejs

// Create Current_Student department route
app.get('/current_student/create', (req, res) => {
  res.render('current_student_create'); // Render the current student creation form view
});

// Current_Student department creation route
app.post('/current_student/create', (req, res) => {
  const { usn, name, address, email, DOB, city, state, dept_id, gender, contact, category } = req.body;
  const sql = 'INSERT INTO Current_Student (usn, name, address, email, DOB, city, state, dept_id, gender, contact, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [usn, name, address, email, DOB, city, state, dept_id, gender, contact, category], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error creating current student record');
          return;
      }
      res.redirect('/current_student'); // Redirect to the page displaying current student details
  });
});

// Route to display current student details
app.get('/current_student', (req, res) => {
  const sql = 'SELECT * FROM Current_Student';
  db.query(sql, (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error fetching current student records');
          return;
      }
      res.render('current_student_read', { currentStudents: result });
  });
});

// Update current student department route (handles both GET and POST requests)
app.all('/current_student/update/:usn', (req, res) => {
  const usn = req.params.usn;
  const sql = 'SELECT * FROM Current_Student WHERE usn = ?';
  db.query(sql, [usn], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error fetching current student details');
          return;
      }
      if (result.length === 0) {
          res.status(404).send('Current student record not found');
          return;
      }
      const currentStudentRecord = result[0];
      if (req.method === 'POST') {
          // Handling POST request
          const { name, address, email, DOB, city, state, dept_id, gender, contact, category } = req.body;
          const updateSql = 'UPDATE Current_Student SET name=?, address=?, email=?, DOB=?, city=?, state=?, dept_id=?, gender=?, contact=?, category=? WHERE usn=?';
          db.query(updateSql, [name, address, email, DOB, city, state, dept_id, gender, contact, category, usn], (updateErr, updateResult) => {
              if (updateErr) {
                  console.error(updateErr);
                  res.status(500).send('Error updating current student record');
                  return;
              }
              res.redirect('/current_student'); // Redirect to the page displaying current student details
          });
      } else {
          // Handling GET request
          res.render('current_student_update', {student: currentStudentRecord }); // Pass current student record object to the template
      }
  });
});

// Delete current student department route
app.get('/current_student/delete/:usn', (req, res) => {
  const usn = req.params.usn;
  const sql = 'DELETE FROM Current_Student WHERE usn=?';
  db.query(sql, [usn], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error deleting current student record');
          return;
      }
      res.redirect('/current_student'); // Redirect to the page displaying current student details
  });
});

// Interviewer  Interviewer_create.ejs,Interviewer_read.ejs, Interviewer_update.ejs

// Create Interviewer department route
app.get('/interviewer/create', (req, res) => {
  res.render('interviewer_create'); // Render the interviewer creation form view
});

// Interviewer department creation route
app.post('/interviewer/create', (req, res) => {
  const { Interviewer_name, Designation, Contact, Email, c_id } = req.body;
  const sql = 'INSERT INTO Interviewer (Interviewer_name, Designation, Contact, Email, c_id) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [Interviewer_name, Designation, Contact, Email, c_id], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error creating interviewer record');
          return;
      }
      res.redirect('/interviewer'); // Redirect to the page displaying interviewer details
  });
});

// Route to display interviewer details
app.get('/interviewer', (req, res) => {
  const sql = 'SELECT * FROM Interviewer';
  db.query(sql, (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error fetching interviewer records');
          return;
      }
      res.render('interviewer_read', { interviewerRecords: result });
  });
});

// Update interviewer department route (handles both GET and POST requests)
app.all('/interviewer/update/:emp_id', (req, res) => {
  const emp_id = req.params.emp_id;
  const sql = 'SELECT * FROM Interviewer WHERE emp_id = ?';
  db.query(sql, [emp_id], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error fetching interviewer details');
          return;
      }
      if (result.length === 0) {
          res.status(404).send('Interviewer record not found');
          return;
      }
      const interviewerRecord = result[0];
      if (req.method === 'POST') {
          // Handling POST request
          const { Interviewer_name, Designation, Contact, Email, c_id } = req.body;
          const updateSql = 'UPDATE Interviewer SET Interviewer_name=?, Designation=?, Contact=?, Email=?, c_id=? WHERE emp_id=?';
          db.query(updateSql, [Interviewer_name, Designation, Contact, Email, c_id, emp_id], (updateErr, updateResult) => {
              if (updateErr) {
                  console.error(updateErr);
                  res.status(500).send('Error updating interviewer record');
                  return;
              }
              res.redirect('/interviewer'); // Redirect to the page displaying interviewer details
          });
      } else {
          // Handling GET request
          res.render('interviewer_update', { interviewerRecord }); // Pass interviewer record object to the template
      }
  });
});

// Delete interviewer department route
app.get('/interviewer/delete/:emp_id', (req, res) => {
  const emp_id = req.params.emp_id;
  const sql = 'DELETE FROM Interviewer WHERE emp_id=?';
  db.query(sql, [emp_id], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error deleting interviewer record');
          return;
      }
      res.redirect('/interviewer'); // Redirect to the page displaying interviewer details
  });
});

// Interview department Interviewn_create.ejs,Interview_read.ejs, Interview_update.ejs

// Create Interview department route
app.get('/interview/create', (req, res) => {
  res.render('interview_create'); // Render the interview creation form view
});

// Interview department creation route
app.post('/interview/create', (req, res) => {
  const { c_id, interview_date, inter_time, expected_skills, cgpa, expected_technology_awarness, location } = req.body;
  const sql = 'INSERT INTO Interview (c_id, interview_date, inter_time, expected_skills, cgpa, expected_technology_awarness, location) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [c_id, interview_date, inter_time, expected_skills, cgpa, expected_technology_awarness, location], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error creating interview record');
          return;
      }
      res.redirect('/interview'); // Redirect to the page displaying interview details
  });
});

// Route to display interview details
app.get('/interview', (req, res) => {
  const sql = 'SELECT * FROM Interview';
  db.query(sql, (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error fetching interview records');
          return;
      }
      res.render('interview_read', { interviewRecords: result });
  });
});

// Update interview department route (handles both GET and POST requests)
app.all('/interview/update/:interview_id', (req, res) => {
    const interview_id = req.params.interview_id;
    const sql = 'SELECT * FROM Interview WHERE interview_id = ?';
    db.query(sql, [interview_id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching interview details');
            return;
        }
        if (result.length === 0) {
            res.status(404).send('Interview record not found');
            return;
        }
        const interview = result[0]; // Correct variable name here
        if (req.method === 'POST') {
            // Handling POST request
            const { c_id, interview_date, inter_time, expected_skills, cgpa, expected_technology_awarness, location } = req.body;
            const updateSql = 'UPDATE Interview SET c_id=?, interview_date=?, inter_time=?, expected_skills=?, cgpa=?, expected_technology_awarness=?, location=? WHERE interview_id=?';
            db.query(updateSql, [c_id, interview_date, inter_time, expected_skills, cgpa, expected_technology_awarness, location, interview_id], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error(updateErr);
                    res.status(500).send('Error updating interview record');
                    return;
                }
                res.redirect('/interview'); // Redirect to the page displaying interview details
            });
        } else {
            // Handling GET request
            res.render('interview_update', { interview }); // Correct variable name passed to the view
        }
    });
  });
  
  

// Delete interview department route
app.get('/interview/delete/:interview_id', (req, res) => {
  const interview_id = req.params.interview_id;
  const sql = 'DELETE FROM Interview WHERE interview_id=?';
  db.query(sql, [interview_id], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error deleting interview record');
          return;
      }
      res.redirect('/interview'); // Redirect to the page displaying interview details
  });
});


// applyInterview department applyInterview.ejs,applyInterview.ejs, applyInterview.ejs

// Create applyInterview department route
app.get('/applyInterview/create', (req, res) => {
  res.render('applyInterview_create'); // Render the apply interview creation form view
});

// applyInterview department creation route
app.post('/applyInterview/create', (req, res) => {
  const { usn, interview_id, c_id, expected_skills, cgpa, expected_technology_awarness, email } = req.body;
  const sql = 'INSERT INTO applyInterview (usn, interview_id, c_id, expected_skills, cgpa, expected_technology_awarness, email) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [usn, interview_id, c_id, expected_skills, cgpa, expected_technology_awarness, email], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error creating applyInterview record');
          return;
      }
      res.redirect('/applyInterview'); // Redirect to the page displaying applyInterview details
  });
});

// Route to display applyInterview details
// Create applyInterview department route
// Create applyInterview department route
app.get('/applyInterview/create', (req, res) => {
    res.render('applyInterview_create'); // Render the applyInterview creation form view
  });
  
  // applyInterview department creation route
  app.post('/applyInterview/create', (req, res) => {
    const { usn, interview_id, c_id, expected_skills, cgpa, expected_technology_awarness, email } = req.body;
    const sql = 'INSERT INTO applyInterview (usn, interview_id, c_id, expected_skills, cgpa, expected_technology_awarness, email) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [usn, interview_id, c_id, expected_skills, cgpa, expected_technology_awarness, email], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error creating applyInterview record');
            return;
        }
        res.redirect('/applyInterview'); // Redirect to the page displaying applyInterview details
    });
  });
  
  // Route to display applyInterview details
  app.get('/applyInterview', (req, res) => {
    const sql = 'SELECT * FROM applyInterview';
    db.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching applyInterview records');
            return;
        }
        res.render('applyInterview_read', { applyInterviewRecords: result });
    });
  });
    // Route to display applyInterview details
    app.get('/applyInterview_interviewview', (req, res) => {
        const sql = 'SELECT * FROM applyInterview';
        db.query(sql, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error fetching applyInterview records');
                return;
            }
            res.render('applyInterview_read_interviewer', { applyInterviewRecords: result });
        });
      });




// Define a route to trigger the sendEmailToApplicant function
app.get('/send-email/:usn/:interview_id', (req, res) => {
    const usn = req.params.usn;
    const interview_id = req.params.interview_id;

    // Call the function to send the email
    sendEmailToApplicant(usn, interview_id, db);

    // Respond with a message indicating that the email has been sent
    res.send('Email sent successfully');
});

  // Assuming you have already configured Express and your database connection

// Route to render the form for updating applyInterview record
app.get('/applyInterview/update/:usn/:interview_id', (req, res) => {
    const usn = req.params.usn;
    const interview_id = req.params.interview_id;

    // Logic to fetch the applyInterview record based on the usn and interview_id
    // You need to implement this logic based on your application's data retrieval mechanism

    // For example, you might have a function to fetch the applyInterview record from the database
    // Replace this with your actual data retrieval logic
    const applyInterview = {
        usn: usn,
        interview_id: interview_id,
        // Fetch other fields from your data source (e.g., database)
        // c_id: fetchedData.c_id,
        // expected_skills: fetchedData.expected_skills,
        // cgpa: fetchedData.cgpa,
        // expected_technology_awarness: fetchedData.expected_technology_awarness,
        // email: fetchedData.email
    };

    // Render the applyInterview_update.ejs view with the applyInterview data
    res.render('applyInterview_update', { applyInterview: applyInterview });
});

// Update applyInterview department route (handles both GET and POST requests)
app.all('/applyInterview/update/:usn/:interview_id', (req, res) => {
    const usn = req.params.usn;
    const interview_id = req.params.interview_id;
    const sql = 'SELECT * FROM applyInterview WHERE usn = ? AND interview_id = ?';
    db.query(sql, [usn, interview_id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching applyInterview details');
            return;
        }
        if (result.length === 0) {
            res.status(404).send('applyInterview record not found');
            return;
        }
        const applyInterview = result[0]; 
        if (req.method === 'POST') {
            // Handling POST request
            const { c_id, expected_skills, cgpa, expected_technology_awarness, email } = req.body;
            const updateSql = 'UPDATE applyInterview SET c_id=?, expected_skills=?, cgpa=?, expected_technology_awarness=?, email=? WHERE usn=? AND interview_id=?';
            db.query(updateSql, [c_id, expected_skills, cgpa, expected_technology_awarness, email, usn, interview_id], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error(updateErr);
                    res.status(500).send('Error updating applyInterview record');
                    return;
                }
                res.redirect('/applyInterview'); // Redirect to the page displaying applyInterview details
            });
        } else {
            // Handling GET request
            res.render('applyInterview_update', { applyInterview }); 
        }
    });
});

  // Delete applyInterview department route
  app.get('/applyInterview/delete/:usn/:interview_id', (req, res) => {
    const usn = req.params.usn;
    const interview_id = req.params.interview_id;
    const sql = 'DELETE FROM applyInterview WHERE usn=? AND interview_id=?';
    db.query(sql, [usn, interview_id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error deleting applyInterview record');
            return;
        }
        res.redirect('/applyInterview'); // Redirect to the page displaying applyInterview details
    });
  });
  
  
// Employee
// Create Employment department route
app.get('/employment/create', (req, res) => {
  res.render('employment_create'); // Render the employment creation form view
});

// Employment department creation route
app.post('/employment/create', (req, res) => {
  const { usn, name, gender, num_of_offers, employer_name, designation, campus_type, company_type, ctc, employer_email } = req.body;
  const sql = 'INSERT INTO Employment (usn, name, gender, num_of_offers, employer_name, designation, campus_type, company_type, ctc, employer_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [usn, name, gender, num_of_offers, employer_name, designation, campus_type, company_type, ctc, employer_email], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error creating employment record');
          return;
      }
      res.redirect('/employment'); // Redirect to the page displaying employment details
  });
});

// Route to display employment details
app.get('/employment', (req, res) => {
  const sql = 'SELECT * FROM Employment';
  db.query(sql, (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error fetching employment records');
          return;
      }
      res.render('employment_read', { employmentRecords: result });
  });
});

// Update employment department route (handles both GET and POST requests)
app.all('/employment/update/:usn', (req, res) => {
  const usn = req.params.usn;
  const sql = 'SELECT * FROM Employment WHERE usn = ?';
  db.query(sql, [usn], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error fetching employment details');
          return;
      }
      if (result.length === 0) {
          res.status(404).send('Employment record not found');
          return;
      }
      const employmentRecord = result[0];
      if (req.method === 'POST') {
          // Handling POST request
          const { name, gender, num_of_offers, employer_name, designation, campus_type, company_type, ctc, employer_email } = req.body;
          const updateSql = 'UPDATE Employment SET name=?, gender=?, num_of_offers=?, employer_name=?, designation=?, campus_type=?, company_type=?, ctc=?, employer_email=? WHERE usn=?';
          db.query(updateSql, [name, gender, num_of_offers, employer_name, designation, campus_type, company_type, ctc, employer_email, usn], (updateErr, updateResult) => {
              if (updateErr) {
                  console.error(updateErr);
                  res.status(500).send('Error updating employment record');
                  return;
              }
              res.redirect('/employment'); // Redirect to the page displaying employment details
          });
      } else {
          // Handling GET request
          res.render('employment_update', { employmentRecord }); // Pass employment record object to the template
      }
  });
});

// Delete employment department route
app.get('/employment/delete/:usn', (req, res) => {
  const usn = req.params.usn;
  const sql = 'DELETE FROM Employment WHERE usn=?';
  db.query(sql, [usn], (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error deleting employment record');
          return;
      }
      res.redirect('/employment'); // Redirect to the page displaying employment details
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


