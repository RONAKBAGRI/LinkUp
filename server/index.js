const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/dbConnect');
const bodyParser=require('body-parser')
const authRoute=require('./routes/authRoutes')

dotenv.config();

const PORT = process.env.PORT || 8000;
const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors());

// Database connection
connectDB();

// Routes
app.use('/api/auth',authRoute)

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
