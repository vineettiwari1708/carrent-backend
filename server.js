import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './configs/db.js';
import userRouter from './routes/userRoutes.js';
import ownerRouter from './routes/ownerRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';


//init express app
const app = express();

//connect DB
await connectDB();

//middleware
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => res.send('Server is running, user, owner, image, api'));
app.use('/api/user', userRouter)
app.use('/api/owner', ownerRouter)
app.use('/api/bookings', bookingRouter)

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Sever running on port ${PORT}`));
