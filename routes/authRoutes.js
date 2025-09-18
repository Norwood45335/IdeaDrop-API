import express from 'express'
import User from '../models/User.js'
import { jwtVerify } from 'jose'
import { JWT_SECRET } from '../utils/getJwtSecret.js'
import {generateToken} from '../utils/generateToken.js'

const router = express.Router()

// @router      POST api/auth/register
// @description Register new user
// @access      Public
router.post('/register', async (req, res, next) => {
    try{
        const {name, email, password} = req.body || {};
        if(!name || !email || !password){
            res.status(400)
            throw new Error('All fields are required')
        }

        const existingUser = await User.findOne({email})
        if(existingUser){
            res.status(400)
            throw new Error('User already exists')
        }

        const user = await User.create({name, email, password})

        //create Tokens
        const payload = {userId: user._id.toString()}
        const accessToken = await generateToken(payload, '15m')
        const refreshToken = await generateToken(payload, '30d')

        // Set refresh token in HTTP-Only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none': 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
        })

        res.status(201).json({
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    }catch(err){
        console.log(err)
        next(err)
    }
})

// @router      POST api/auth/login
// @description Authenticate user
// @access      Public
router.post('/login', async (req, res, next) => {
    try{
        const {email, password} = req.body || {};

        if(!email || !password){
            res.status(400)
            throw new Error('Email and password are required')
        }

        //Find user if there's an email and password
        //Dont say "user doesnt exist", 
        // because hackers will try to find which email is registered
        const user = await User.findOne({email});
        if(!user){
            res.status(401);
            throw new Error('Invalid Credentials');
        }

        //check if password matches
        const isMatch = await user.matchPassword(password);

        //have same response as if theres no user
        if(!isMatch){
            res.status(401);
            throw new Error('Invalid Credentials');
        }

        //Create Tokens
        const payload = {userId: user._id.toString()}
        const accessToken = await generateToken(payload, '15m')
        const refreshToken = await generateToken(payload, '30d')

        // Set refresh token in HTTP-Only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none': 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
        })

        res.status(201).json({
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            }
        })
    }catch(err){
        console.log(err)
        next(err)
    }
})
// @router      POST api/auth/register
// @description Logout user and clear refresh token
// @access      Public
router.post('/logout', (req, res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE.ENV === 'production',
        sameSite: 'none'
    });
    res.status(200).json({message: 'Logged out successfully'})
});

// @router      POST api/auth/refresh
// @description Generate new access token from refresh token
// @access      Public (Needs valid refresh token in cookie)
router.post('/refresh', async (req, res, next) => {
    try{
        const token = req.cookies?.refreshToken;
        console.log('Refreshing token...')
        if(!token){
            res.status(401)
            throw new Error('No refresh token')
        }

        const {payload} = await jwtVerify(token, JWT_SECRET);
        const user = await User.findById(payload.userId);
        if(!user){
            res.status(401)
            throw new Error('No user');
        }

        const newAccessToken = await generateToken({userId: user._id.toString()}, '1m');
        res.json({
            accessToken: newAccessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    }catch(err){
        res.status(401);
        next(err);
    }
})
export default router;

