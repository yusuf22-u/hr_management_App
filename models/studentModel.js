import db from '../config/db.js';

export const createStudentTable = () => {
    const sql = `
   CREATE TABLE IF NOT EXISTS student (
    student_matNo VARCHAR(20) PRIMARY KEY,     
    full_name VARCHAR(255) NOT NULL,           
    gender ENUM('Male', 'Female', 'Other') NOT NULL,  
    email VARCHAR(255) UNIQUE NOT NULL,         
    phone_number VARCHAR(20) NOT NULL,        
    address TEXT NOT NULL,                     
    date_of_birth DATE NOT NULL,                
    date_of_admission DATE NOT NULL,             
    marital_status ENUM('Single', 'Married', 'Divorced', 'Widowed') DEFAULT 'Single',  
    parent_tel VARCHAR(20),                     
    parent_email VARCHAR(255), 
    parent_name VARCHAR(255) NOT NULL,                  
    occupation VARCHAR(100),                    
    level_of_entry ENUM('Gold', 'Silver', 'Bronze') NOT NULL, 
    mode_of_entry ENUM('New Entry', 'Direct Entry', 'Continuation') NOT NULL,  
    health_conditions TEXT,                       
    health_explanation TEXT,                     
    differently_abled ENUM('Yes', 'No') DEFAULT 'No', 
    center VARCHAR(100),                         
    profile_pic VARCHAR(255),                    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  


);
    `;

    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log('student table created or already exists');
    });
};