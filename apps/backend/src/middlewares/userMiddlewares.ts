import { prisma } from '@notes/db';
import { Request , Response, NextFunction } from 'express';
// import { PrismaClient } from '@prisma/client';
// import { withAccelerate } from '@prisma/extension-accelerate';
// const prisma = new PrismaClient().$extends(withAccelerate());
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from 'dotenv';
dotenv.config();

export const userSigninMiddleware = async(req:Request, res:Response, next:NextFunction) => {
    const user = req.body;
    const { email,password } = user;
    if (!user.email || !user.password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    const User = await prisma.user.findUnique({
        where: { email: email },
    });
        console.log(User);
    if (!User) {
        return res.status(404).json({ error: 'User not found' });
    }
    const hashedPassword = User.password;   
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
