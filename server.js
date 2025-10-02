//Performed Custom Error Handling

//new comment

import express from 'express'
//for browser security
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import ideaRouter from './routes/ideaRoutes.js'
import authRouter from './routes/authRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import connectDB from './config/db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000;

// Connect ot MongoDB
connectDB()

//CORS Config
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173', // Vite default
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'https://idea-drop-5f9xavwf7-norwood45335s-projects.vercel.app', // From your error logs
    'https://idea-drop-ui-psi.vercel.app',
    // Add your actual frontend Vercel URL here
    process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

//middleware, runs in between request and response
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Allow any vercel.app subdomain for your project
        if (origin.includes('norwood45335s-projects.vercel.app') || 
            origin.includes('idea-drop') && origin.includes('vercel.app')) {
            return callback(null, true);
        }
        
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
}));
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

// Handle preflight requests
app.options('*', cors());

//Routes
app.use('/api/ideas', ideaRouter)
app.use('/api/auth', authRouter)

// Health check endpoint for keep-alive
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

//404 Fallback
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`)
    res.status(404)
    next(error)
})

app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
