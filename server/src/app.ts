import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes';
dotenv.config();

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);

export default app;
