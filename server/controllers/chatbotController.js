const axios = require('axios');
const Prescription = require('../models/Prescription');

/**
 * @desc    Get AI-powered chatbot response
 * @route   POST /api/chatbot
 * @access  Private
 */
exports.getChatbotResponse = async (req, res) => {
  try {
    const { query, contextType = 'general', messages = [] } = req.body;

    // Validate query
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Query is required' });
    }

    let prescription = null;
    
    // If contextType is "prescription", fetch the user's latest prescription
    if (contextType === 'prescription') {
      prescription = await Prescription.findOne({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .lean();
    }

    // Call Groq API for chatbot response
    let response;
    
    try {
      response = await callGroqAPI(query, contextType, prescription, messages);
    } catch (error) {
      console.error('Groq API error:', error);
      // Provide mock response for demo purposes if API fails
      response = getMockResponse(query, prescription, messages);
    }

    // Return response
    return res.status(200).json({
      response
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    return res.status(500).json({ 
      error: 'Server error during chatbot query' 
    });
  }
};

/**
 * Call Groq API to get chatbot response
 * @param {string} query - The user's question
 * @param {string} contextType - The context type (prescription or general)
 * @param {object|null} prescription - The user's latest prescription (if available)
 * @param {Array} messages - Chat history in the format [{ role: string, content: string }]
 * @returns {string} - AI-generated response
 */
async function callGroqAPI(query, contextType, prescription, messages = []) {
  // Get API key from environment variables
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('Groq API key is not configured');
  }

  // Prepare API request messages
  let apiMessages = [];
  
  // If chat history provided and not empty, use it
  if (messages && messages.length > 0) {
    // Check if the last message matches the current query
    const lastMessage = messages[messages.length - 1];
    
    // If the last message is from the user and contains the current query, use the messages as is
    if (lastMessage.role === 'user' && lastMessage.content === query) {
      apiMessages = [...messages];
    } else {
      // Otherwise, add the current query to the history
      apiMessages = [
        ...messages,
        { role: 'user', content: query }
      ];
    }
    
    // Ensure that the first message is a system message
    let hasSystemMessage = false;
    for (const msg of apiMessages) {
      if (msg.role === 'system') {
        hasSystemMessage = true;
        break;
      }
    }
    
    // If no system message, add one at the beginning
    if (!hasSystemMessage) {
      const systemRole = contextType === 'prescription' 
        ? 'You are a helpful healthcare assistant specializing in medication advice and prescription information. Provide concise, accurate responses based on prescription details when available.'
        : 'You are a helpful healthcare assistant that provides concise, accurate responses to general health-related questions.';
      
      apiMessages.unshift({
        role: 'system',
        content: systemRole
      });
    }
    
    // If we have prescription data, update the system message
    if (contextType === 'prescription' && prescription?.analysis) {
      // Find the system message
      const systemIndex = apiMessages.findIndex(msg => msg.role === 'system');
      if (systemIndex !== -1) {
        const systemMessage = apiMessages[systemIndex].content;
        
        // Add prescription data to system message if it doesn't already have it
        if (!systemMessage.includes('prescription with information')) {
          // Create a simplified description without full JSON objects
          const durationInfo = prescription.analysis.duration || {};
          const totalDays = durationInfo.total_days || 'unspecified';
          const frequency = durationInfo.frequency || 'unspecified';
          const timing = durationInfo.timing || 'unspecified';
          
          // Add context without detailed JSON which can cause problems
          apiMessages[systemIndex].content = `${systemMessage} The user has a prescription with information about:` +
            ` Duration (${totalDays} days, ${frequency}, ${timing}),` +
            ` Precautions (dietary restrictions, activity limitations, side effects),` +
            ` and Warnings (drug interactions, contraindications).` +
            ` Please consider this context when answering their questions.`;
        }
      }
    }
  } else {
    // Otherwise build a default message array
    const systemRole = contextType === 'prescription' 
      ? 'You are a helpful healthcare assistant specializing in medication advice and prescription information. Provide concise, accurate responses (1-2 sentences) based on prescription details when available.'
      : 'You are a helpful healthcare assistant that provides concise, accurate responses to general health-related questions. Keep responses short (1-2 sentences) for demonstration purposes.';
    
    apiMessages = [
      {
        role: 'system',
        content: systemRole
      }
    ];

    // Add prescription context if available
    if (contextType === 'prescription' && prescription?.analysis) {
      // Create a simplified description without full JSON objects
      const durationInfo = prescription.analysis.duration || {};
      const totalDays = durationInfo.total_days || 'unspecified';
      const frequency = durationInfo.frequency || 'unspecified';
      const timing = durationInfo.timing || 'unspecified';
      
      // Add context without detailed JSON which can cause problems
      apiMessages[0].content += ` The user has a prescription with information about:` +
        ` Duration (${totalDays} days, ${frequency}, ${timing}),` +
        ` Precautions (dietary restrictions, activity limitations, side effects),` +
        ` and Warnings (drug interactions, contraindications).` +
        ` Please consider this context when answering their questions.`;
    }
    
    // Add the current query
    apiMessages.push({
      role: 'user',
      content: query
    });
  }

  try {
    // Log the final message array (excluding sensitive data)
    console.log('Sending messages to Groq API:', 
      apiMessages.map(m => ({ role: m.role, contentLength: m.content.length }))
    );
    
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: apiMessages,
        temperature: 0.2,
        max_tokens: 256 // Short response for demo
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling Groq API:', error.message);
    throw error;
  }
}

/**
 * Generate a mock response for demo purposes
 * @param {string} query - The user's question
 * @param {object|null} prescription - The user's latest prescription (if available)
 * @param {Array} messages - Chat history in the format [{ role: string, content: string }]
 * @returns {string} - Mock response
 */
function getMockResponse(query, prescription, messages = []) {
  console.log('Using mock response for:', query);
  
  // Get context from chat history if available
  if (messages && messages.length > 1) {
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    
    // Log some information about the conversation history
    console.log(`Mock response with history: ${userMessages.length} user messages, ${assistantMessages.length} assistant messages`);
    
    // If this is a follow-up question, provide more contextual responses
    if (userMessages.length > 1) {
      const previousUserMessage = userMessages[userMessages.length - 2].content;
      const lastAssistantMessage = assistantMessages.length > 0 ? 
        assistantMessages[assistantMessages.length - 1].content : '';
      
      // Simple follow-up detection
      if (query.toLowerCase().includes('why') && lastAssistantMessage) {
        return `To elaborate further: ${lastAssistantMessage} This is based on medical best practices and research. Always consult your doctor for personalized advice.`;
      }
      
      if (query.toLowerCase().includes('thanks') || query.toLowerCase().includes('thank you')) {
        return "You're welcome! Feel free to ask if you have any other questions about your health or medication.";
      }
      
      if (query.toLowerCase().includes('more') || query.toLowerCase().includes('additional')) {
        return "For additional information, I recommend discussing with your healthcare provider as they can provide personalized guidance based on your complete medical history.";
      }
    }
  }
  
  // Fall back to regular response logic
  const lowerQuery = query.toLowerCase();
  
  // If prescription context exists
  if (prescription) {
    const medication = prescription.ocrText.toLowerCase();
    
    // Medication-specific responses
    if (medication.includes('amoxicillin')) {
      if (lowerQuery.includes('skip') && lowerQuery.includes('dose')) {
        return "Do not skip doses of Amoxicillin; take as prescribed to ensure the infection is properly treated.";
      }
      if (lowerQuery.includes('food') || lowerQuery.includes('eat')) {
        return "Amoxicillin can be taken with or without food, but taking it with a meal may help reduce stomach upset.";
      }
      if (lowerQuery.includes('alcohol') || lowerQuery.includes('drink')) {
        return "It's best to avoid alcohol while taking Amoxicillin as it can increase side effects like stomach upset and make you feel more tired.";
      }
      if (lowerQuery.includes('side effect')) {
        return "Common side effects of Amoxicillin include diarrhea, stomach upset, and rash. Contact your doctor if you experience severe side effects.";
      }
    } else if (medication.includes('lisinopril')) {
      if (lowerQuery.includes('skip') && lowerQuery.includes('dose')) {
        return "If you miss a dose of Lisinopril, take it as soon as you remember. If it's almost time for your next dose, skip the missed dose and continue your regular schedule.";
      }
      if (lowerQuery.includes('food') || lowerQuery.includes('eat')) {
        return "Lisinopril can be taken with or without food. Maintain a low-sodium diet as recommended by your doctor.";
      }
      if (lowerQuery.includes('alcohol') || lowerQuery.includes('drink')) {
        return "Limit alcohol consumption while taking Lisinopril as it can enhance the blood pressure-lowering effect and cause dizziness.";
      }
      if (lowerQuery.includes('side effect')) {
        return "Common side effects of Lisinopril include dry cough, dizziness, and headache. Contact your doctor if these persist or worsen.";
      }
    }
    
    // Generic prescription-related responses
    if (lowerQuery.includes('skip') && lowerQuery.includes('dose')) {
      return "Generally, it's important not to skip doses of your medication. If you miss a dose, follow the guidance in your prescription or consult your doctor.";
    }
    if (lowerQuery.includes('side effect')) {
      return "Every medication can have side effects. Monitor how you feel and report any unusual symptoms to your healthcare provider.";
    }
  }
  
  // General health advice responses
  if (lowerQuery.includes('diabetes') && (lowerQuery.includes('diet') || lowerQuery.includes('food'))) {
    return "For diabetes management, focus on low-carb foods, plenty of vegetables, lean proteins, and whole grains. Consult a nutritionist for personalized advice.";
  }
  if (lowerQuery.includes('blood pressure') || lowerQuery.includes('hypertension')) {
    return "To manage blood pressure, reduce sodium intake, exercise regularly, maintain a healthy weight, and take medications as prescribed.";
  }
  if (lowerQuery.includes('sleep') || lowerQuery.includes('insomnia')) {
    return "For better sleep, maintain a consistent schedule, avoid screens before bed, limit caffeine, and create a comfortable sleep environment.";
  }
  if (lowerQuery.includes('stress') || lowerQuery.includes('anxiety')) {
    return "To manage stress, try deep breathing exercises, regular physical activity, adequate sleep, and mindfulness practices.";
  }
  if (lowerQuery.includes('headache') || lowerQuery.includes('migraine')) {
    return "For headaches, ensure you're hydrated, get enough rest, and consider over-the-counter pain relievers. Consult a doctor for frequent or severe headaches.";
  }
  
  // Default response
  return "I recommend consulting with your healthcare provider for personalized advice on this matter. They can provide guidance specific to your health situation.";
} 