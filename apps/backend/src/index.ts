import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import { router as rootRouter } from './routes/index.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: false }));

app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use('/api', rootRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
