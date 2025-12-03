//! -----------------Imports------------------
import type { Role } from '../../generated/prisma/client';
import { prisma } from '../config/database';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';

//! -----------------JWT------------------
const JWT_SECRET: Secret = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN: SignOptions['expiresIn'] = (process.env.JWT_EXPIRES_IN as unknown as SignOptions['expiresIn']) || '1h';

//! -----------------Register Function------------------
export const user_register = async (email: string, full_name: string, password: string, role: Role) => {
    const isUserExists = await prisma.user.findUnique({
        where: { email }
    });
    if (isUserExists) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data: {
            email,
            full_name,
            password: hashedPassword,
            role,
        },
    });

    const token = jwt.sign(
        { id: newUser.id_user, role: newUser.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
    return { token, user: newUser };
};

//! -----------------Login Function------------------
export const user_login = async (email: string, password: string) => {
    const findUser = await prisma.user.findUnique({
        where: { email }
    });
    if (!findUser) {
        throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, findUser.password);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
        { id: findUser.id_user, role: findUser.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
    return { token, user: findUser };
}
