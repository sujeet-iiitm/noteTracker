import { Request , Response } from 'express';
import { userSigninMiddleware, userVerifyMiddleware } from "../middlewares/userMiddlewares.js";
import { OAuth2Client } from 'google-auth-library';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

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
    const { name,email,password } = user;
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
    const hashedPassword = await bcrypt.hash(password,saltRounds);
        try {
            await prisma.user.create({
                data: {
                    email: email,
                    name: name,
                    password: hashedPassword,
                },
            });
            res.send({message : "user Created Successfully!.."})
        } catch (error) {
            return res.status(500).json({ error: 'Failed to create user' });
        }
    });


router.post('/signin', userSigninMiddleware, async (req:Request, res:Response) => {
    const user = req.body;
    const {email,password } = user;
    const User = await prisma.user.findUnique({
        where: { email: email },
    });

    if (!User) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign({id: User.id},jwt_secret_key,    
        {expiresIn : '7d'}
    )
    const userDetails = JSON.stringify({
        name:   User.name,
        createdAt: User.createdAt,
        email: User.email,
        userId: User.id,
        notesCount: await prisma.note.count({where: {userId : User.id} })
    });
    res.cookie("token", token, {
     httpOnly: true,
     secure: false,
     sameSite: 'lax',
     maxAge: 7 * 24 * 60 * 60 * 1000,
     path : '/'
     });
    return res.status(200).json({message: "user signed in successfully..",userDetails})
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

router.post('/googleLogin',async(require:Request,res:Response) => {
    const { credential } = require.body;
    try{
        const ticket = await client.verifyIdToken({
            idToken : credential,
            audience : process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        if(!payload) return res.status(401).json({error:"invalid Token"});
        const { name, email } = payload;

        let userr = await prisma.user.findUnique({ where: { email } });
        if (!userr) {
          await prisma.user.create({ data: { email, name } });
          userr = await prisma.user.findUnique({ where: { email } });
        }
        const userDetails = JSON.stringify({
            name: userr.name,
            createdAt: userr.createdAt,
            email: userr.email,
            userId: userr.id,
            notesCount: await prisma.note.count({where: {userId : userr.id} })

        });

        const token = jwt.sign({id: userr.id},jwt_secret_key,
            {expiresIn : '7d'}
        )
        res.cookie("token", token, {
         httpOnly: true,
         secure: false,
         sameSite: 'lax',
         maxAge: 7 * 24 * 60 * 60 * 1000,
         path : '/'
         });
        res.json({userDetails})
    }
    catch(err){
        res.status(401).json({message : "Google Authentication Failed!"})
    }
})

router.put('/editUserDetails', userVerifyMiddleware , async(req: Request, res: Response) => {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
    const userId = decoded.id;
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    try {
        const existingUser = await prisma.user.findFirst({
            where: { 
                email: email,
                NOT: { id: userId }
            },
        });

        if (existingUser) {
            return res.status(409).json({ error: 'Email is already taken' });
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name, email },
        });
        res.status(200).json({ 
            message: 'Profile updated successfully',
            user: {
                name: updatedUser.name,
                email: updatedUser.email,
                userId: updatedUser.id,
                createdAt: updatedUser.createdAt
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

router.delete('/deleteAccount', userVerifyMiddleware,  async(req: Request, res: Response) => {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
    const userId = decoded.id;
    try{
        const deleteUser = await prisma.user.delete({
           where: {
             id: userId,
           },
    })
        res.clearCookie('token',{
        httpOnly : true,
        secure: false,
        sameSite : 'lax',
    });
        res.status(200).send({message : "user Deleted Successfully!.."});
    }catch(error){
        res.status(401).send({message : "Error , Try Again!.."});
        console.log("Error occured", error);
    }
});

router.get("/me", async (req: Request, res: Response) => {
  try {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) return res.status(401).json({ error: "User not found" });

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
});

router.post('/buyMeACoffee', userVerifyMiddleware , async (req : Request , res : Response) => {
    const { amount, currency = "INR", receipt = `receipt_${Date.now()}` } = req.body;
try{
const razorpay = new Razorpay({
    key_id : process.env.key_razor_id,
    key_secret : process.env.key_razor_secret
});
const options = {
    amount : amount*100,
    currency,
    receipt,
    payment_capture: 1,
};
const order = await razorpay.orders.create(options);
res.status(200).json(order);
}catch(error){
    res.send({message: error});
}
})

router.post('/logout', async(req: Request, res: Response) => {
    res.clearCookie('token',{
        httpOnly : true,
        secure: false,
        sameSite : 'lax',
        path : '/'
    });
     return res.status(200).send({message : "logged Out Successfully"});
})
export default router;