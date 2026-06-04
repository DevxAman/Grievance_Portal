import React, { useState, useEffect } from 'react';
import { FileUp, AlertTriangle, Send, Tag, FileText } from 'lucide-react';

interface GrievanceFormProps {
  onSubmit: (formData: FormData) => Promise<void> | void;
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

  const MAX_FILES = 5;
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const allowedFileTypes = ['image/png', 'image/jpeg', 'application/pdf'];
  
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
  
  const validateFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return '';

    if (selectedFiles.length > MAX_FILES) {
      return `You can upload a maximum of ${MAX_FILES} files.`;
    }

    const invalidFile = Array.from(selectedFiles).find(
      (file) => !allowedFileTypes.includes(file.type)
    );
    if (invalidFile) {
      return 'Only PNG, JPG, JPEG, and PDF files are allowed.';
    }

    const oversizedFile = Array.from(selectedFiles).find(
      (file) => file.size > MAX_FILE_SIZE
    );
    if (oversizedFile) {
      return 'Each file must be 10MB or smaller.';
    }

    return '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    const fileError = validateFiles(selectedFiles);

    setErrors((currentErrors) => ({
      ...currentErrors,
      documents: fileError,
    }));

    if (fileError) {
      setFiles(null);
      e.target.value = '';
      return;
    }

    setFiles(selectedFiles && selectedFiles.length > 0 ? selectedFiles : null);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const selectedFiles = e.dataTransfer.files;
    const fileError = validateFiles(selectedFiles);

    setErrors((currentErrors) => ({
      ...currentErrors,
      documents: fileError,
    }));

    if (fileError) {
      setFiles(null);
      return;
    }

    setFiles(selectedFiles && selectedFiles.length > 0 ? selectedFiles : null);
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

    const fileError = validateFiles(files);
    if (fileError) {
      newErrors.documents = fileError;
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
      await onSubmit(submissionData);
      
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
    <div className="surface-card w-full p-6 sm:p-8">
      <div className="mb-7 border-b border-slate-100 pb-5">
        <span className="page-kicker">Secure submission</span>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950">Tell us what happened</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Add a clear title, choose the closest category, and describe the issue with enough detail for the right team to act.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="form-label">
            <FileText className="h-4 w-4 text-blue-600" />
            Grievance Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className={`form-input ${
              errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''
            }`}
            placeholder="Brief title of your grievance"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>
        
        <div>
          <label htmlFor="category" className="form-label">
            <Tag className="h-4 w-4 text-blue-600" />
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="form-input"
          >
            <option value="academic">Academic Issues</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="administrative">Administrative</option>
            <option value="financial">Financial Matters</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="description" className="form-label">
            <FileText className="h-4 w-4 text-blue-600" />
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            value={formData.description}
            onChange={handleChange}
            className={`form-input min-h-[180px] resize-y ${
              errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''
            }`}
            placeholder="Provide detailed information about your grievance..."
          ></textarea>
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          <p className="mt-2 text-sm text-slate-500">Minimum 50 characters required.</p>
        </div>
        
        <div>
          <label htmlFor="documents" className="form-label">
            <FileUp className="h-4 w-4 text-blue-600" />
            Supporting Documents (Optional)
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className={`mt-2 flex justify-center rounded-2xl border-2 border-dashed px-6 pb-6 pt-5 transition-colors ${
              errors.documents
                ? 'border-red-300 bg-red-50'
                : 'border-blue-200 bg-blue-50/50 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <div className="space-y-1 text-center">
              <FileUp className="mx-auto h-12 w-12 text-blue-500" />
              <div className="flex justify-center text-sm text-slate-600">
                <label
                  htmlFor="documents"
                  className="relative cursor-pointer rounded-md font-bold text-blue-700 hover:text-blue-600 focus-within:outline-none"
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
              <p className="text-xs text-slate-500">
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
          {errors.documents && <p className="mt-2 text-sm text-red-600">{errors.documents}</p>}
        </div>
        
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
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
            className="btn-primary w-full py-3.5 text-base"
          >
            {isSubmitting ? 'Submitting...' : (
              <>
                <Send className="h-4 w-4" />
                Submit Grievance
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GrievanceForm;
