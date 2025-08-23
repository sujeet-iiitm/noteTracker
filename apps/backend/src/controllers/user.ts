import { Request , Response } from 'express';
import { userSigninMiddleware, userVerifyMiddleware } from "../middlewares/userMiddlewares.js";
import { OAuth2Client } from 'google-auth-library';

// import { prisma } from '@repo/db';
// import { withAccelerate } from '@repo/db';
// const prisma = new prisma().$extends(withAccelerate());
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import express from 'express';
const { Router } = express;
const router = Router();
import { prisma } from '@notes/db';

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
            const user = await prisma.user.create({
                data: {
                    email: email,
                    name: name,
                    password: hashedPassword,
                },
            });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to create user' });
        }
    });
});


router.post('/signin', userSigninMiddleware, async (req:Request, res:Response) => {
    const user = req.body;
    const {name,email,createdAt } = user;
    const User = await prisma.user.findUnique({
        where: { email: email },
    });

    if (!User) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign({id: user.id},jwt_secret_key,
        {expiresIn : '7d'}
    )
    res.cookie("token", token, {
     httpOnly: true,
     secure: true,
     sameSite: "strict",
     maxAge: 7 * 24 * 60 * 60 * 1000
     });
    res.json({user})
    res.status(200).json({ message: 'User signed in successfully', token });
});

router.get('/userDetails', userVerifyMiddleware , async(req:Request , res:Response) => {
    const userId = req.params.userId;
    const userDetails = await prisma.user.findUnique({
        where : {userId},
    });
    const name = JSON.stringify(userDetails.name);
    const email = JSON.stringify(userDetails.email);
    const notesCount = JSON.stringify(userDetails.Notes.size());
    const createdAt = JSON.stringify(userDetails.createdAt);
    if(!userDetails){
        return res.status(404).json({ message  : "user not found"});
    }
    return res.status(200).send({
        name,email,notesCount,createdAt})
});

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const jwt_secret_key = process.env.JWT_SECRET || "";

router.post('/googleLogin',async(require,res) => {
    const { credential } = require.body;
    try{
        const ticket = await client.verifyIdToken({
            idToken : credential,
            audience :process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        if(!payload) return res.status(401).json({error:"invalid Token"});
        const { name, email } = payload;

        const user = await prisma.user.findUnique({where : {email}});
        if(!user){
            await prisma.user.create({
                data: {email, name}
            })
        }
        const token = jwt.sign({id: user.id},jwt_secret_key,
            {expiresIn : '7d'}
        )
        res.cookie("token", token, {
         httpOnly: true,
         secure: true,
         sameSite: "strict",
         maxAge: 7 * 24 * 60 * 60 * 1000
         });
        res.json({user})
    }
    catch(err){
        res.status(401).json({message : "Google Authentication Failed!"})
    }
})

export default router;  