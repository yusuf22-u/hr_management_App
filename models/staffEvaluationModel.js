import db from '../config/db.js';

export const createStaffEvaluationTable = () => {
    const sql = `
    CREATE TABLE IF NOT EXISTS staff_evaluation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    evaluation_date DATE NOT NULL,
    evaluator_name VARCHAR(255) NOT NULL,
    communication_skills INT NOT NULL,  
    technical_skills INT NOT NULL,     
    teamwork INT NOT NULL,             
    problem_solving INT NOT NULL,       
    punctuality INT NOT NULL,          
    responsibility INT NOT NULL,        
    expertise INT NOT NULL,             
    dependability INT NOT NULL,         
    reliability INT NOT NULL,           
    skills INT NOT NULL,               
    overall_performance INT GENERATED ALWAYS AS 
        (communication_skills + technical_skills + teamwork + problem_solving + 
         punctuality + responsibility + expertise + dependability + reliability + skills) STORED,
    comments TEXT,                    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

    `;

    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log('Staff Evaluation table created or already exists');
    });
};
