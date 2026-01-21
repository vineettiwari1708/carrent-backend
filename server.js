import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './configs/db.js';
import userRouter from './routes/userRoutes.js';


//init express app
const app = express();

//connect DB
await connectDB();

//middleware
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => res.send('Server is running'));
app.use('/api/user', userRouter)

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Sever running on port ${PORT}`));
