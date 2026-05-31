import React, { useState, useEffect } from 'react';
import { FileUp, AlertTriangle } from 'lucide-react';

interface GrievanceFormProps {
  onSubmit: (formData: FormData) => void;
}

const GrievanceForm: React.FC<GrievanceFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'academic',
    description: '',
  });
  
  const [files, setFiles] = useState<FileList | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset form when component key changes
  useEffect(() => {
    setFormData({
      title: '',
      category: 'academic',
      description: '',
    });
    setFiles(null);
    setErrors({});
    
    // Reset file input if it exists
    const fileInput = document.getElementById('documents') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }, []);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Description should be at least 50 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create form data object to send to server
      const submissionData = new FormData();
      submissionData.append('title', formData.title);
      submissionData.append('category', formData.category);
      submissionData.append('description', formData.description);
      
      // Append files if any
      if (files) {
        for (let i = 0; i < files.length; i++) {
          submissionData.append('documents', files[i]);
        }
      }
      
      // Call the onSubmit prop with the form data
      onSubmit(submissionData);
      
      // Reset form after submission
      setFormData({
        title: '',
        category: 'academic',
        description: '',
      });
      setFiles(null);
      
      // Reset file input
      const fileInput = document.getElementById('documents') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error submitting grievance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">File a New Grievance</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Grievance Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Brief title of your grievance"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="academic">Academic Issues</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="administrative">Administrative</option>
            <option value="financial">Financial Matters</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            placeholder="Provide detailed information about your grievance..."
          ></textarea>
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          <p className="mt-1 text-sm text-gray-500">Minimum 50 characters required.</p>
        </div>
        
        <div>
          <label htmlFor="documents" className="block text-sm font-medium text-gray-700 mb-1">
            Supporting Documents (Optional)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <FileUp className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="documents"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                >
                  <span>Upload files</span>
                  <input
                    id="documents"
                    name="documents"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, PDF up to 10MB each (maximum 5 files)
              </p>
              {files && files.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-700">{files.length} file(s) selected</p>
                  <ul className="mt-1 text-xs text-left text-gray-500 max-h-24 overflow-y-auto">
                    {Array.from(files).map((file, index) => (
                      <li key={index} className="truncate">
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Important notice</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  By submitting this grievance, you confirm that all information provided is true to the best of your knowledge.
                  False complaints may lead to disciplinary action as per college regulations.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            I agree to the terms and conditions and confirm that the information provided is accurate.
          </label>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Grievance'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GrievanceForm;