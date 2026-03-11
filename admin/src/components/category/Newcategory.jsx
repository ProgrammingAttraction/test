import React, { useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Header from '../common/Header';
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const Newcategory = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const fileInputRef = useRef(null);
  const navigate = useNavigate(); // For navigation after successful submission
  
  const [formData, setFormData] = useState({
    name: '',
    image: null
  });
  
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate image type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 2 * 1024 * 1024; // 2MB
      
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          image: 'Only JPG, PNG, GIF, or WebP images are allowed'
        });
        return;
      }
      
      if (file.size > maxSize) {
        setErrors({
          ...errors,
          image: 'Image size should be less than 2MB'
        });
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
      
      setFormData({
        ...formData,
        image: file
      });
      
      // Clear error if validation passes
      if (errors.image) {
        setErrors({
          ...errors,
          image: null
        });
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Category name cannot exceed 50 characters';
    }
    
    if (!formData.image) {
      newErrors.image = 'Image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('image', formData.image);
      
      // Add auth token if needed (uncomment if your API requires authentication)
      // const token = localStorage.getItem('authToken');
      // const config = {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //     'Authorization': `Bearer ${token}`
      //   }
      // };
      
      const response = await axios.post(`${base_url}/admin/categories`, data, {
        headers: {
             "Content-Type": "multipart/form-data",
             'Authorization': localStorage.getItem('genzz_token')
            },
      });
      
      toast.success('Category created successfully!');
      
      // Reset form after successful submission
      setFormData({
        name: '',
        image: null
      });
      setPreviewImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error creating category:', error);
      
      let errorMessage = 'Failed to create category';
      if (error.response) {
        // Handle different error statuses
        if (error.response.status === 400) {
          errorMessage = error.response.data.message || 'Validation error';
        } else if (error.response.status === 401) {
          errorMessage = 'Unauthorized - Please login again';
        } else if (error.response.status === 409) {
          errorMessage = 'Category with this name already exists';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full font-bai">
      <Header />
      <Toaster />
      <section className="p-4 w-full mx-auto">
        <div className="bg-white rounded-lg border-[1px] border-gray-200 p-6">
          <h1 className="text-2xl text-gray-700 font-bold mb-6">Add New Category</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border text-gray-700 rounded-md ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                placeholder="Enter category name"
                maxLength={50}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.name.length}/50 characters
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Image *
              </label>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/jpeg, image/png, image/gif, image/webp"
                className="hidden"
              />
              
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Choose Image
                </button>
                
                {formData.image && (
                  <span className="text-sm text-gray-600 truncate max-w-xs">
                    {formData.image.name}
                  </span>
                )}
              </div>
              
              {errors.image && (
                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
              )}
              
              <p className="mt-1 text-xs text-gray-500">
                Accepted formats: JPG, PNG, GIF, WebP (Max 2MB)
              </p>
              
              {previewImage && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                  <div className="relative w-40 h-40">
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="h-full w-full object-cover rounded-md border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setFormData(prev => ({ ...prev, image: null }));
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-md text-white ${
                  isSubmitting 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Newcategory;