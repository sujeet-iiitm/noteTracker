import { Request, Response } from 'express';
import { userVerifyMiddleware } from "../middlewares/userMiddlewares";
// import { PrismaClient } from '@repo/db'
// import { withAccelerate } from '@repo/db'
// const prisma = new PrismaClient().$extends(withAccelerate());
const jwt = require('jsonwebtoken');
const express = require('express');
const { Router } = express;
const router = Router();
import { prismaClient } from '@repo/db/client';

router.get('/allNotes' , userVerifyMiddleware, async (req:Request, res:Response) => {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const notes = await prismaClient.note.findMany({
        where: { userId: userId },
    });
    if(!notes || notes.length === 0) {
        return res.status(404).json({ error: 'No notes found for this user' });
    }
    return res.status(200).json(notes);
});

router.post('/createNote', userVerifyMiddleware, async(req:Request, res:Response) => {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { title, description, shortNote } = req.body;
    if(!title || !description){
        res.status(400).json({ error: 'Title and description are required' });
        return;
    }
    try{
        await prismaClient.note.create({
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
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { id, title, description, shortNote } = req.body;

    if(!title || !description){
        res.status(400).json({ error: 'Title and description are required' });
        return;
    }
    try{
        await prismaClient.note.update({
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
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { id } = req.body;

    try{
        await prismaClient.note.delete({
            where: { id: id, userId: userId },
        });
        res.status(200).json({message: 'Note deleted successfully'});
    }
    catch(error){
        res.status(500).json({ error: 'Failed to delete note' });
    }
});
module.exports = router;
export default router;

