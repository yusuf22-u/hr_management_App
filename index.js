import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'; // Import cors middleware
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import './utils/cronJobs.js'

// Import your routers and models
import { userRouter } from './routers/users.js';
import { createUserTable } from './models/usersModel.js';
import { createEmployeeTable } from './models/employeeModel.js';
import { employeeRouter } from './routers/employee.js';
import { createStaffEvaluationTable } from './models/staffEvaluationModel.js';
import { staffEvaluationRouter } from './routers/staffEvaluation.js';
import { createStudentTable } from './models/studentModel.js';
import { studentRouter } from './routers/student.js';
import { createStudentScoresTable } from './models/participantModel.js';
import { awardParticipantsRouter } from './routers/awardParticipant.js';
import { createLeaveTable } from './models/leaveModel.js';
import { leaveRouter } from './routers/leaves.js';
import { createnotificationsTable } from './models/notificationsModel.js';
import { createItemsTable } from './models/inventoryModel.js';
import { createStockTable } from './models/stockModel.js';
import { createitem_allocationsTable } from './models/item_allocations.js';
import { itemsRouter } from './routers/Items.js';
import { allocateItemRouter } from './routers/item_allocation.js';
import { stockRouter } from './routers/stock.js';
import { createPayrollTable } from './models/payrollModel.js';
import { payrollRouter } from './routers/payRoll.js';
import { studentScoreRouter } from './routers/studentscore.js';
import { createMessageTable } from './models/messageModel.js';
import { notificationRouter } from './routers/notification.js';
import { employeeCertificatesRouter } from './routers/employeeCertificates.js';
import { createCertificatesTable } from './models/certificatesModel.js';
import { createEmailTable } from './models/EmailModel.js';
import { createCenterFormTable } from './models/centerForm.js';
import { centerformRouter } from './routers/centerForm.js';
import { dropTables } from './utils/resetTables.js';
import dotenv from 'dotenv';
dotenv.config();



const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
    cors: {
        origin: `https://hr-management-sys-app.netlify.app`, // Allow this origin
       
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
        credentials: true // Allow credentials (cookies, authorization headers)
    }
});
export { io };
// Middleware setup
app.use(cookieParser());
app.use(cors({
    origin: 'https://hr-management-sys-app.netlify.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded form data

// // Serve static files
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.use('/uploads/profile', express.static(path.join(__dirname, 'uploads/profile')));
// app.use('/uploads/student', express.static(path.join(__dirname, 'uploads/student')));
// app.use('/uploads/userpic', express.static(path.join(__dirname, 'uploads/userpic')));
// app.use('/uploads/items', express.static(path.join(__dirname, 'uploads/items')));
// app.use("/uploads/certificate", express.static(path.join(__dirname, "uploads/certificate")));

// // drop tables
(async () => {
    await dropTables(); // Safely drops the tables
// //     // createEmployeeTable();
// //     createUserTable();

// //     createLeaveTable();
// //     createnotificationsTable();
//     createPayrollTable();
// //     createMessageTable();
// //     createCertificatesTable();
  })();



// createUserTable();
// createnotificationsTable();
// createStaffEvaluationTable();
// createStudentTable(); // Uncomment if needed
// createStudentScoresTable()
createItemsTable()
createStockTable()
// createitem_allocationsTable()
// createLeaveTable();
// createPayrollTable()
// createMessageTable()
// createCertificatesTable()
// createEmailTable()
// createCenterFormTable()

// Set up routes
app.use('/v1', userRouter);
app.use('/v1/employees', employeeRouter);
app.use('/v1/evaluations', staffEvaluationRouter);
app.use('/v1/student', studentRouter);
app.use('/v1/participant', awardParticipantsRouter);
app.use('/v1/leaves', leaveRouter);
app.use('/v1/items', itemsRouter)
app.use('/v1/allocateItem', allocateItemRouter)
app.use('/v1/stocks', stockRouter)
app.use('/v1/payrolls', payrollRouter)
app.use('/v1/score', studentScoreRouter)
app.use('/v1/certificates', employeeCertificatesRouter)
app.use('/v1/center', centerformRouter)

app.use('/v1/notifications', notificationRouter); // Uncomment if needed

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// Start the server
server.listen(process.env.PORT || 3306, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
});
