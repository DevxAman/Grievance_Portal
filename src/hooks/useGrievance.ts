import { useContext } from 'react';
import { GrievanceContext } from '../contexts/GrievanceContext';

export const useGrievance = () => {
  const context = useContext(GrievanceContext);
  
  if (context === undefined) {
    throw new Error('useGrievance must be used within a GrievanceProvider');
  }
  
  return context;
}; 