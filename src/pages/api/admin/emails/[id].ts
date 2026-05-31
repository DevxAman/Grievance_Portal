import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { method } = req;
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Valid email ID is required' });
  }

  try {
    const db = await connectToDatabase();
    const emailsCollection = db.collection('emails');
    let objectId;
    
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid email ID format' });
    }

    switch (method) {
      case 'GET':
        const email = await emailsCollection.findOne({ _id: objectId });
        
        if (!email) {
          return res.status(404).json({ message: 'Email not found' });
        }
        
        return res.status(200).json(email);
        
      case 'PATCH':
        const { operation } = req.body;
        
        if (!operation) {
          return res.status(400).json({ message: 'Operation is required' });
        }
        
        let updateResult;
        
        switch (operation) {
          case 'markAsRead':
            updateResult = await emailsCollection.updateOne(
              { _id: objectId },
              { $set: { isRead: true } }
            );
            break;
            
          case 'markAsUnread':
            updateResult = await emailsCollection.updateOne(
              { _id: objectId },
              { $set: { isRead: false } }
            );
            break;
            
          case 'toggleStar':
            // First get the current star status
            const currentEmail = await emailsCollection.findOne({ _id: objectId });
            if (!currentEmail) {
              return res.status(404).json({ message: 'Email not found' });
            }
            
            updateResult = await emailsCollection.updateOne(
              { _id: objectId },
              { $set: { isStarred: !currentEmail.isStarred } }
            );
            break;
            
          default:
            return res.status(400).json({ message: 'Invalid operation' });
        }
        
        if (updateResult.modifiedCount === 0) {
          return res.status(404).json({ message: 'Email not found or not modified' });
        }
        
        return res.status(200).json({ message: 'Email updated successfully' });
        
      case 'DELETE':
        const deleteResult = await emailsCollection.deleteOne({ _id: objectId });
        
        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ message: 'Email not found' });
        }
        
        return res.status(200).json({ message: 'Email deleted successfully' });
        
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error(`Error processing email operation:`, error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 