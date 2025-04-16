import db from '../config/db.js';
import nodemailer from 'nodemailer'
export const handleReset = (req, res) => {
    const{email}=req.body
    try {
        const userExit = `SELECT * FROM users WHERE email = ?`;
        if (!userExit) res.json({ error: "email doesn't exit" })
        db.query(checkUserSql, [email], async (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Database query error: ' + err });
            }
        })
      

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'awardpresident61@gmail.com',
    pass: 'goglfcsogyinuoqe'
  }
});

const mailOptions = {
  from: 'awardpresident61@gmail.com',
  to: email,
  subject: 'Reset password',
  text: `http://localhost:5173/forgotPassword/${token}`
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
}); 
    } catch (error) {
        res.json(error)
    }
    //gogl fcso gyin uoqe 
}