require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose')
let port = process.env.PORT || 3000;
const userRoutes = require('./routes/user.route')
const authRoutes = require('./routes/auth.route')

const cors = require("cors");
const floorRoutes = require('./routes/floor.route');
const roomRoutes = require('./routes/room.route');
const hosteluserRoute = require('./routes/hostelusers.route');
const hostel_staffRoute = require('./routes/hostel_staff.route')
const paymentRoutes = require('./routes/payment.route');
const hostelMembershipRoute = require('./routes/hostel_membership.route');
const PriceRoute = require ("./routes/price.route")
const Income = require ('./routes/income.route')
const Expenses = require('./routes/expenses.route')
const Salary = require('./routes/salary.route')
const paymentPlan = require('./routes/paymentPlan.route')


mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('db responding');
})
.catch((err) => {
    console.log(err);
})

const app = express();
app.use(express.json());    

app.use(cors());


app.listen(port, () => {
    console.log(`server listening on port 3000`);
})



app.use('/api', userRoutes);
app.use('/api', authRoutes);
app.use('/api', floorRoutes);
app.use('/api', roomRoutes );
app.use('/api',hosteluserRoute);
app.use('/api',hostel_staffRoute)
app.use('/api', paymentRoutes);
app.use('/api', hostelMembershipRoute)
app.use('/api', PriceRoute)
app.use('/api',Income)
app.use('/api', Expenses)
app.use('/api', Salary)
app.use('/api',paymentPlan)


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return res.status(statusCode).json({
        success: false,
        message,
        statusCode, 
    })
})


