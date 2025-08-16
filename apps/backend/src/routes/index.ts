const express = require('express');
const app = express();

const userRouter = require('../controllers/user.js');
const noteRouter = require('../controllers/notes.js');

app.use('/user', userRouter);
app.use('/note', noteRouter);