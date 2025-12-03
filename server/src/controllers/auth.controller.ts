import * as authService from '../services/auth.service';
import { Request, Response } from 'express';

//! -----------------Register Controller------------------
export const register = async (req: Request, res: Response) => {
    try {
        const { email, full_name, password, role } = req.body;

        const data = await authService.user_register(
            email,
            full_name,
            password,
            role
        );
        res.status(201).json(data);
    }
    catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

//! -----------------Login Controller------------------
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const data = await authService.user_login(
            email,
            password
        );
        res.status(200).json({
            message: 'Login successful',
            data,
        });
    }
    catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

