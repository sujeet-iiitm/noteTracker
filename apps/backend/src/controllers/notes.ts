import dotenv from 'dotenv';
dotenv.config();
import type { Request, Response } from 'express';
import { userVerifyMiddleware } from "../middlewares/userMiddlewares.js";
import { PrismaClient } from '@notes/db'
import { withAccelerate } from '@notes/db'
import { nanoid } from 'nanoid';
const prisma = new PrismaClient().$extends(withAccelerate())
import jwt, {type JwtPayload } from 'jsonwebtoken';
import { response, Router } from 'express';
const router = Router();
import { 
  startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, 
  startOfYear, endOfYear,
  startOfDay , endOfDay,
  addDays,
} from "date-fns";
import { request } from 'http';
import { gte } from 'zod';

const now = new Date();
const todayStart = startOfDay(now);
const todayEnd = endOfDay(now);

router.post('/createSubject', userVerifyMiddleware, async (req: Request, res: Response) => {
  const userId = (jwt.verify(req.cookies.token, process.env.JWT_SECRET!) as JwtPayload).id;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const existing = await prisma.subject.findFirst({
      where: {
        userId,
        title: title.trim(),
      },
    });

    if (existing) {
      return res.status(409).json({ message: 'Subject already exists' });
    }

    const subject = await prisma.subject.create({
      data: {
        title: title.trim(),
        userId,
      },
    });

    return res.status(201).json({ message: 'Subject created successfully', subject });
  } catch (error) {
    console.error("Create Subject Error:", error);
    return res.status(500).json({ error: 'Failed to create subject' });
  }
});

router.put('/updateSubject', userVerifyMiddleware ,async (req: Request, res: Response) => {
  const userId = (jwt.verify(req.cookies.token, process.env.JWT_SECRET!) as JwtPayload).id;
  const { subjectId, newTitle } = req.body;
  console.log(subjectId)

  if (!subjectId || !newTitle) {
    return res.status(400).json({ error: 'Missing subjectId or newTitle' });
  }

  try {
    const updatedSubject = await prisma.subject.update({
      where: { id : subjectId, userId : userId },
      data: { title: newTitle },
    });

    res.status(200).json({ message: 'Subject updated successfully', subject: updatedSubject });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ error: 'Failed to update subject' });
  }
});


router.delete('/deleteSubject', userVerifyMiddleware ,async (req: Request, res: Response) => {
  const userId = (jwt.verify(req.cookies.token, process.env.JWT_SECRET!) as JwtPayload).id;
  const subjectId = req.body.subjectId;
  console.log(subjectId)

  if (!subjectId) {
    return res.status(400).json({ error: 'Missing subjectId' });
  }

  try {
    await prisma.subject.delete({
      where: {
         id: subjectId,
         userId,
        },
    });

    res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

router.get('/allSubjects', userVerifyMiddleware, async (req: Request, res: Response) => {
  const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
  const userId = decoded.id;

  try {
    const subjects = await prisma.subject.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!subjects || subjects.length === 0) {
      return res.status(200).json({ message: 'No subjects found for this user' });
    }

    res.status(200).json({subjects});
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});


router.post('/createNote/:subjectId', userVerifyMiddleware, async(req:Request, res:Response) => {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
    const userId = decoded.id;
    const { title, description, shortNote } = req.body;
    const subjectId = req.params.subjectId;
    if(!title || !description || !subjectId){
        res.status(400).json({ error: 'Title and description are required' });
        return;
    }
    const subjectExists = await prisma.subject.findUnique({
    where: { id: subjectId },
    });

    if (!subjectExists) {
      return res.status(404).json({ error: 'Subject not found. Cannot create note.' });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const notesCountToday = await prisma.note.count({
      where: {
        subject: {  
          userId: userId
        },
        createdAt: {
          gte: startOfToday,
          lte: endOfToday
        }
      }
    });

    if(notesCountToday>=100){
      return res.status(200).json({message : "100 notes/Day limits reached. ComeTomorrow again!.."})
    }
    try{
        const note = await prisma.note.create({
            data: {
                title: title,
                description: description,
                shortNote: shortNote,
                subjectId: subjectId,
                expiryTime : now,
            },
        });
        res.status(200).json({message: 'Note created successfully',note});
    }
    catch(error){
      res.status(500).json({ error: 'Failed to create note' });
    }
});

router.put('/updateNote/:subjectId/:noteId', userVerifyMiddleware, async (req: Request, res: Response) => {
  const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
  const userId = decoded.id;
  const { title, description, shortNote } = req.body;
  const { subjectId, noteId } = req.params;

  if (!title || !description || !subjectId || !noteId) {
    return res.status(400).json({ error: 'Title and description are required' });
  }
  try {
    if (typeof subjectId !== 'string' || typeof noteId !=='string') {
      return res.status(400).json({ error: 'Invalid subjectId' });
    }
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        userId: userId,
      },
    });

    if (!subject) {
      return res.status(403).json({ error: 'Unauthorized: Subject not found or not owned by user' });
    }

    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        subjectId: subjectId,
      },
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found under this subject' });
    }

    await prisma.note.update({
      where: { id: noteId },
      data: {
        title,
        description,
        shortNote,
      },
    });

    res.status(200).json({ message: 'Note updated successfully' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

router.get('/subject/:subjectId/notes', userVerifyMiddleware, async (req: Request, res: Response) => {
  const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
  const userId = decoded.id;
  const { subjectId } = req.params;

  try {
    if (typeof subjectId !== 'string' || typeof userId !=='string') {
      return res.status(400).json({ error: 'Invalid subjectId' });
    }
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        userId: userId,
      },
    });

    if (!subject) {
      return res.status(403).json({ error: 'Unauthorized: Subject not found or not owned by user' });
    }

    const notes = await prisma.note.findMany({
      where: { subjectId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes for this subject' });
  }
});


router.delete('/deleteNote/:subjectId/:noteId', userVerifyMiddleware, async (req: Request, res: Response) => {
  const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
  const userId = decoded.id;
  const { subjectId, noteId } = req.params;

  try {
    if (typeof subjectId !== 'string' || typeof noteId !=='string') {
      return res.status(400).json({ error: 'Invalid subjectId' });
    }
    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        userId: userId,
      },
    });

    if (!subject) {
      return res.status(403).json({ error: 'Unauthorized: Subject not found or not owned by user' });
    }

    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        subjectId: subjectId,
      },
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found under this subject' });
    }

    await prisma.note.delete({
      where: { id: noteId },
    });

    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});


