import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

/** GET /api/reports/collections */
export async function getCollectionsReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const collections = await prisma.collection.findMany({
      select: { format: true },
    });

    const formatCounts = collections.reduce((acc: Record<string, number>, c) => {
      acc[c.format] = (acc[c.format] || 0) + 1;
      return acc;
    }, {});

    const formatData = Object.entries(formatCounts).map(([name, value]) => ({ name, value }));
    res.json({ success: true, data: { formatData } });
  } catch (err) {
    next(err);
  }
}

/** GET /api/reports/borrowings */
export async function getBorrowingsReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const borrowings = await prisma.borrowing.findMany({
      select: { status: true, fineAmount: true, borrowDate: true },
    });

    const totalBorrowed = borrowings.length;
    const totalReturned = borrowings.filter(b => b.status === 'dikembalikan').length;
    const totalOverdue = borrowings.filter(b => b.status === 'terlambat').length;
    const totalFines = borrowings.reduce((sum, b) => sum + Number(b.fineAmount), 0);

    // Monthly trend last 6 months
    const now = new Date();
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = borrowings.filter(b => {
        const d = new Date(b.borrowDate);
        return d >= month && d < nextMonth;
      }).length;
      monthly.push({
        month: month.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        count,
      });
    }

    res.json({
      success: true,
      data: { totalBorrowed, totalReturned, totalOverdue, totalFines, monthly },
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/reports/knowledges */
export async function getKnowledgesReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const knowledges = await prisma.knowledge.findMany({
      select: { type: true, status: true },
    });

    const typeCounts = knowledges.reduce((acc: Record<string, number>, k) => {
      acc[k.type] = (acc[k.type] || 0) + 1;
      return acc;
    }, {});

    const statusCounts = knowledges.reduce((acc: Record<string, number>, k) => {
      acc[k.status] = (acc[k.status] || 0) + 1;
      return acc;
    }, {});

    const typeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    res.json({ success: true, data: { typeData, statusData } });
  } catch (err) {
    next(err);
  }
}
