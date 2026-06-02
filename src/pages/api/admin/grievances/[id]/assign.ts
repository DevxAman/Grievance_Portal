import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

/**
 * Simple API endpoint to assign a grievance to a staff member
 * 
 * PATCH /api/admin/grievances/[id]/assign
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow PATCH method
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify user is authenticated and has admin role
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Get grievance ID from route parameter
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Valid grievance ID is required' });
  }

  // Get staff ID from request body
  const { staffId } = req.body;
  if (!staffId || typeof staffId !== 'string') {
    return res.status(400).json({ message: 'Valid staff ID is required' });
  }

  try {
    // Connect to the database
    const db = await connectToDatabase();
    const grievancesCollection = db.collection('grievances');
    
    // Create ObjectId from string ID
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid grievance ID format' });
    }

    // Update the grievance with the assigned staff
    const updateResult = await grievancesCollection.updateOne(
      { _id: objectId },
      { 
        $set: { 
          assignedTo: staffId,
          assignedAt: new Date(),
          assignedBy: session.user.id,
          status: 'assigned'
        } 
      }
    );
    
    // Check if grievance was found and updated
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: 'Grievance not found' });
    }
    
    // If grievance was updated successfully
    return res.status(200).json({ 
      message: 'Grievance assigned successfully',
      staffId: staffId
    });
    
  } catch (error) {
    console.error('Error assigning grievance:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 