import { useState, useEffect } from "react";
import Image from "next/image";
import Head from "next/head";
import Footer from "~/component/footer";
import Navigation from "~/component/navigationTab";
import PageLoading from "~/component/loadingPage";
import { api } from "~/utils/api";
import { 
  ALargeSmall, 
  Upload, 
  X, 
  Calendar, 
  Heart, 
  Shield, 
  Stethoscope,
  FileText,
  Camera,
  Save,
  AlertCircle
} from "lucide-react";
import { Sex } from "@prisma/client";

// Common cat breeds for dropdown
const CAT_BREEDS = [
  "Domestic Shorthair",
  "Domestic Longhair", 
  "Persian",
  "Maine Coon",
  "British Shorthair",
  "Ragdoll",
  "Siamese",
  "Bengal",
  "Russian Blue",
  "Scottish Fold",
  "Abyssinian",
  "Birman",
  "Himalayan",
  "Mixed Breed",
  "Other"
];

interface CatFormData {
  name: string;
  ageMonths: number;
  sex: Sex;
  breed: string;
  vaccinated: boolean;
  desexed: boolean;
  microchipped: boolean;
  description: string;
  imageFiles: string[];
}

export default function UploadCat() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  
  // Form state
  const [formData, setFormData] = useState<CatFormData>({
    name: "",
    ageMonths: 0,
    sex: Sex.UNKNOWN,
    breed: "",
    vaccinated: false,
    desexed: false,
    microchipped: false,
    description: "",
    imageFiles: []
  });

  // Image preview state
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const createCat = api.cat.createCat.useMutation({
    onSuccess: () => {
      setSuccessMessage("Cat profile created successfully!");
      resetForm();
      setIsSubmitting(false);
    },
    onError: (error) => {
      setErrors({ submit: error.message || "Failed to create cat profile" });
      setIsSubmitting(false);
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      ageMonths: 0,
      sex: Sex.UNKNOWN,
      breed: "",
      vaccinated: false,
      desexed: false,
      microchipped: false,
      description: "",
      imageFiles: []
    });
    setImagePreviews([]);
    setErrors({});
  };

  const handleInputChange = (field: keyof CatFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 images
    if (imagePreviews.length + files.length > 5) {
      setErrors(prev => ({ ...prev, images: "Maximum 5 images allowed" }));
      return;
    }

    try {
      const newBase64Images: string[] = [];
      const newPreviews: string[] = [];

      for (const file of files) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setErrors(prev => ({ ...prev, images: "Each image must be less than 5MB" }));
          return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
          setErrors(prev => ({ ...prev, images: "Only image files are allowed" }));
          return;
        }

        const base64 = await convertFileToBase64(file);
        newBase64Images.push(base64);
        newPreviews.push(URL.createObjectURL(file));
      }

      setFormData(prev => ({
        ...prev,
        imageFiles: [...prev.imageFiles, ...newBase64Images]
      }));
      setImagePreviews(prev => [...prev, ...newPreviews]);
      setErrors(prev => ({ ...prev, images: "" }));
    } catch (error) {
      setErrors(prev => ({ ...prev, images: "Failed to process images" }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => {
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(prev[index] ?? "");
      return prev.filter((_, i) => i !== index);
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Cat name is required";
    }

    if (formData.ageMonths < 0) {
      newErrors.ageMonths = "Age must be 0 or greater";
    }

    if (!formData.breed.trim()) {
      newErrors.breed = "Breed is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    createCat.mutate(formData);
  };

  const formatAgeDisplay = (months: number): string => {
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
    return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  };

  return (
    <>
      <Head>
        <title>Upload Cat Profile - Adopt a Cat</title>
        <link rel="icon" href="/ava.png"/>
      </Head>

      <main className="min-h-screen w-full flex flex-col bg-[#fffbf5]">
        {isLoading && <PageLoading />}
        <Navigation />

        <div className="flex-1 flex flex-col items-center px-4 py-8">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl text-[#4c361d] font-semibold mb-2">
                Welcome a New Cat to Our Family!
              </h1>
              <p className="text-[#8b7355] text-lg">
                Fill out the details below to create a new cat profile
              </p>
            </div>

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
                <Heart className="h-5 w-5" />
                {successMessage}
              </div>
            )}

            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#4c361d] border-b pb-2">Basic Information</h2>
                
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#4c361d]">
                    Cat Name *
                  </label>
                  <div className="relative">
                    <ALargeSmall className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Muffin, Whiskers, Luna"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fab24e] focus:border-transparent transition-all ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                {/* Age and Sex Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Age */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#4c361d]">
                      Age (months) *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        value={formData.ageMonths}
                        onChange={(e) => handleInputChange('ageMonths', parseInt(e.target.value) || 0)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fab24e] focus:border-transparent transition-all ${
                          errors.ageMonths ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {formData.ageMonths > 0 && (
                      <p className="text-sm text-gray-600">≈ {formatAgeDisplay(formData.ageMonths)}</p>
                    )}
                    {errors.ageMonths && <p className="text-red-500 text-sm">{errors.ageMonths}</p>}
                  </div>

                  {/* Sex */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#4c361d]">Sex</label>
                    <select
                      value={formData.sex}
                      onChange={(e) => handleInputChange('sex', e.target.value as Sex)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fab24e] focus:border-transparent transition-all"
                    >
                      <option value={Sex.UNKNOWN}>Unknown</option>
                      <option value={Sex.MALE}>Male</option>
                      <option value={Sex.FEMALE}>Female</option>
                    </select>
                  </div>
                </div>

                {/* Breed */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#4c361d]">Breed *</label>
                  <select
                    value={formData.breed}
                    onChange={(e) => handleInputChange('breed', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fab24e] focus:border-transparent transition-all ${
                      errors.breed ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a breed</option>
                    {CAT_BREEDS.map(breed => (
                      <option key={breed} value={breed}>{breed}</option>
                    ))}
                  </select>
                  {errors.breed && <p className="text-red-500 text-sm">{errors.breed}</p>}
                </div>
              </div>

              {/* Health Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#4c361d] border-b pb-2">Health Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Vaccinated */}
                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.vaccinated}
                      onChange={(e) => handleInputChange('vaccinated', e.target.checked)}
                      className="w-4 h-4 text-[#fab24e] border-gray-300 rounded focus:ring-[#fab24e]"
                    />
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="h-4 w-4 text-[#fab24e]" />
                      <span className="text-sm font-medium text-[#4c361d]">Vaccinated</span>
                    </div>
                  </label>

                  {/* Desexed */}
                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.desexed}
                      onChange={(e) => handleInputChange('desexed', e.target.checked)}
                      className="w-4 h-4 text-[#fab24e] border-gray-300 rounded focus:ring-[#fab24e]"
                    />
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-[#fab24e]" />
                      <span className="text-sm font-medium text-[#4c361d]">Desexed</span>
                    </div>
                  </label>

                  {/* Microchipped */}
                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.microchipped}
                      onChange={(e) => handleInputChange('microchipped', e.target.checked)}
                      className="w-4 h-4 text-[#fab24e] border-gray-300 rounded focus:ring-[#fab24e]"
                    />
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-[#fab24e]" />
                      <span className="text-sm font-medium text-[#4c361d]">Microchipped</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#4c361d]">
                  Description * <span className="text-gray-500">(minimum 20 characters)</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Tell us about this cat's personality, likes, dislikes, and any special needs..."
                    rows={4}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fab24e] focus:border-transparent transition-all resize-none ${
                      errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  {errors.description && <p className="text-red-500">{errors.description}</p>}
                  <p className="text-gray-500 ml-auto">{formData.description.length} characters</p>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[#4c361d] border-b pb-2">Photos</h2>
                
                <div className="space-y-4">
                  {/* Upload Button */}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Camera className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> photos
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB each (max 5 images)</p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-[#fab24e] text-white rounded-lg hover:bg-[#e8a142] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Create Cat Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
}