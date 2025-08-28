import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser'
import { router as rootRouter } from './routes/index.js';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN, 
  credentials : true
}));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());



app.use('/api', rootRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
