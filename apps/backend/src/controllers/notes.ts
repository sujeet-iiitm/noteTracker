import { Request, Response } from 'express';
import { userVerifyMiddleware } from "../middlewares/userMiddlewares.js";
import dotenv from 'dotenv';
dotenv.config();
// import { prisma } from '@repo/db'
// import { withAccelerate } from '@repo/db'
// const prisma = new prisma().$extends(withAccelerate());
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Router } from 'express';
const router = Router();
import { prisma } from '@notes/db';
import { 
  startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, 
  startOfYear, endOfYear 
} from "date-fns";


router.post('/createNote', userVerifyMiddleware, async(req:Request, res:Response) => {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
    const userId = decoded.id;
    const { title, description, shortNote } = req.body;
    if(!title || !description){
        res.status(400).json({ error: 'Title and description are required' });
        return;
    }
    try{
        await prisma.note.create({
            data: {
                title: title,
                description: description,
                shortNote: shortNote,
                userId: userId,
            },
        });
        res.status(200).json({message: 'User created successfully'});
    }
    catch(error){
        res.status(500).json({ error: 'Failed to create note' });
    }
});

router.put('/updateNote', userVerifyMiddleware, async(req:Request, res:Response) => {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
    const userId = decoded.id;
    const { id, title, description, shortNote } = req.body;

    if(!title || !description){
        res.status(400).json({ error: 'Title and description are required' });
        return;
    }
    try{
        await prisma.note.update({
            where: { id: id, userId: userId },
            data: {
                title: title,
                description: description,
                shortNote: shortNote,
            },
        });
        res.status(200).json({message: 'Note updated successfully'});
    }
    catch(error){
        res.status(500).json({ error: 'Failed to update note' });
    }
});

router.delete('/deleteNote', userVerifyMiddleware, async(req:Request, res:Response) => {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
    const userId = decoded.id;
    const { id } = req.body;

    try{
        await prisma.note.delete({
            where: { id: id, userId: userId },
        });
        res.status(200).json({message: 'Note deleted successfully'});
    }
    catch(error){
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

router.get('/allNotes' , userVerifyMiddleware, async (req:Request, res:Response) => {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
    const userId = decoded.id;
if (!process.env.JWT_SECRET) {
throw new Error("JWT_SECRET is not defined in environment variables");
}
try{
const notes = await prisma.note.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' }  
});
if(!notes || notes.length === 0) {
    return res.status(200).json({ message: 'No notes found for this user' });
}
return res.status(200).json({notes});
}catch(error){
    return res.status(401).send({error: "Error Occuered while fetching!..."})
}
});

router.get("/weeklyNotes", async (req: Request, res: Response) => {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
    const userId = decoded.id;
  try {
    const now = new Date();
    const notes = await prisma.note.findMany({
      where: { userId :userId,
        createdAt: {
          gte: startOfWeek(now, { weekStartsOn: 1 }), //1 : monday
          lte: endOfWeek(now, { weekStartsOn: 1 }),
        },
      },
    });
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch weekly notes" });
  }
});

router.get("/monthlyNotes", async (req: Request, res: Response) => {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
    const userId = decoded.id;
  try {
    const now = new Date();
    const notes = await prisma.note.findMany({
      where: { userId : userId,
        createdAt: {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        },
      },
    });
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch monthly notes" });
  }
});

router.get("/yearlyNotes", async (req: Request, res: Response) => {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
    const userId = decoded.id;
  try {
    const now = new Date();
    const notes = await prisma.note.findMany({
      where: { userId : userId,
        createdAt: {
          gte: startOfYear(now),
          lte: endOfYear(now),
        },
      },
    });
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch yearly notes" });
  }
});
export default router;