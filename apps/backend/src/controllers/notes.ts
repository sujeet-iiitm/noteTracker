import dotenv from 'dotenv';
dotenv.config();
import type { Request, Response } from 'express';
import { userVerifyMiddleware } from "../middlewares/userMiddlewares.js";
import { PrismaClient } from '@notes/db'
import { withAccelerate } from '@notes/db'
import { nanoid } from 'nanoid';
const prisma = new PrismaClient().$extends(withAccelerate())
import jwt, {type JwtPayload } from 'jsonwebtoken';
import { Router } from 'express';
const router = Router();
import { 
  startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, 
  startOfYear, endOfYear,
  startOfDay , endOfDay,
  addDays,
} from "date-fns";

const now = new Date();
const todayStart = startOfDay(now);
const todayEnd = endOfDay(now);

router.post('/createNote', userVerifyMiddleware, async(req:Request, res:Response) => {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
    const userId = decoded.id;
    const { title, description, shortNote } = req.body;
    if(!title || !description){
        res.status(400).json({ error: 'Title and description are required' });
        return;
    }
    const notesCount = await prisma.note.count({
      where:{
        userId : userId,
        createdAt : {
          gte : todayStart,
          lte : todayEnd,
        }
      }
    })

    if(notesCount>=100){
      return res.status(200).json({message : "100 notes/Day limits reached. ComeTomorrow again!.."})
    }
    try{
        await prisma.note.create({
            data: {
                title: title,
                description: description,
                shortNote: shortNote,
                userId: userId,
                expiryTime : now,
            },
        });
        res.status(200).json({message: 'Note created successfully'});
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
res.status(200).json(notes);
}catch(error){
    return res.status(401).send({error: "Error Occuered while fetching!..."})
}
});

router.get("/weeklyNotes", userVerifyMiddleware ,async(req: Request, res: Response) => {
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

router.get("/monthlyNotes", userVerifyMiddleware ,async(req: Request, res: Response) => {
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

router.get("/yearlyNotes", userVerifyMiddleware, async(req: Request, res: Response) => {
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

router.post("/shareANote", userVerifyMiddleware, async(req: Request, res: Response) => {
  const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
  const userId = decoded.id;
  const { id } = req.body;
  const slug = nanoid(32);
  const now = new Date();
  const expiry = addDays(now, 3);
  if (!id) {
    return res.status(400).json({ error: "Note ID not Found" });
  }
  const note = await prisma.note.findUnique({
    where: { userId: userId, id: id }
  });
  
try{  
  await prisma.note.update({
    where: { id : id },
    data: {
      isShared : true,
      shareSlug : slug,
      expiryTime : expiry
    }
  });
return  res.status(200).json({link : `http://localhost:5173/note/viewNote/${slug}`});
}catch(err){
  res.status(404).json({message : "Error Occured While creating the Share-URL, pls. try again"});
}
});

router.get("/viewNote/:slug", async(req: Request, res: Response) => {
  const noteId = req.params.slug;
  const now = new Date();

  if (!noteId) {
    return res.status(400).json({ error: "Note ID is required and must be a string." });
  }
  const note = await prisma.note.findUnique({
    where: { shareSlug : noteId }
  });
    if (!note || !note.isShared) {
  return res.status(410).send("Note not Found");
  }
    if(now>=note.expiryTime){
    return res.status(410).send("Link Expired, Tell you friend to reShare");
  }
    if(now>=note.expiryTime && note.isShared){
  await prisma.note.update({
    where: { shareSlug : noteId },
    data: {
      isShared : false,
      shareSlug : null
    }
    });
  }
  return res.status(200).json({title : `${note?.title}`,
    description : `${note?.description}`,
    ShortNote : `${note?.shortNote}`,
    createdAt : `${note?.createdAt}`,
    expiryTime : `${note?.expiryTime}`
  });
});

export default router;