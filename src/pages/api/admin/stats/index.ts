import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { connectToDatabase } from '@/lib/db';

/**
 * Simple API endpoint to get stats for admin dashboard
 * 
 * GET /api/admin/stats
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify user is authenticated and has admin role
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Connect to the database
    const db = await connectToDatabase();
    
    // Get count of unread emails
    const unreadEmailsCount = await db.collection('emails').countDocuments({
      isRead: false
    });
    
    // Get count of unresolved grievances
    const unresolvedGrievancesCount = await db.collection('grievances').countDocuments({
      status: { $ne: 'resolved' }
    });
    
    // Get count of grievances by status
    const grievancesByStatus = await db.collection('grievances').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    // Format the status counts into a more usable structure
    const statusCounts = {};
    grievancesByStatus.forEach(item => {
      statusCounts[item._id || 'unspecified'] = item.count;
    });
    
    // Get total users count
    const usersCount = await db.collection('users').countDocuments({});
    
    // Get recent activity
    const recentActivity = await db.collection('activityLogs')
      .find({})
      .sort({ timestamp: -1 })
      .limit(5)
      .toArray();
    
    // Return the statistics
    return res.status(200).json({
      unreadEmails: unreadEmailsCount,
      unresolvedGrievances: unresolvedGrievancesCount,
      grievancesByStatus: statusCounts,
      usersCount,
      recentActivity
    });
    
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 