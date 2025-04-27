import { useState } from "react";
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/layout/MainLayout';
import { PrescriptionHeader } from '../components/prescription/PrescriptionHeader';
import { PrescriptionAnalysisForm } from '../components/prescription/PrescriptionAnalysisForm';
import { PrescriptionResult } from '../components/prescription/PrescriptionResult';
import { PrescriptionAssistant } from '../components/prescription/PrescriptionAssistant';
import { analyzePrescription } from '../services/prescriptionService';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Bot, Info } from "lucide-react";
import { usePrescription } from '../contexts/PrescriptionContext';
import { SubscriptionGuard } from '@/components/subscription/SubscriptionGuard';

const PrescriptionAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { 
    analysisResult, 
    setAnalysisResult, 
    queryText, 
    setQueryText,
    analysisTab,
    setAnalysisTab
  } = usePrescription();
  const { toast } = useToast();

  const handleAnalysisSubmit = async (ocrText: string) => {
    try {
      setIsLoading(true);
      setQueryText(ocrText); // Store the query text in context
      // Call the backend API to analyze the prescription
      const analysisResult = await analyzePrescription(ocrText);
      setAnalysisResult(analysisResult);
      // Automatically switch to the analysis tab when results are available
      setAnalysisTab("analysis");
    } catch (error: any) {
      console.error("Error analyzing prescription:", error);
      toast({
        title: "Error",
        description: error.message || "There was an error analyzing your prescription. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <Helmet>
        <title>Prescription Analysis | Healiofy</title>
        <meta name="description" content="Upload and analyze your prescription with our AI tool" />
      </Helmet>
      
      <SubscriptionGuard serviceType="prescription" serviceName="Prescription Analysis">
        <main className="flex-grow">
          <PrescriptionHeader />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <PrescriptionAnalysisForm 
              onSubmit={handleAnalysisSubmit}
              isLoading={isLoading}
            initialText={queryText}
            />
            
          {analysisResult && (
              <div className="mt-8">
              <Tabs value={analysisTab} onValueChange={setAnalysisTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="analysis" className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Analysis Report</span>
                    </TabsTrigger>
                    <TabsTrigger value="assistant" className="flex items-center">
                      <Bot className="mr-2 h-4 w-4" />
                      <span>AI Assistant</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="analysis" className="mt-0">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600">
                          This is an automated analysis of your prescription. For personalized guidance and to ask specific questions, 
                          use the <strong>AI Assistant</strong> tab.
                        </p>
                      </div>
                    </div>
                  <PrescriptionResult result={analysisResult} />
                  </TabsContent>
                  
                  <TabsContent value="assistant" className="mt-0">
                  <PrescriptionAssistant result={analysisResult} />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </main>
      </SubscriptionGuard>
    </MainLayout>
  );
};

export default PrescriptionAnalysis;
