import { Router } from 'express';
import userRouter from '../controllers/user.js';
import noteRouter from '../controllers/notes.js';

const router = Router();

router.use('/user', userRouter);
router.use('/note', noteRouter);

export { router };
