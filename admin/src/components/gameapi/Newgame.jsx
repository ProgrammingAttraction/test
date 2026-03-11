import React, { useState, useRef, useEffect } from 'react';
import { FaCheck, FaEdit, FaHeart } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Header from '../common/Header';
import * as XLSX from 'xlsx';
import Select from 'react-select'; // Add react-select for multi-select categories

const Newgame = () => {
  const [formData, setFormData] = useState({
    gameName: '',
    providerName: '',
    gameId: '',
    categories: [], // Changed to array for multiple categories
    imageUrl: '',
    isFeatured: false
  });

  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Bulk upload states
  const [excelFile, setExcelFile] = useState(null);
  const [parsedGames, setParsedGames] = useState([]);
  const [importStatus, setImportStatus] = useState({
    total: 0,
    processed: 0,
    added: 0,
    skipped: 0,
    errors: 0
  });
  const [isImporting, setIsImporting] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await axios.get(`${base_url}/admin/categories`);
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#FF3333',
            color: '#fff',
          },
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [base_url]);

  // Fetch providers
  const fetchProviders = () => {
    axios
      .get(`${base_url}/admin/providers`)
      .then((res) => {
        setProviders(res.data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCategoriesChange = (selectedOptions) => {
    setFormData({
      ...formData,
      categories: selectedOptions ? selectedOptions.map(option => option.value) : []
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.gameName.trim()) {
      errors.gameName = 'Game name is required';
    }
    if (!formData.providerName.trim()) {
      errors.providerName = 'Provider name is required';
    }
    if (!formData.gameId.trim()) {
      errors.gameId = 'Game ID is required';
    }
    if (!formData.categories || formData.categories.length === 0) {
      errors.categories = 'At least one category is required';
    }
    if (!formData.imageUrl.trim()) {
      errors.imageUrl = 'Image URL is required';
    } else if (!isValidUrl(formData.imageUrl)) {
      errors.imageUrl = 'Please enter a valid URL';
    }
    return errors;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await axios.post(`${base_url}/admin/games/add`, {
        gameName: formData.gameName,
        providerName: formData.providerName,
        gameId: formData.gameId,
        categories: formData.categories, // Send categories array
        imageUrl: formData.imageUrl,
        isFeatured: formData.isFeatured
      });

      toast.success('Game added successfully!', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#4BB543',
          color: '#fff',
        },
      });

      setFormData({
        gameName: '',
        providerName: '',
        gameId: '',
        categories: [],
        imageUrl: '',
        isFeatured: false
      });
      setErrors({});
    } catch (error) {
      console.error('Error adding game:', error);
      
      let errorMessage = 'Failed to add game';
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.message || 'Validation error';
        } else if (error.response.status === 409) {
          errorMessage = 'Game with this ID already exists';
        }
      }

      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#FF3333',
          color: '#fff',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Excel file change and parsing
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      const games = data.slice(1).map((row) => ({
        gameId: row[0]?.toString().trim(),
        gameName: row[1]?.toString().trim(),
        categories: row[2]?.toString().split(',').map(cat => cat.trim()).filter(cat => cat), // Split into array
        providerName: row[3]?.toString().trim(),
        imageUrl: row[4]?.toString().trim(),
      })).filter((game) => 
        game.gameId && 
        game.gameName && 
        game.categories.length > 0 && 
        game.providerName && 
        game.imageUrl && 
        isValidUrl(game.imageUrl)
      );

      setParsedGames(games);
      setImportStatus((prev) => ({ ...prev, total: games.length }));

      if (games.length === 0) {
        toast.error('No valid games found in the Excel file.', {
          duration: 4000,
          position: 'top-center',
          style: { background: '#FF3333', color: '#fff' },
        });
      } else {
        toast.success(`Parsed ${games.length} valid games from the file.`, {
          duration: 4000,
          position: 'top-center',
          style: { background: '#4BB543', color: '#fff' },
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  // Start importing games in batches of 10 using bulk-upload endpoint
  const startImport = async () => {
    if (parsedGames.length === 0) return;

    setIsImporting(true);
    const batchSize = 10;
    let added = 0;
    let skipped = 0;
    let errors = 0;
    let processed = 0;

    for (let i = 0; i < parsedGames.length; i += batchSize) {
      const batch = parsedGames.slice(i, i + batchSize);
      try {
        const response = await axios.post(`${base_url}/admin/games/bulk-upload`, { games: batch });
        if (response.data.success) {
          const { results } = response.data;
          processed += results.processed || batch.length;
          added += results.added || 0;
          skipped += results.skipped || 0;
          errors += results.errors || 0;

          setImportStatus({
            total: parsedGames.length,
            processed,
            added,
            skipped,
            errors,
          });
        }
      } catch (error) {
        console.error('Error in bulk upload:', error);
        errors += batch.length;
        processed += batch.length;
        setImportStatus((prev) => ({
          ...prev,
          processed,
          errors: prev.errors + batch.length,
        }));
        toast.error('Error during bulk upload.', {
          duration: 4000,
          position: 'top-center',
          style: { background: '#FF3333', color: '#fff' },
        });
      }

      if (i + batchSize < parsedGames.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    setIsImporting(false);
    toast.success('Import completed!', {
      duration: 5000,
      position: 'top-center',
      style: { background: '#4BB543', color: '#fff' },
    });
  };

  return (
    <div className="w-full font-bai bg-gray-100 min-h-screen text-gray-700">
      <Header />
      <Toaster />
      <section className="p-4 w-full mx-auto">
        <div className="bg-white rounded-lg border-[1px] border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Game</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Game Name */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gameName">
                  Game Name *
                </label>
                <input
                  className={`appearance-none rounded w-full py-3 border-[1px] border-gray-300 px-3 text-gray-700 leading-tight outline-teal-600 ${
                    errors.gameName ? 'border-red-500' : ''
                  }`}
                  id="gameName"
                  name="gameName"
                  type="text"
                  placeholder="Enter game name"
                  value={formData.gameName}
                  onChange={handleChange}
                />
                {errors.gameName && (
                  <p className="text-red-500 text-xs italic">{errors.gameName}</p>
                )}
              </div>

              {/* Provider Name */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="providerName">
                  Provider Name *
                </label>
                <select
                  className={`appearance-none rounded w-full py-3 border-[1px] border-gray-300 px-3 text-gray-700 leading-tight outline-teal-600 ${
                    errors.providerName ? 'border-red-500' : ''
                  }`}
                  id="providerName"
                  name="providerName"
                  value={formData.providerName}
                  onChange={handleChange}
                >
                  <option value="">Select a provider</option>
                  {providers.map((provider) => (
                    <option key={provider._id} value={provider.providerName}>
                      {provider.providerName}
                    </option>
                  ))}
                </select>
                {errors.providerName && (
                  <p className="text-red-500 text-xs italic">{errors.providerName}</p>
                )}
              </div>

              {/* Game ID */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gameId">
                  Game ID *
                </label>
                <input
                  className={`appearance-none rounded w-full py-3 border-[1px] border-gray-300 px-3 text-gray-700 leading-tight outline-teal-600 ${
                    errors.gameId ? 'border-red-500' : ''
                  }`}
                  id="gameId"
                  name="gameId"
                  type="text"
                  placeholder="Enter game ID"
                  value={formData.gameId}
                  onChange={handleChange}
                />
                {errors.gameId && (
                  <p className="text-red-500 text-xs italic">{errors.gameId}</p>
                )}
              </div>

              {/* Categories */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categories">
                  Categories *
                </label>
                <Select
                  isMulti
                  name="categories"
                  options={categories.map(cat => ({ value: cat.name, label: cat.name }))}
                  value={formData.categories.map(cat => ({ value: cat, label: cat }))}
                  onChange={handleCategoriesChange}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder={loadingCategories ? 'Loading categories...' : 'Select categories...'}
                  isDisabled={loadingCategories}
                />
                {errors.categories && (
                  <p className="text-red-500 text-xs italic">{errors.categories}</p>
                )}
              </div>

              {/* Image URL */}
              <div className="mb-4 md:col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">
                  Image URL *
                </label>
                <input
                  className={`appearance-none rounded w-full py-3 border-[1px] border-gray-300 px-3 text-gray-700 leading-tight outline-teal-600 ${
                    errors.imageUrl ? 'border-red-500' : ''
                  }`}
                  id="imageUrl"
                  name="imageUrl"
                  type="text"
                  placeholder="Enter image URL"
                  value={formData.imageUrl}
                  onChange={handleChange}
                />
                {errors.imageUrl && (
                  <p className="text-red-500 text-xs italic">{errors.imageUrl}</p>
                )}
                
                {formData.imageUrl && isValidUrl(formData.imageUrl) && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                    <img
                      src={formData.imageUrl}
                      alt="Game preview"
                      className="w-32 h-32 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>

              {/* Featured Game Checkbox */}
              <div className="mb-4 md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-gray-700 font-bold">Feature this game</span>
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Featured games will be highlighted on the homepage
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className={`bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline flex items-center ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Add Game'
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 border-t pt-8 text-gray-700">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Games from Excel</h2>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 border-[2px] border-teal-500 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />

            {parsedGames.length > 0 && (
              <div className="mt-6">
                <p className="text-gray-700 mb-4">Found {parsedGames.length} valid games in the file.</p>
                <button
                  onClick={startImport}
                  disabled={isImporting}
                  className={`bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded ${
                    isImporting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isImporting ? 'Importing...' : 'Start Import'}
                </button>

                {importStatus.total > 0 && (
                  <div className="mt-6">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                      <div
                        className="bg-teal-500 h-2.5 rounded-full"
                        style={{ width: `${(importStatus.processed / importStatus.total) * 100}%` }}
                      ></div>
                    </div>
                    <p>Processed: {importStatus.processed} / {importStatus.total}</p>
                    <p>Added: {importStatus.added}</p>
                    <p>Skipped (already exist): {importStatus.skipped}</p>
                    <p>Errors: {importStatus.errors}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Newgame;