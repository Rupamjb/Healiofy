import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Upload, 
  AlertCircle, 
  Pill, 
  FileText, 
  Camera,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { extractTextFromImage, preprocessOcrText } from '@/services/prescriptionService';
import { AuthModal } from "@/components/auth/AuthModal";

interface PrescriptionAnalysisFormProps {
  onSubmit: (query: string) => Promise<void>;
  isLoading: boolean;
  initialText?: string;
}

export const PrescriptionAnalysisForm = ({ 
  onSubmit, 
  isLoading, 
  initialText = "" 
}: PrescriptionAnalysisFormProps) => {
  const [query, setQuery] = useState(initialText);
  const [selectedTab, setSelectedTab] = useState<"text" | "upload" | "camera">("text");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Update query when initialText changes
  useEffect(() => {
    if (initialText) {
      setQuery(initialText);
    }
  }, [initialText]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      await onSubmit(query);
    } catch (error: any) {
      if (error.message?.includes('Please log in')) {
        toast({
          title: "Authentication Required",
          description: "Please log in to analyze prescriptions",
          variant: "default"
        });
        setShowAuthModal(true);
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to analyze prescription",
          variant: "destructive"
        });
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size should be less than 10MB",
        variant: "destructive"
      });
      return;
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please upload a JPG or PNG file",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
    
    // Send image to server for AI processing with Llama Scout
    toast({ 
      title: "Processing Started", 
      description: "Uploading and processing your prescription image...",
      duration: 10000 // 10 seconds
    });
    setProcessingImage(true);
    
    try {
      console.log('Creating FormData with image file:', file.name, file.type, file.size);
      
      // Create FormData to send the image
      const formData = new FormData();
      formData.append('image', file);
      
      // Send the image to the server for processing with Llama Scout
      toast({ 
        title: "Image Uploaded", 
        description: "Extracting text using AI vision model...",
        duration: 15000 // 15 seconds
      });
      
      const extractedText = await extractTextFromImage(formData);
      
      // If text was extracted successfully
      if (extractedText) {
      try {
          // Use server-side AI to further preprocess and format the text
          toast({ 
            title: "Text Extracted", 
            description: "Processing and analyzing medication details...",
            duration: 5000 // 5 seconds
          });
          
          const processedResult = await preprocessOcrText(extractedText);

        // Set the structured text from AI or fall back to raw text
        setQuery(typeof processedResult.structuredText === 'string' 
          ? processedResult.structuredText 
          : JSON.stringify(processedResult.structuredText, null, 2));
        
        setSelectedTab("text");
        toast({ 
            title: processedResult.isAiProcessed ? "AI Extraction Completed" : "Text Extraction Completed", 
          description: processedResult.medicationCount > 0 
            ? `Found ${processedResult.medicationCount} medications` 
            : "Text extracted - please review and edit for accuracy"
        });
      } catch (error: any) {
        if (error.message?.includes('Please log in')) {
          toast({
            title: "Authentication Required",
            description: "Please log in to analyze prescriptions",
            variant: "default"
          });
          setShowAuthModal(true);
          // Still set the raw text so user doesn't lose their work
            setQuery(extractedText);
          setSelectedTab("text");
        } else {
          // For other errors, just use the raw text
            setQuery(extractedText);
          setSelectedTab("text");
          toast({ 
              title: "Text Extraction Completed", 
            description: "Text extracted - AI processing unavailable" 
          });
        }
      }
      } else {
        toast({ 
          title: "Error", 
          description: "No text could be extracted from the image", 
          variant: "destructive" 
        });
      }
    } catch (error: any) {
      console.error("Image processing error:", error);
      
      // Handle different types of errors with different messages
      if (error.message?.includes('Please log in')) {
        toast({
          title: "Authentication Required",
          description: "Please log in to analyze prescriptions",
          variant: "default"
        });
        setShowAuthModal(true);
      } else if (error.message?.includes('timed out')) {
        toast({ 
          title: "Processing Timeout", 
          description: "The server took too long to process the image. Please try again with a clearer image.", 
          variant: "destructive" 
        });
      } else if (error.message?.includes('format or size')) {
        toast({ 
          title: "Invalid Image", 
          description: "The image format or size is invalid. Please try another image.", 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Error", 
          description: error.message || "Failed to extract text from image", 
          variant: "destructive" 
        });
      }
    } finally {
      setProcessingImage(false);
    }
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleOpenCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case "text":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter your prescription or medication details
              </label>
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Example: Lisinopril 10mg, Metformin 500mg, Simvastatin 20mg..."
                className="min-h-[150px] resize-none"
              />
            </div>
            <motion.div 
              className="text-xs text-medical-primary flex items-start p-3 bg-blue-50 rounded-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Sparkles className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm mb-1">Analysis tips</p>
                <p>For the most accurate analysis, include:</p>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>Full medication names</li>
                  <li>Dosage (e.g., 10mg)</li> 
                  <li>Frequency (e.g., twice daily)</li>
                  <li>Duration of treatment if known</li>
                </ul>
              </div>
            </motion.div>
          </div>
        );
      case "upload":
        return (
          <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            {imagePreview ? (
              <div className="mb-4 w-full max-w-xs">
                <img 
                  src={imagePreview} 
                  alt="Prescription preview" 
                  className="rounded-lg object-contain max-h-[200px] mx-auto"
                />
                <p className="text-sm text-center mt-2 text-gray-600">
                  {selectedFile?.name}
                </p>
                <div className="flex justify-center mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedFile(null);
                      setImagePreview(null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-700 font-medium">Upload a photo of your prescription</p>
                <p className="text-sm text-gray-500 mt-1 mb-4">JPG or PNG up to 10MB</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png"
              className="hidden"
            />
            <Button 
              variant="outline" 
              onClick={handleSelectFileClick}
            >
              {imagePreview ? "Choose Different File" : "Select File"}
            </Button>
          </div>
        );
      case "camera":
        return (
          <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            {imagePreview ? (
              <div className="mb-4 w-full max-w-xs">
                <img 
                  src={imagePreview} 
                  alt="Prescription photo" 
                  className="rounded-lg object-contain max-h-[200px] mx-auto" 
                />
                <div className="flex justify-center mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setSelectedFile(null);
                      setImagePreview(null);
                    }}
                  >
                    Take New Photo
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Camera className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-700 font-medium">Take a photo of your prescription</p>
                <p className="text-sm text-gray-500 mt-1 mb-4">
                  This might open file explorer on some devices - if so, select a recent photo or take a new one
                </p>
              </>
            )}
            <input 
              type="file" 
              ref={cameraInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png"
              capture="user"
              className="hidden"
            />
            <Button 
              variant="outline" 
              onClick={handleOpenCameraClick}
            >
              {imagePreview ? "Take Another Photo" : "Open Camera"}
            </Button>
          </div>
        );
    }
  };

  return (
    <>
      <motion.div 
        className="bg-white rounded-lg shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      >
        <div className="mb-6 flex items-center">
          <Pill className="h-6 w-6 text-medical-primary mr-2" />
          <h3 className="text-xl font-semibold">Instant Prescription Analysis</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 border-b mb-6">
            <button
              type="button"
              className={`px-4 py-3 ${
                selectedTab === "text"
                  ? "border-b-2 border-medical-primary text-medical-primary"
                  : "text-gray-500 hover:text-medical-primary"
              } transition-colors`}
              onClick={() => setSelectedTab("text")}
            >
              <span className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Text Input
              </span>
            </button>
            <button
              type="button"
              className={`px-4 py-3 ${
                selectedTab === "upload"
                  ? "border-b-2 border-medical-primary text-medical-primary"
                  : "text-gray-500 hover:text-medical-primary"
              } transition-colors`}
              onClick={() => setSelectedTab("upload")}
            >
              <span className="flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </span>
            </button>
            <button
              type="button"
              className={`px-4 py-3 ${
                selectedTab === "camera"
                  ? "border-b-2 border-medical-primary text-medical-primary"
                  : "text-gray-500 hover:text-medical-primary"
              } transition-colors`}
              onClick={() => setSelectedTab("camera")}
            >
              <span className="flex items-center">
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </span>
            </button>
          </div>
          
          {renderTabContent()}
          
          <div className="mt-6 flex justify-end">
            <Button 
              type="submit" 
              className="bg-medical-primary hover:bg-medical-primary/90 text-white px-6 py-2.5"
              disabled={!query.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analyze Prescription
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};