router.get('/allNotes', userVerifyMiddleware, async (req: Request, res: Response) => {
  const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
  const userId = decoded.id;

  try {
    const notes = await prisma.note.findMany({
      where: {
        subject: {
          userId: userId
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!notes || notes.length === 0) {
      return res.status(200).json({ message: 'No notes found for this user' });
    }

    res.status(200).json(notes);
  } catch (error) {
    return res.status(500).json({ error: 'Error occurred while fetching notes' });
  }
});


router.get('/weeklyNotes', userVerifyMiddleware, async (req: Request, res: Response) => {
  const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
  const userId = decoded.id;

  try {
    const now = new Date();
    const notes = await prisma.note.findMany({
      where: {
        subject: { userId },
        createdAt: {
          gte: startOfWeek(now, { weekStartsOn: 1 }),
          lte: endOfWeek(now, { weekStartsOn: 1 }),
        },
      },
    });

    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weekly notes' });
  }
});


router.get('/monthlyNotes', userVerifyMiddleware, async (req: Request, res: Response) => {
  const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
  const userId = decoded.id;

  try {
    const now = new Date();
    const notes = await prisma.note.findMany({
      where: {
        subject: { userId },
        createdAt: {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        },
      },
    });

    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch monthly notes' });
  }
});


router.get('/yearlyNotes', userVerifyMiddleware, async (req: Request, res: Response) => {
  const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
  const userId = decoded.id;

  try {
    const now = new Date();
    const notes = await prisma.note.findMany({
      where: {
        subject: { userId },
        createdAt: {
          gte: startOfYear(now),
          lte: endOfYear(now),
        },
      },
    });

    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch yearly notes' });
  }
});


router.post('/shareANote', userVerifyMiddleware, async (req: Request, res: Response) => {
  const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string) as JwtPayload;
  const userId = decoded.id;
  const { id } = req.body;
  const slug = nanoid(32);
  const expiry = addDays(new Date(), 3);

  if (!id) {
    return res.status(400).json({ error: 'Note ID not found' });
  }

  const note = await prisma.note.findFirst({
    where: {
      id,
      subject: {
        userId
      }
    }
  });

  if (!note) {
    return res.status(403).json({ error: 'Unauthorized or note not found' });
  }

  try {
    await prisma.note.update({
      where: { id },
      data: {
        isShared: true,
        shareSlug: slug,
        expiryTime: expiry
      }
    });

    return res.status(200).json({ link: `https://notetracker.sujeet.xyz/note/viewNote/${slug}` });
  } catch (err) {
    res.status(500).json({ message: 'Error occurred while creating the share URL. Please try again.' });
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