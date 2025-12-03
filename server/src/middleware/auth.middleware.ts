import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

//! type definition, without ts error
export interface AuthRequest extends Request {
    user?: any;
}

const JWT_SECRET = process.env.JWT_SECRET as string;

//! -----------------Token Validation Functions------------------
export const isTokenValid = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
             message: 'No token provided'
        });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        return res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
}

//! -----------------Role Authorization Function------------------
export const authorizeRoles = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user?.role)) {
            return res.status(403).json({
                message: 'Forbidden: You do not have the required permissions'
            });
        }
        next();
    };
};
