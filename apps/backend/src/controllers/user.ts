import { Request , Response } from 'express';
import { userSigninMiddleware } from "../middlewares/userMiddlewares.js";
// import { prisma } from '@repo/db';
// import { withAccelerate } from '@repo/db';
// const prisma = new prisma().$extends(withAccelerate());
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import express from 'express';
const { Router } = express;
const router = Router();
import { prisma } from '@notes/db';
import { AsyncLocalStorage } from 'async_hooks';

router.post('/signup', async (req:Request, res:Response) => {
    const user = req.body;
    const { email,name,password } = user;
    if (!email || !name || !password) {
        return res.status(400).json({ error: 'Email, name, and password are required' });
    }
    
    const existingUser = await prisma.user.findUnique({
        where: { email: email },
    });
    if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
    }

    const saltRounds: number = parseInt(process.env.bcrypt_salt_rounds || "10");
    bcrypt.hash(password, saltRounds, async(err:any, hashedPassword:string) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
        try {
            await prisma.user.create({
                data: {
                    email: email,
                    name: name,
                    password: hashedPassword,
                },
            });
            res.status(200).json({message: 'User created successfully'});
        } catch (error) {
            return res.status(500).json({ error: 'Failed to create user' });
        }
    });
});

router.post('/signin', userSigninMiddleware, async (req:Request, res:Response) => {
    const user = req.body;
    const {name,email } = user;
    const User = await prisma.user.findUnique({
        where: { email: email },
    });

    if (!User) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    AsyncLocalStorage.setItem('name', JSON.stringify(name));
    const token = jwt.sign({ id: User.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.header('Authorization', `Bearer ${token}`);
    res.status(200).json({ message: 'User signed in successfully', token });
});


export default router;  