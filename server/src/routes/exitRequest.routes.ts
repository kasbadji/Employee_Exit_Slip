import { Router } from 'express';
import { isTokenValid, authorizeRoles } from '../middleware/auth.middleware';
import {
    createExitRequest,
    getMyExitRequests,
    getManagerDashboard,
    getManagerRequests,
    decideOnRequest,
    getRequestDetails,
} from '../controllers/exitRequest.controller';

const router = Router();

//! ---------- Employee Routes ----------
router.post(
    '/',
    isTokenValid,
    authorizeRoles('EMPLOYEE', 'MANAGER', 'ADMIN'),
    createExitRequest
);

router.get(
    '/my',
    isTokenValid,
    authorizeRoles('EMPLOYEE', 'MANAGER', 'ADMIN'),
    getMyExitRequests
);

//! ---------- Manager Routes ----------
router.get(
    '/manager/dashboard',
    isTokenValid,
    authorizeRoles('MANAGER', 'ADMIN'),
    getManagerDashboard
);

router.get(
    '/manager/requests',
    isTokenValid,
    authorizeRoles('MANAGER', 'ADMIN'),
    getManagerRequests
);

router.get(
    '/manager/requests/:id',
    isTokenValid,
    authorizeRoles('MANAGER', 'ADMIN'),
    getRequestDetails
);

router.post(
    '/manager/:id/decide',
    isTokenValid,
    authorizeRoles('MANAGER', 'ADMIN'),
    decideOnRequest
);

export default router;
