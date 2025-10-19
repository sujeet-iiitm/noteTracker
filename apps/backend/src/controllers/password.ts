import dotenv from 'dotenv';
dotenv.config();
import type { Request , Response } from 'express';
import { userVerifyMiddleware, createPasswordRateLimiter } from "../middlewares/userMiddlewares.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import express from 'express';
import crypto from 'crypto';
const { Router } = express;
const router = Router();

import { PrismaClient } from '@notes/db'
import { withAccelerate } from '@notes/db'
const prisma = new PrismaClient().$extends(withAccelerate())
export interface Env{
    DATABASE_URL: string
}

const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(process.env.ENCRYPTION_SECRET!, 'salt', 32);
const iv = crypto.randomBytes(16);

// Encrypt
function encrypt(text: string) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Decrypt
function decrypt(encryptedText: string) {
  const parts = encryptedText.split(':');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error('Invalid encrypted text format');
  }
  const [ivHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString();
}


router.post('/saveAPassword', userVerifyMiddleware ,createPasswordRateLimiter, async (req:Request, res:Response) => {
    const { title, username, password } = req.body;

    const saltRounds: number = parseInt(process.env.bcrypt_salt_rounds || "25");
    try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
        const userId = decoded.id;

        if(!userId){
            return res.status(401).json({ message: "Something missing!.." });
        }

    const encryptedPassword = encrypt(password);
    await prisma.password.create({
      data: {
        title,
        username,
        password: encryptedPassword,
        user: { connect: { id: userId } },
      },
    });

        res.send({message : "Password Saved Successfully!.."})
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create password', details: error });
    }
});

router.delete('/deleteAPassword', userVerifyMiddleware , async(req : Request, res : Response) => {
    const { id, title } = req.body;
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
    const userId = decoded.id;

    if(!id || !title || !userId){
        return res.status(401).json({message : "Something missing!.."});
    }
    try{
        await prisma.password.delete({
            where : {
                userId,
                id,
                title
            },
        })
        res.status(200).json({message : "Password Deleted Successfully!.."});
    }
    catch(err){
        res.status(404).json({message : "Error Occured", err});
    }
});

router.get('/allPasswords', userVerifyMiddleware, async(req: Request , res: Response) => {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
    const userId = decoded.id;
    
    if(!userId){
        return res.status(401).json({message : "Something missing!.."});
    }
    try{
    const allPasswords = await prisma.password.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    const decryptedPasswords = allPasswords.map((p: any) => ({
      ...p,
      password: decrypt(p.password),
    }));

    
    if (!allPasswords || allPasswords.length === 0) {
      return res.status(200).json({ message: 'No subjects found for this user' });
    }

    res.status(200).json({decryptedPasswords});
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch passwords' });
  }
});

export default router;