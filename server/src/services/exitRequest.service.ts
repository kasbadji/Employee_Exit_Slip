import { prisma } from '../config/database';

export interface createExitRequestInput {
    reason: string;
}

//! ---------- Employee Side ----------
export async function createExitRequest(
    employeeId: number,
    data: createExitRequestInput
) {
    return await prisma.exitRequest.create({
        data: {
            employeeId,
            reason: data.reason,
        },
    });
}

export async function getMyExitRequests(employeeId: number) {
    return await prisma.exitRequest.findMany({
        where: {
            employeeId,
        },
        orderBy: {
            requestedAt: 'desc',
        },
    });
}

//! ---------- Manager Side ----------
export async function getManagerStats(){
    const [pending, approved, rejected] = await Promise.all([
        prisma.exitRequest.count({
            where: { status: 'PENDING' },
        }),
        prisma.exitRequest.count({
            where: { status: 'APPROVED' },
        }),
        prisma.exitRequest.count({
            where: { status: 'REJECTED' },
        }),
    ]);

    return {
        totalPending: pending,
        totalApproved: approved,
        totalRejected: rejected,
    };
}

export async function getManagerRequests(
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
) {
    return await prisma.exitRequest.findMany({
        where: status ? { status } : undefined,
        include: {
            employee: {
                select: {
                    id_user: true,
                    full_name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            requestedAt: 'desc',
        },
    });
}

export async function decideOnRequest(
    managerId: number,
    requestId: number,
    decision: 'APPROVED' | 'REJECTED'
) {
    return await prisma.exitRequest.update({
        where: {
            id_request: requestId,
        },
        data: {
            status: decision
        }
    });
}
