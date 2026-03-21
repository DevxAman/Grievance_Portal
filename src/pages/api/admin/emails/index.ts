import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { connectToDatabase } from '@/lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const db = await connectToDatabase();
        const emails = await db.collection('emails').find({}).sort({ date: -1 }).toArray();
        
        return res.status(200).json(emails);
      } catch (error) {
        console.error('Error fetching emails:', error);
        return res.status(500).json({ message: 'Error fetching emails' });
      }
      
    case 'POST':
      // For future implementation if needed (e.g., sending emails)
      return res.status(501).json({ message: 'Not implemented yet' });
      
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
} 