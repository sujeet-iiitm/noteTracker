import { prisma } from '@notes/db';
import { Request , Response, NextFunction } from 'express';

// import { PrismaClient } from '@prisma/client';
// import { withAccelerate } from '@prisma/extension-accelerate';
// const prisma = new PrismaClient().$extends(withAccelerate());
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import CookieStore from "cookie-store";


export const userSigninMiddleware = async(req:Request, res:Response, next:NextFunction) => {
    const user = req.body;
    if (!user.email || !user.password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    const email = user.email;
    const password = user.password;

    const User = await prisma.user.findUnique({
        where: { email: email },
    });
    if (!User) {
        return res.status(404).json({ error: 'User not found' });
    }
    const hashedPassword = User.password;

    bcrypt.compare(password, hashedPassword, (err:any, isMatch:boolean) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        next();
    });
};



export const userVerifyMiddleware = async(req:Request, res:Response, next:NextFunction) => {
    const jwt_secret_key : any = process.env.JWT_SECRET_KEY;
    const token : string = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if(!token){
        return res.status(401).json({message: "UnAuthorized"});
    }
    try {
        const decoded = jwt.verify(token, jwt_secret_key);
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid token payload' });
        }
        next();
    } catch (error) {
        return res.status(401).json({ message : 'Token Expired -or- Invalid token' });
    }

};
