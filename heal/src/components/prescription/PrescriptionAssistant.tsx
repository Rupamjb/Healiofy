import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getChatbotResponse, ChatMessage } from "@/services/chatbotService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { 
  Send, Bot, User, AlertCircle, Shield, Award, 
  CheckCircle, Stethoscope, Pill, HeartPulse
} from "lucide-react";
import { PrescriptionAnalysis } from "@/services/prescriptionService";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Switch as UISwitch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import "./prescriptionAssistant.css";

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  contextType: 'prescription' | 'general';
}

interface PrescriptionAssistantProps {
  result: PrescriptionAnalysis | null;
}

// Helper function to format AI responses properly
const formatAIResponse = (text: string) => {
  // Apply various text formatting
  let formattedText = text
    // Convert bold markdown to HTML
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert italic markdown to HTML
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Convert bullet lists
    .replace(/^- (.*?)$/gm, '<li>$1</li>')
    // Convert numbered lists
    .replace(/^\d+\.\s+(.*?)$/gm, '<li>$1</li>');
  
  // Process paragraphs and lists
  const paragraphs: JSX.Element[] = [];
  let currentList: string[] = [];
  let isOrderedList = false;
  let listType = '';

  // Split by line breaks and process each line
  formattedText.split('\n').forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Handle empty lines
    if (trimmedLine === '') {
      // If we have an active list, close it first
      if (currentList.length > 0) {
        if (isOrderedList) {
          paragraphs.push(<ol key={`ol-${index}`} className="list-decimal pl-5 my-2">{currentList.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}</ol>);
        } else {
          paragraphs.push(<ul key={`ul-${index}`} className="list-disc pl-5 my-2">{currentList.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}</ul>);
        }
        currentList = [];
        listType = '';
      }
      
      // Add a line break for empty lines
      paragraphs.push(<div key={`br-${index}`} className="h-2"></div>);
      return;
    }
    
    // Check if this is a list item
    const bulletMatch = trimmedLine.match(/<li>(.*?)<\/li>/);
    const isListItem = bulletMatch !== null;
    
    // Determine list type (numbered or bullet)
    const currentListType = trimmedLine.match(/^\d+\./) ? 'ol' : (isListItem ? 'ul' : '');
    
    if (isListItem) {
      // If we're switching list types, close the current list
      if (listType !== '' && listType !== currentListType) {
        if (isOrderedList) {
          paragraphs.push(<ol key={`ol-${index}`} className="list-decimal pl-5 my-2">{currentList.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}</ol>);
        } else {
          paragraphs.push(<ul key={`ul-${index}`} className="list-disc pl-5 my-2">{currentList.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}</ul>);
        }
        currentList = [];
      }
      
      // Set current list type
      listType = currentListType;
      isOrderedList = listType === 'ol';
      
      // Add item to the current list
      currentList.push(bulletMatch[1]);
    } else {
      // Not a list item, so if we have an active list, close it
      if (currentList.length > 0) {
        if (isOrderedList) {
          paragraphs.push(<ol key={`ol-${index}`} className="list-decimal pl-5 my-2">{currentList.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}</ol>);
        } else {
          paragraphs.push(<ul key={`ul-${index}`} className="list-disc pl-5 my-2">{currentList.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}</ul>);
        }
        currentList = [];
      }
      
      // Add as a normal paragraph
      paragraphs.push(<p key={`p-${index}`} className="mb-2" dangerouslySetInnerHTML={{ __html: trimmedLine }} />);
    }
  });
  
  // If we have an unclosed list at the end, close it
  if (currentList.length > 0) {
    const index = formattedText.split('\n').length;
    if (isOrderedList) {
      paragraphs.push(<ol key={`ol-${index}`} className="list-decimal pl-5 my-2">{currentList.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}</ol>);
    } else {
      paragraphs.push(<ul key={`ul-${index}`} className="list-disc pl-5 my-2">{currentList.map((item, i) => <li key={i} dangerouslySetInnerHTML={{ __html: item }} />)}</ul>);
    }
  }
  
  return <div className="chat-message-formatted">{paragraphs}</div>;
};

