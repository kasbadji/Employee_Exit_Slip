import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as exitService from '../services/exitRequest.service';

//! ---------- Employee endpoints ----------
export async function createExitRequest(req: AuthRequest, res: Response) {
    try {
        if (!req.user) return res.sendStatus(401).json({ message: 'Unauthorized' });

        const { raison } = req.body;
        if (!raison || typeof raison !== 'string') {
            return res.status(400).json({ message: 'Invalid reason' });
        }

        const exitRequest = await exitService.createExitRequest(req.user.id, {
            reason: raison,
        });

        return res.status(201).json(exitRequest);
    }
    catch (err) {
        console.error('Error creating exit request:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getMyExitRequests(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const requests = await exitService.getMyExitRequests(req.user.id);
    return res.json(requests);
  } catch (err) {
    console.error('getMyExitRequests error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

//! ---------- Manager endpoints ----------

export async function getManagerDashboard(req: AuthRequest, res: Response) {
  try {
    const stats = await exitService.getManagerStats();
    return res.json(stats);

  }
  catch (err) {
    console.error('getManagerDashboard error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function getManagerRequests(req: AuthRequest, res: Response) {
  try {
    const { status } = req.query;
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];

    const s =
      typeof status === 'string' && validStatuses.includes(status)
        ? (status as 'PENDING' | 'APPROVED' | 'REJECTED')
        : undefined;

    const requests = await exitService.getManagerRequests(s);
    return res.json(requests);

  }
  catch (err) {
    console.error('getManagerRequests error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function decideOnRequest(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const requestId = Number(req.params.id);
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'status must be APPROVED or REJECTED' });
    }

    const updated = await exitService.decideOnRequest(
      req.user.id,
      requestId,
      status
    );

    return res.json(updated);
  }
  catch (err) {
    console.error('decideOnRequest error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
