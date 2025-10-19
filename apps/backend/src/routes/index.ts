import { Router } from 'express';
import userRouter from '../controllers/user.js';
import noteRouter from '../controllers/notes.js';
import passwordRouter from '../controllers/password.js';

const router = Router();

router.use('/user', userRouter);
router.use('/note', noteRouter);
router.use('/password', passwordRouter);

export { router };
