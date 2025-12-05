import * as authService from '../services/auth.service';
import { Request, Response } from 'express';
import { AuthRequest } from '..//middleware/auth.middleware';
import { prisma } from '../config/database';

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

        console.log('Login attempt:', { email, passwordLength: password?.length });

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
        console.error('Login error:', error.message);
        res.status(400).json({ message: error.message });
    }
};

//! -----------------Me Controller------------------
export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id_user: req.user.id },
      select: {
        id_user: true,
        email: true,
        full_name: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      user: {
        id: user.id_user,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('me error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
