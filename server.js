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
    'https://idea-drop-ui-psi.vercel.app',
    'http://localhost:5173', // Vite default
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    // Add your actual frontend Vercel URL here
    process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

//middleware, runs in between request and response
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

//Routes
app.use('/api/ideas', ideaRouter)
app.use('/api/auth', authRouter)

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