export const PrescriptionAssistant = ({ result }: PrescriptionAssistantProps) => {
  // UI messages for display
  const [messages, setMessages] = useState<Message[]>(() => {
    // Try to load messages from localStorage
    const savedMessages = localStorage.getItem('healiofy_chat_messages');
    if (savedMessages) {
      try {
        // Parse stored messages and fix date objects
        const parsed = JSON.parse(savedMessages);
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (e) {
        console.error('Error parsing stored chat messages', e);
        // Return default if parsing fails
        return [{
          text: "I'm your AI Health Assistant. I can answer questions about your prescription or general health topics. How can I help you today?",
          isUser: false,
          timestamp: new Date(),
          contextType: 'prescription'
        }];
      }
    }
    
    // Default initial message
    return [{
      text: "I'm your AI Health Assistant. I can answer questions about your prescription or general health topics. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
      contextType: 'prescription'
    }];
  });
  
  // Chat history for API
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    // Try to load chat history from localStorage
    const savedHistory = localStorage.getItem('healiofy_chat_history');
    if (savedHistory) {
      try {
        return JSON.parse(savedHistory);
      } catch (e) {
        console.error('Error parsing stored chat history', e);
        // Return default if parsing fails
        return [
          {
            role: "system",
            content: "You are a helpful AI Health Assistant that provides information about prescriptions and general health topics. Be concise, accurate, and helpful."
          },
          {
            role: "assistant",
            content: "I'm your AI Health Assistant. I can answer questions about your prescription or general health topics. How can I help you today?"
          }
        ];
      }
    }
    
    // Default initial history
    return [
      {
        role: "system",
        content: "You are a helpful AI Health Assistant that provides information about prescriptions and general health topics. Be concise, accurate, and helpful."
      },
      {
        role: "assistant",
        content: "I'm your AI Health Assistant. I can answer questions about your prescription or general health topics. How can I help you today?"
      }
    ];
  });
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('healiofy_chat_messages', JSON.stringify(messages));
  }, [messages]);
  
  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('healiofy_chat_history', JSON.stringify(chatHistory));
  }, [chatHistory]);
  
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contextType, setContextType] = useState<'prescription' | 'general'>(() => {
    // Try to load context type from local storage or use prescription as default
    return (localStorage.getItem('healiofy_chat_context') as 'prescription' | 'general') || 'prescription';
  });
  
  // Save context type to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('healiofy_chat_context', contextType);
  }, [contextType]);
  
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // New state for tracking whether to use prescription context
  const [usePrescriptionContext, setUsePrescriptionContext] = useState<boolean>(true);
  
  // Function to toggle prescription context
  const togglePrescriptionContext = () => {
    setUsePrescriptionContext(prev => !prev);
    
    // Show toast
    toast({
      title: usePrescriptionContext ? "Analysis Link Disabled" : "Analysis Link Enabled",
      description: usePrescriptionContext 
        ? "The chat assistant is now independent from your prescription analysis." 
        : "The chat assistant will now consider your prescription analysis when answering.",
    });
    
    // If we're enabling the context, refresh the system message
    if (!usePrescriptionContext && contextType === 'prescription' && result) {
      // Create a new chat history with updated system message
      const updatedHistory = [...chatHistory];
      if (updatedHistory[0]?.role === 'system') {
        // Create a proper system message with prescription context
        const systemMessage = 
          "You are a helpful AI Health Assistant that provides information about prescriptions and general health topics. " +
          "Be concise, accurate, and helpful. " +
          `The user has a prescription with information about:` +
          ` Duration (${result.duration.total_days || 'unspecified'} days, ${result.duration.frequency}, ${result.duration.timing}),` +
          ` Precautions (dietary restrictions, activity limitations, side effects),` +
          ` and Warnings (drug interactions, contraindications).` +
          ` Please consider this context when answering their questions.`;
        
        // Replace the system message
        updatedHistory[0] = {
          role: "system",
          content: systemMessage
        };
        
        setChatHistory(updatedHistory);
      }
    }
  };
  
  // Function to clear chat history (updated)
  const clearChat = () => {
    // Reset chat UI
    setMessages([{
      text: "I'm your AI Health Assistant. I can answer questions about your prescription or general health topics. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
      contextType: contextType
    }]);
    
    // Create appropriate system message
    let systemMessage = "You are a helpful AI Health Assistant that provides information about prescriptions and general health topics. Be concise, accurate, and helpful.";
    
    // Add prescription context if enabled
    if (usePrescriptionContext && contextType === 'prescription' && result) {
      systemMessage += ` The user has a prescription with information about:` +
        ` Duration (${result.duration.total_days || 'unspecified'} days, ${result.duration.frequency}, ${result.duration.timing}),` +
        ` Precautions (dietary restrictions, activity limitations, side effects),` +
        ` and Warnings (drug interactions, contraindications).` +
        ` Please consider this context when answering their questions.`;
    }
    
    // Reset chat history
    setChatHistory([
      {
        role: "system",
        content: systemMessage
      },
      {
        role: "assistant",
        content: "I'm your AI Health Assistant. I can answer questions about your prescription or general health topics. How can I help you today?"
      }
    ]);
    
    // Show toast
    toast({
      title: "Chat Reset",
      description: "Your conversation history has been cleared.",
    });
  };
  
  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;
    
    const userInput = inputValue.trim();
    
    // Add user message to UI
    const userMessage: Message = {
      text: userInput,
      isUser: true,
      timestamp: new Date(),
      contextType
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Add user message to chat history
    const userChatMessage: ChatMessage = {
      role: "user",
      content: userInput
    };
    
    // Create updated chat history
    const updatedChatHistory: ChatMessage[] = [...chatHistory, userChatMessage];
    
    setInputValue("");
    setIsLoading(true);
    
    try {
      if (!isAuthenticated) {
        // Handle unauthenticated users with a simulated response
        setTimeout(() => {
          const responseText = "Please log in to use the full features of the health assistant.";
          
          // Add to UI messages
          const botResponse: Message = {
            text: responseText,
            isUser: false,
            timestamp: new Date(),
            contextType
          };
          setMessages((prev) => [...prev, botResponse]);
          
          // Add to chat history
          setChatHistory([...updatedChatHistory, {
            role: "assistant",
            content: responseText
          }]);
          
          setIsLoading(false);
        }, 1000);
        return;
      }
      
      // Update system message if we have prescription data
      let historyWithContext: ChatMessage[] = [...updatedChatHistory];
      
      // If we have prescription data, ensure the system message includes it
      if (usePrescriptionContext && contextType === 'prescription' && result) {
        // Check if the first message is a system message
        if (historyWithContext[0]?.role === 'system') {
          // Create a proper system message with prescription context
          // But don't include the full JSON stringify which could corrupt the data
          const systemMessage = 
            "You are a helpful AI Health Assistant that provides information about prescriptions and general health topics. " +
            "Be concise, accurate, and helpful. " +
            `The user has a prescription with information about:` +
            ` Duration (${result.duration.total_days || 'unspecified'} days, ${result.duration.frequency}, ${result.duration.timing}),` +
            ` Precautions (dietary restrictions, activity limitations, side effects),` +
            ` and Warnings (drug interactions, contraindications).` +
            ` Please consider this context when answering their questions.`;
          
          // Replace the system message with a properly typed one
          historyWithContext[0] = {
            role: "system",
            content: systemMessage
          };
        }
      }
      
      // Get response from the API
      const response = await getChatbotResponse({
        query: userInput,
        contextType,
        messages: historyWithContext
      });
      
      // Add bot response to UI
      const botResponse: Message = {
        text: response,
        isUser: false,
        timestamp: new Date(),
        contextType
      };
      
      setMessages((prev) => [...prev, botResponse]);
      
      // Add bot response to chat history
      const updatedHistoryWithResponse: ChatMessage[] = [
        ...historyWithContext, 
        {
          role: "assistant",
          content: response
        }
      ];
      
      setChatHistory(updatedHistoryWithResponse);
    } catch (error: any) {
      console.error("Error getting chatbot response:", error);
      
      const errorMessage = "Sorry, I'm having trouble responding right now. Please try again later.";
      
      // Show error toast
      toast({
        title: "Error",
        description: error.message || "Failed to get a response from the chatbot. Please try again.",
        variant: "destructive"
      });
      
      // Add error message to UI
      const errorResponse: Message = {
        text: errorMessage,
        isUser: false,
        timestamp: new Date(),
        contextType
      };
      
      setMessages((prev) => [...prev, errorResponse]);
      
      // Add error to chat history
      setChatHistory([...updatedChatHistory, {
        role: "assistant",
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSendMessage();
    }
  };

  // Prescription-specific suggested questions
  const prescriptionQuestions = [
    "What are the main side effects I should watch for?",
    "Can I take this medication with food?",
    "What should I do if I miss a dose?",
    "Are there any medications I should avoid?",
    "How long should I take this medication?"
  ];

  // General health suggested questions
  const generalHealthQuestions = [
    "What are some tips for better sleep?",
    "How can I maintain a healthy diet?",
    "What exercises are good for heart health?",
    "How can I reduce stress naturally?",
    "What are common symptoms of dehydration?"
  ];

  // Get the right set of suggested questions based on context type
  const suggestedQuestions = contextType === 'prescription' 
    ? prescriptionQuestions 
    : generalHealthQuestions;

  // Handle clicking a suggested question
  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  // Handle toggling between prescription and general contexts
  const handleContextToggle = (checked: boolean) => {
    setContextType(checked ? 'general' : 'prescription');
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-lg border-[1px] border-gray-200 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
              {contextType === 'prescription' ? (
                <Stethoscope className="h-5 w-5" />
              ) : (
                <HeartPulse className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center">
                AI Health Assistant
                <Badge variant="outline" className="ml-2 text-xs bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" /> Verified
                </Badge>
              </h3>
              <p className="text-sm text-gray-600">Powered by advanced medical AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {contextType === 'prescription' && result && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={togglePrescriptionContext}
                className={`text-xs ${usePrescriptionContext ? 'text-blue-500' : 'text-gray-500'}`}
              >
                {usePrescriptionContext ? 'Linked to Analysis' : 'Not Linked to Analysis'}
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearChat}
              className="text-xs text-gray-500 hover:text-red-500"
            >
              Clear Chat
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm text-gray-600">
            {contextType === 'prescription' 
              ? 'Currently focusing on your prescription' 
              : 'Answering general health questions'}
          </div>
          <div className="flex items-center space-x-2">
            <Pill className={`h-4 w-4 ${contextType === 'prescription' ? 'text-blue-600' : 'text-gray-400'}`} />
            <UISwitch 
              checked={contextType === 'general'} 
              onCheckedChange={handleContextToggle}
              id="context-toggle"
            />
            <HeartPulse className={`h-4 w-4 ${contextType === 'general' ? 'text-red-500' : 'text-gray-400'}`} />
            <Label htmlFor="context-toggle" className="text-xs text-gray-600">
              {contextType === 'prescription' ? 'Prescription Mode' : 'General Health Mode'}
            </Label>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-5 divide-x divide-gray-100">
        {/* Left panel: Context Information */}
        <div className="p-4 bg-blue-50/50 md:col-span-2 overflow-auto max-h-[400px] md:max-h-[500px]">
          {contextType === 'prescription' ? (
            <>
              <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                Prescription Summary
              </h4>
              
              {!result ? (
                <div className="p-3 bg-amber-50 rounded-md text-sm text-amber-700 flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <p>No prescription analyzed yet. Please submit your prescription for analysis first.</p>
                </div>
              ) : (
                <div className="space-y-4 text-sm">
                  {/* Duration */}
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <h5 className="font-medium text-gray-800 mb-1">Duration & Timing</h5>
                    <div className="space-y-1 text-gray-700">
                      <p>
                        <span className="font-medium">Duration:</span>{" "}
                        {result.duration.total_days ? `${result.duration.total_days} days` : "Not specified"}
                      </p>
                      <p><span className="font-medium">Frequency:</span> {result.duration.frequency}</p>
                      <p><span className="font-medium">Timing:</span> {result.duration.timing}</p>
                    </div>
                  </div>

                  {/* Precautions */}
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <h5 className="font-medium text-gray-800 mb-1">Key Precautions</h5>
                    <ul className="list-disc pl-4 space-y-1 text-gray-700">
                      {result.precautions.dietary_restrictions.slice(0, 2).map((item, idx) => (
                        <li key={`diet-${idx}`}>{item}</li>
                      ))}
                      {result.precautions.activity_limitations.slice(0, 1).map((item, idx) => (
                        <li key={`activity-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Important Warnings */}
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <h5 className="font-medium text-gray-800 mb-1">Important Warnings</h5>
                    <ul className="list-disc pl-4 space-y-1 text-gray-700">
                      {result.warnings.drug_interactions.slice(0, 2).map((item, idx) => (
                        <li key={`interact-${idx}`}>{item}</li>
                      ))}
                      {result.warnings.contraindications.slice(0, 1).map((item, idx) => (
                        <li key={`contra-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Side Effects */}
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <h5 className="font-medium text-gray-800 mb-1">Side Effects to Monitor</h5>
                    <div className="flex flex-wrap gap-1">
                      {result.precautions.side_effects.slice(0, 4).map((effect, idx) => (
                        <span
                          key={`side-${idx}`}
                          className="inline-block px-2 py-1 rounded-full text-xs bg-red-50 text-red-700"
                        >
                          {effect}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <HeartPulse className="h-4 w-4 text-red-500 mr-1" />
                Health Resources
              </h4>
              
              <div className="space-y-4 text-sm">
                {/* General Health Categories */}
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <h5 className="font-medium text-gray-800 mb-2">Health Topics</h5>
                  <div className="flex flex-wrap gap-2">
                    {['Nutrition', 'Exercise', 'Sleep', 'Stress', 'Mental Health', 'Preventive Care'].map((topic) => (
                      <Badge key={topic} variant="secondary" className="px-3 py-1">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Tips */}
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <h5 className="font-medium text-gray-800 mb-2">Quick Health Tips</h5>
                  <ul className="list-disc pl-4 space-y-1 text-gray-700">
                    <li>Stay hydrated with at least 8 glasses of water daily</li>
                    <li>Aim for 7-9 hours of quality sleep each night</li>
                    <li>Include at least 30 minutes of physical activity daily</li>
                    <li>Practice mindfulness for 10 minutes each day</li>
                  </ul>
                </div>
                
                {/* Common Questions */}
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <h5 className="font-medium text-gray-800 mb-2">Common Questions</h5>
                  <div className="space-y-1 text-gray-700">
                    <p className="text-xs text-gray-500">Try asking about:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Diet recommendations</li>
                      <li>Exercise routines</li>
                      <li>Sleep improvement</li>
                      <li>Stress management</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Suggested Questions */}
          <div className="mt-4">
            <h5 className="font-medium text-gray-700 mb-2 text-sm">Suggested Questions</h5>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs bg-white"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel: Chat Interface */}
        <div className="md:col-span-3 flex flex-col h-[500px]">
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-800 border border-gray-100'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {!message.isUser && (
                      message.contextType === 'prescription' 
                        ? <Pill className="h-4 w-4 mr-1 text-blue-600" />
                        : <HeartPulse className="h-4 w-4 mr-1 text-red-500" />
                    )}
                    {message.isUser && <User className="h-4 w-4 mr-1" />}
                    <span className="text-xs">
                      {message.isUser ? 'You' : 'Health Assistant'} · {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {message.isUser ? (
                    <p className="text-sm">{message.text}</p>
                  ) : (
                    <div className="text-sm message-content">
                      {formatAIResponse(message.text)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-800 rounded-lg px-4 py-3 max-w-[85%] border border-gray-100">
                  <div className="flex items-center mb-1">
                    <Bot className="h-4 w-4 mr-1 text-blue-600" />
                    <span className="text-xs">Health Assistant</span>
                  </div>
                  <div className="flex space-x-2 items-center h-5">
                    <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {!isAuthenticated && (
            <div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
              <div className="flex items-start text-sm text-amber-700">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <p>Please sign in to use the full features of the health assistant.</p>
              </div>
            </div>
          )}
          
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask about ${contextType === 'prescription' ? 'your medication' : 'health advice'}...`}
                disabled={isLoading}
                className="flex-grow"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || inputValue.trim() === ""}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 