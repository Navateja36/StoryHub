import 'dotenv/config'; 
import express from 'express'
import mongoose  from "mongoose";
import cors from 'cors';
import path from 'path'
import verifyToken from './middleware/auth.middleware.js'
import { fileURLToPath } from 'url'; // <--- CRITICAL FIX: Missing import

import authRoute from './routes/auth.routes.js'
import postRoute from './routes/post.routes.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app=express();
// import testroute from './routes/test.routes.js'

app.use(cors({
    origin: 'http://localhost:3000', // Specify the frontend origin (or use '*' for testing)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

mongoose.connect('mongodb://127.0.0.1:27017/medium');
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// app.use('/',testroute);

app.use('/api/auth',authRoute);

app.use('/api/posts',postRoute)



app.listen(5000);