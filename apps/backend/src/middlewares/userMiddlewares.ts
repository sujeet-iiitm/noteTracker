import dotenv from 'dotenv';
dotenv.config();
import type { Request , Response, NextFunction } from 'express';
import { PrismaClient } from '@notes/db'
import { withAccelerate } from '@notes/db'
const prisma = new PrismaClient().$extends(withAccelerate())
import jwt, {type JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import rateLimit from 'express-rate-limit';

export const userSigninMiddleware = async(req:Request, res:Response, next:NextFunction) => {
    const user = req.body;
    const { email,password } = user;
    if (!user.email || !user.password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    const User = await prisma.user.findUnique({
        where: { email: email },
    });
    if (!User) {
        return res.status(404).json({ error: 'User not found' });
    }
    const hashedPassword = User.password || "";   
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) {
        console.log(isMatch);
      return res.status(401).json({ error: "Invalid email or password" });
    }
        next();
};



export const userVerifyMiddleware = async(req:Request, res:Response, next:NextFunction) => {
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message: "Unauthorized - No token provided"});
    }
    try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    (req as any).userId = decoded.id;
    next();
    } catch (error) {
        return res.status(401).json({ message : 'Token Expired -or- Invalid token' });
    }
};


export const signupRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        error: 'Trying to be smart!... Leave it'
    },
    standardHeaders: true, //new-one
    legacyHeaders: false, //old-ones
    handler: (req, res) => {
        console.log("Rate limit exceeded for your IP");
        res.status(429).json({ error: "Too many signup attempts. Please try again later." });
    }
});

export const createPasswordRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: {
        error: 'Trying to be smart!... Leave it'
    },
    standardHeaders: true, //new-one
    legacyHeaders: false, //old-ones
    handler: (req, res) => {
        console.log("Rate limit exceeded for your IP");
        res.status(429).json({ error: "Too many Password Saving attempts. Please try again later." });
    }
})