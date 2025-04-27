import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PrescriptionAnalysis } from '@/services/prescriptionService';

interface PrescriptionContextType {
  analysisResult: PrescriptionAnalysis | null;
  setAnalysisResult: (result: PrescriptionAnalysis | null) => void;
  queryText: string;
  setQueryText: (text: string) => void;
  analysisTab: string;
  setAnalysisTab: (tab: string) => void;
  clearPrescriptionState: () => void;
}

const PrescriptionContext = createContext<PrescriptionContextType | undefined>(undefined);

export const usePrescription = () => {
  const context = useContext(PrescriptionContext);
  if (!context) {
    throw new Error('usePrescription must be used within a PrescriptionProvider');
  }
  return context;
};

interface PrescriptionProviderProps {
  children: ReactNode;
}

// Helper function to safely parse JSON from localStorage
const safelyParseJSON = (json: string | null) => {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error('Failed to parse stored prescription data', e);
    return null;
  }
};

export const PrescriptionProvider: React.FC<PrescriptionProviderProps> = ({ children }) => {
  // Load stored values from localStorage on initial render
  const [analysisResult, setAnalysisResultState] = useState<PrescriptionAnalysis | null>(() => {
    return safelyParseJSON(localStorage.getItem('healiofy_prescription_result'));
  });
  
  const [queryText, setQueryTextState] = useState<string>(() => {
    return localStorage.getItem('healiofy_prescription_query') || '';
  });
  
  const [analysisTab, setAnalysisTabState] = useState<string>(() => {
    return localStorage.getItem('healiofy_prescription_tab') || 'analysis';
  });

  // Wrap setState functions to also update localStorage
  const setAnalysisResult = (result: PrescriptionAnalysis | null) => {
    setAnalysisResultState(result);
    if (result) {
      localStorage.setItem('healiofy_prescription_result', JSON.stringify(result));
    } else {
      localStorage.removeItem('healiofy_prescription_result');
    }
  };

  const setQueryText = (text: string) => {
    setQueryTextState(text);
    localStorage.setItem('healiofy_prescription_query', text);
  };

  const setAnalysisTab = (tab: string) => {
    setAnalysisTabState(tab);
    localStorage.setItem('healiofy_prescription_tab', tab);
  };

  // Function to clear all prescription-related state
  const clearPrescriptionState = () => {
    setAnalysisResultState(null);
    setQueryTextState('');
    setAnalysisTabState('analysis');
    localStorage.removeItem('healiofy_prescription_result');
    localStorage.removeItem('healiofy_prescription_query');
    localStorage.removeItem('healiofy_prescription_tab');
  };

  return (
    <PrescriptionContext.Provider 
      value={{ 
        analysisResult, 
        setAnalysisResult,
        queryText,
        setQueryText,
        analysisTab,
        setAnalysisTab,
        clearPrescriptionState
      }}
    >
      {children}
    </PrescriptionContext.Provider>
  );
}; 