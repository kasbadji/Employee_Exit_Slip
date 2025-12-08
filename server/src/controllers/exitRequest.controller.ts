import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as exitService from '../services/exitRequest.service';

//! ---------- Employee endpoints ----------
export async function createExitRequest(req: AuthRequest, res: Response) {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const { reason } = req.body;
        console.log('Received request body:', req.body);
        console.log('User:', req.user);

        if (!reason || typeof reason !== 'string') {
            return res.status(400).json({ message: 'Invalid reason' });
        }

        const exitRequest = await exitService.createExitRequest(req.user.id, {
            reason,
        });

        return res.status(201).json(exitRequest);
    }
    catch (err: any) {
        console.error('Error creating exit request:', err);
        console.error('Error stack:', err.stack);
        return res.status(500).json({ message: 'Internal server error', error: err.message });
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
    const { status, comment } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'status must be APPROVED or REJECTED' });
    }

    const updated = await exitService.decideOnRequest(
      req.user.id,
      requestId,
      status,
      comment
    );

    return res.json(updated);
  }
  catch (err) {
    console.error('decideOnRequest error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function getRequestDetails(req: AuthRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const request = await exitService.getRequestWithHistory(id);

    if(!request){
      return res.status(404).json({ message: 'Request not found' });
    }

    return res.json(request);
  }
  catch (err) {
    console.error('getRequestDetails error: ', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

//!---------- CSV file ----------
function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function exportManagerRequestsCsv(req: AuthRequest, res: Response) {
  try {
    const { status } = req.query;
    const valid = ['PENDING', 'APPROVED', 'REJECTED'];

    const s =
      typeof status === 'string' && valid.includes(status)
        ? (status as 'PENDING' | 'APPROVED' | 'REJECTED')
        : undefined;

    const requests = await exitService.getManagerRequestsForExport(s);

    const header = [
      'ID',
      'Name',
      'Email',
      'Reason',
      'Requested At',
      'Status',
    ];

    const rows = requests.map((r) => [
      r.id_request,
      r.employee?.full_name ?? '',
      r.employee?.email ?? '',
      r.reason,
      r.requestedAt.toISOString(),
      r.status,
    ]);

    const csv =
      [header.join(','), ...rows.map((row) => row.map(escapeCsv).join(','))].join(
        '\n'
      );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="exit_requests.csv"'
    );
    return res.send(csv);
  } catch (err) {
    console.error('exportManagerRequestsCsv error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
