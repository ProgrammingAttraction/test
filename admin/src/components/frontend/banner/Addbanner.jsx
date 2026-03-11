import { useState } from "react";
import { FaCloudUploadAlt, FaTrash, FaSpinner } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import Header from "../../common/Header";

export default function Addbanner() {
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    
    if (files.length + images.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    const newImages = [...images];
    let hasInvalidType = false;

    files.forEach((file) => {
      if (!validTypes.includes(file.type)) {
        hasInvalidType = true;
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        newImages.push({ file, preview: reader.result });
        if (newImages.length === images.length + files.length) {
          setImages(newImages);
        }
      };
      reader.readAsDataURL(file);
    });

    if (hasInvalidType) {
      toast.error("Only PNG, JPEG, JPG, and WebP images are allowed");
    }
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    images.forEach((img) => formData.append("images", img.file));

    try {
      const response = await axios.post(`${base_url}/admin/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          'Authorization': localStorage.getItem('genzz_token')
        },
      });

      toast.success(response.data.message || "Banners uploaded successfully!");
      setImages([]);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error uploading banners");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-bai">
      <Header />
      
      <main className="w-full mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Banner Images</h1>
          <p className="text-gray-600">Upload high-quality images for your website banners</p>
        </div>

        <div className="bg-white rounded-[10px] shadow-sm border border-gray-200 p-6">
          {/* Upload Area */}
          <div className="mb-8">
            <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors bg-gray-50">
              <div className="flex flex-col items-center p-6 text-center">
                <FaCloudUploadAlt className="text-blue-500 text-4xl mb-3" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">Drag & drop images here</h3>
                <p className="text-sm text-gray-500 mb-3">or click to browse files</p>
                <span className="text-xs text-gray-400">Supports: PNG, JPG, JPEG, WebP (Max 5 images)</span>
              </div>
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/jpg, image/webp" 
                multiple 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </label>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Selected Images ({images.length}/5)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={img.preview} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-40 object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      aria-label="Remove image"
                    >
                      <FaTrash size={14} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs truncate">{img.file.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isUploading || images.length === 0}
              className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                isUploading || images.length === 0 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <FaSpinner className="animate-spin" />
                  Uploading...
                </span>
              ) : (
                `Upload ${images.length} Image${images.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}