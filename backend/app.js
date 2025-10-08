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

// app.use(cors({
//     origin: 'https://storyhub-frontend.vercel.app/', // Specify the frontend origin (or use '*' for testing)
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
// }));

app.use(cors())

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected successfully!"))
    .catch(err => console.error("MongoDB connection error:", err));


app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// app.use('/',testroute);

app.use('/api/auth',authRoute);

app.use('/api/posts',postRoute)



app.listen(5000);