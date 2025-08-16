import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
const rootRouter = require('./routes/index.js');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api',rootRouter)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
