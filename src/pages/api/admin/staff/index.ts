import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { connectToDatabase } from '@/lib/db';

/**
 * Simple API endpoint to get a list of staff members
 * 
 * GET /api/admin/staff
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
    const usersCollection = db.collection('users');
    
    // Get all users with role "staff" or specific roles that can handle grievances
    const staffMembers = await usersCollection.find({
      $or: [
        { role: 'staff' },
        { role: 'dsw' },  // Dean of Student Welfare
        { role: 'hod' }   // Head of Department
      ]
    }).project({
      _id: 1,
      name: 1,
      email: 1,
      role: 1,
      department: 1
    }).toArray();
    
    // Transform the data to be more frontend-friendly
    const formattedStaff = staffMembers.map(staff => ({
      id: staff._id.toString(),
      name: staff.name,
      email: staff.email,
      role: staff.role,
      department: staff.department || 'Not specified'
    }));
    
    // Return the staff list
    return res.status(200).json(formattedStaff);
    
  } catch (error) {
    console.error('Error fetching staff members:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 