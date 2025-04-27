const Prescription = require('../models/Prescription');
const axios = require('axios');
const { Groq } = require("groq-sdk");
const fs = require('fs');
const path = require('path');
const os = require('os');

// Create a Groq client instance
const createGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API key is not configured');
  }
  console.log('Creating Groq client with API key:', apiKey.substring(0, 8) + '...');
  try {
    return new Groq({ apiKey });
  } catch (error) {
    console.error('Error creating Groq client:', error);
    throw new Error(`Failed to initialize Groq client: ${error.message}`);
  }
};

/**
 * @desc    Extract text from prescription image using Llama Scout
 * @route   POST /api/prescriptions/extract-text
 * @access  Private
 */
exports.extractTextFromImage = async (req, res) => {
  let imagePath = null;
  
  try {
    // Check if file exists in the request
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    console.log('File upload received:', req.file.originalname);
    
    // Handle both disk storage and memory storage
    let imageBuffer;
    let base64Image;
    
    if (req.file.buffer) {
      // Memory storage (for Vercel)
      console.log('Using memory storage mode (Vercel)');
      imageBuffer = req.file.buffer;
      base64Image = imageBuffer.toString('base64');
    } else {
      // Disk storage (for local development)
      console.log('Using disk storage mode');
      imagePath = req.file.path;
      imageBuffer = fs.readFileSync(imagePath);
      base64Image = imageBuffer.toString('base64');
    }
    
    console.log('Image converted to base64, size:', base64Image.length);
      
    // Get MIME type safely
    const mimeType = req.file.mimetype || 'image/jpeg';
    console.log('Using MIME type:', mimeType);
    
    try {
      // Initialize Groq client
      const groq = createGroqClient();
      
      console.log('Sending image to Groq API with Llama Scout...');
      
      // Prepare the prompt for Llama Scout to extract text from the image
      const response = await groq.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "This is a prescription image. Please extract all text visible in this image as accurately as possible. Focus on medication names, dosages, instructions, and any other text that appears on the prescription. Return only the extracted text, formatted in a clear and readable way. Do not add any additional commentary or explanations."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        temperature: 0.1, // Lower temperature for more deterministic output
        max_tokens: 4096
      });
      
      console.log('Received response from Groq API');
      
      // Clean up the temporary file if using disk storage
      if (imagePath) {
        try {
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log('Deleted temporary file:', imagePath);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up temporary file:', cleanupError);
          // Continue processing, don't throw error for cleanup issues
        }
      }
      
      // Extract the text from the response
      const extractedText = response.choices[0].message.content.trim();
      
      console.log('Text extracted successfully from image, length:', extractedText.length);
      console.log('Sample text:', extractedText.substring(0, 100) + '...');
      
      return res.status(200).json({
        success: true,
        data: {
          text: extractedText
        }
      });
      
    } catch (error) {
      console.error('Error extracting text from image:', error);
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error).reduce((a, p) => { a[p] = error[p]; return a; }, {})));
      
      // Clean up the temporary file if using disk storage
      if (imagePath) {
        try {
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up temporary file:', cleanupError);
        }
      }
      
      return res.status(500).json({
        success: false,
        error: 'Failed to extract text from image: ' + error.message
      });
    }
  } catch (error) {
    console.error('Error processing image upload:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error).reduce((a, p) => { a[p] = error[p]; return a; }, {})));
    
    // Clean up the temporary file if using disk storage
    if (imagePath) {
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up temporary file:', cleanupError);
      }
    }
    
    return res.status(400).json({
      success: false,
      error: 'Error processing image upload: ' + error.message
    });
  }
};

/**
 * @desc    Analyze prescription using Groq API
 * @route   POST /api/prescriptions/analyze
 * @access  Private
 */
exports.analyzePrescription = async (req, res) => {
  try {
    const { ocrText } = req.body;

    if (!ocrText) {
      return res.status(400).json({ success: false, message: 'OCR text is required' });
    }

    console.log('=== PRESCRIPTION ANALYSIS START ===');
    console.log('Received OCR text for analysis:', ocrText.substring(0, 100) + '...');

    // Extract structured information from raw OCR text
    const extractedInfo = await extractMedicationInfo(ocrText);
    console.log('Extracted Info:', JSON.stringify(extractedInfo, null, 2));

    // If no medications were found, generate a basic analysis
    if (extractedInfo.medicationCount === 0) {
      console.log('No medications found, generating basic analysis');
      const basicAnalysis = {
        precautions: {
          dietary_restrictions: ["Take your medication at the same time each day in relation to your meals"],
          activity_limitations: ["Until you know how this medication affects you, be careful with driving or operating machinery"],
          side_effects: ["Contact your doctor if you notice any unusual changes in how you feel"]
        },
        duration: {
          total_days: null,
          frequency: "Take as prescribed by your doctor",
          timing: "Follow your doctor's instructions"
        },
        warnings: {
          drug_interactions: ["Tell your doctor about all medications you're taking, including over-the-counter medicines"],
          contraindications: ["Tell your doctor about any allergies or health conditions you have"],
          overdose_symptoms: ["Seek emergency medical attention if you think you've taken too much"]
        }
      };
      console.log('Basic Analysis:', JSON.stringify(basicAnalysis, null, 2));
      return res.status(200).json({
        success: true,
        data: basicAnalysis
      });
    }

    // Analyze the structured text for safety information
    try {
      console.log('Analyzing medication safety for structured text:', JSON.stringify(extractedInfo.structuredText, null, 2));
      const analysis = await analyzeMedicationSafety(extractedInfo.structuredText);
      console.log('Safety Analysis Result:', JSON.stringify(analysis, null, 2));

      // Ensure we have a properly structured response
      const finalAnalysis = {
        precautions: {
          dietary_restrictions: analysis.precautions?.dietary_restrictions || ["Take your medication at the same time each day in relation to your meals"],
          activity_limitations: analysis.precautions?.activity_limitations || ["Until you know how this medication affects you, be careful with driving or operating machinery"],
          side_effects: analysis.precautions?.side_effects || ["Contact your doctor if you notice any unusual changes in how you feel"]
        },
        duration: {
          total_days: analysis.duration?.total_days || null,
          frequency: analysis.duration?.frequency || "Take as prescribed by your doctor",
          timing: analysis.duration?.timing || "Follow your doctor's instructions"
        },
        warnings: {
          drug_interactions: analysis.warnings?.drug_interactions || ["Tell your doctor about all medications you're taking, including over-the-counter medicines"],
          contraindications: analysis.warnings?.contraindications || ["Tell your doctor about any allergies or health conditions you have"],
          overdose_symptoms: analysis.warnings?.overdose_symptoms || ["Seek emergency medical attention if you think you've taken too much"]
        }
      };

      console.log('Final Analysis:', JSON.stringify(finalAnalysis, null, 2));
      return res.status(200).json({
        success: true,
        data: finalAnalysis
      });
    } catch (analysisError) {
      console.error('Error in medication safety analysis:', analysisError.message);
      // Return a basic analysis if safety analysis fails
      const fallbackAnalysis = {
        precautions: {
          dietary_restrictions: ["Take your medication at the same time each day in relation to your meals"],
          activity_limitations: ["Until you know how this medication affects you, be careful with driving or operating machinery"],
          side_effects: ["Contact your doctor if you notice any unusual changes in how you feel"]
        },
        duration: {
          total_days: null,
          frequency: "Take as prescribed by your doctor",
          timing: "Follow your doctor's instructions"
        },
        warnings: {
          drug_interactions: ["Tell your doctor about all medications you're taking, including over-the-counter medicines"],
          contraindications: ["Tell your doctor about any allergies or health conditions you have"],
          overdose_symptoms: ["Seek emergency medical attention if you think you've taken too much"]
        }
      };
      console.log('Fallback Analysis:', JSON.stringify(fallbackAnalysis, null, 2));
      return res.status(200).json({
        success: true,
        data: fallbackAnalysis
      });
    }
  } catch (error) {
    console.error('Error analyzing prescription:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: 'An error occurred while analyzing the prescription',
      error: error.message
    });
  }
};

/**
 * @desc    Extract structured medication info from raw OCR text
 * @route   POST /api/prescriptions/preprocess
 * @access  Private
 */
exports.preprocessText = async (req, res) => {
  try {
    const { ocrText } = req.body;

    // Validate ocrText
    if (!ocrText || ocrText.trim() === '') {
      return res.status(400).json({ error: 'OCR text required' });
    }

    // Call Groq API to extract structured medication info
    let extractedData;
    
    try {
      extractedData = await extractMedicationInfo(ocrText);
    } catch (error) {
      console.error('Groq API extraction error:', error);
      // If AI extraction fails, return the original text
      return res.status(200).json({
        success: true,
        data: {
          structuredText: ocrText,
          medicationCount: 0,
          isAiProcessed: false
        }
      });
    }

    // Return the extracted structured data
    return res.status(200).json({
      success: true,
      data: extractedData
    });
  } catch (error) {
    console.error('Text preprocessing error:', error);
    return res.status(500).json({ 
      error: 'Server error during text preprocessing' 
    });
  }
};

/**
 * Call Groq API to analyze prescription text
 * @param {string} ocrText - The OCR text from the prescription
 * @returns {object} - Structured analysis of the prescription
 */
async function callGroqAPI(ocrText) {
  // Log the text being analyzed to help debug
  console.log('=== ANALYZING TEXT ===');
  console.log(ocrText);
  console.log('=====================');

  // Get API key from environment variables
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('Groq API key is not configured');
  }

  // Enhanced prompt with more direct instructions
  const prompt = {
    "prescription_text": ocrText,
    "instructions": "You are analyzing a prescription text. Extract ANY medication names mentioned (like lisinopril, metformin, etc.) and provide information about them.",
    "output_format": {
      "precautions": {
        "dietary_restrictions": ["List at least 2-3 common dietary restrictions for medications mentioned"],
        "activity_limitations": ["List at least 2-3 activity warnings for medications mentioned"],
        "side_effects": ["List at least 3-5 important side effects for medications mentioned"]
      },
      "duration": {
        "total_days": "Estimate treatment duration or null if unclear",
        "frequency": "Dosing frequency (e.g., 'Once daily', 'Twice daily')",
        "timing": "When to take (e.g., 'With meals', 'Before bed')"
      },
      "warnings": {
        "drug_interactions": ["List at least 2-3 common drug interactions"],
        "contraindications": ["List at least 2-3 contraindications"],
        "overdose_symptoms": ["List at least 2-3 overdose symptoms"]
      }
    }
  };

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a pharmacist analyzing prescriptions. ALWAYS provide useful information about ANY medication terms you find. If unsure, provide general information that would be helpful for common medications. Your ENTIRE response must be a valid JSON object with no other text.'
          },
          {
            role: 'user',
            content: JSON.stringify(prompt)
          }
        ],
        temperature: 0.7, // Increased temperature for more creative responses
        max_tokens: 2048
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Parse response and extract analysis
    try {
      const content = response.data.choices[0].message.content;
      
      // Debug: Log the raw API response to terminal
      console.log('=== RAW GROQ API RESPONSE ===');
      console.log(content);
      console.log('=============================');
      
      // Try multiple parsing approaches
      try {
        // First try direct parse
        return JSON.parse(content);
      } catch (directParseError) {
        console.log('Direct JSON parsing failed. Trying regex extraction...');
        // Try to extract JSON with regex
        const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
          console.log('JSON regex match found. Parsing extracted JSON...');
        return JSON.parse(jsonMatch[0]);
      } else {
          console.log('No JSON object found with regex. Trying to clean content...');
          // Last resort - try to fix common issues with the JSON
          const cleanedContent = content
            .replace(/```json|```/g, '') // Remove markdown code blocks
            .trim();
          console.log('Cleaned content:', cleanedContent);
          return JSON.parse(cleanedContent);
        }
      }
    } catch (parseError) {
      console.error('Error parsing Groq API response:', parseError);
      
      // Generate meaningful fallback data based on the text content
      console.log('Generating fallback analysis data based on text content...');
      return generateFallbackAnalysis(ocrText);
    }
  } catch (error) {
    console.error('Error calling Groq API:', error.message);
    // Generate meaningful fallback data based on the text content
    console.log('Generating fallback analysis data based on text content...');
    return generateFallbackAnalysis(ocrText);
  }
}

// Common frequency patterns to validate against
const validFrequencyPatterns = [
  'once daily', 'twice daily', 'three times daily', 'four times daily',
  'every morning', 'every night', 'every evening',
  'every 4 hours', 'every 6 hours', 'every 8 hours', 'every 12 hours',
  'as needed', 'with meals', 'before meals', 'after meals',
  'weekly', 'monthly', 'daily'
];

// Common timing patterns to validate against
const validTimingPatterns = [
  'before breakfast', 'after breakfast', 'before lunch', 'after lunch',
  'before dinner', 'after dinner', 'at bedtime', 'in the morning',
  'in the evening', 'with food', 'on empty stomach', 'with meals',
  'before meals', 'after meals'
];

/**
 * Validate and clean duration information
 * @param {string|number} duration - The duration value to validate
 * @returns {number|null} - Validated duration or null if invalid
 */
function validateDuration(duration) {
  if (!duration) return null;
  
  // Convert to string and clean up
  const durationStr = String(duration).toLowerCase().trim();
  
  // Try to extract number of days
  const daysMatch = durationStr.match(/(\d+)\s*(day|days|d)/i);
  if (daysMatch) {
    return parseInt(daysMatch[1]);
  }
  
  // Try to extract number of weeks and convert to days
  const weeksMatch = durationStr.match(/(\d+)\s*(week|weeks|w)/i);
  if (weeksMatch) {
    return parseInt(weeksMatch[1]) * 7;
  }
  
  // Try to extract number of months and convert to days (approximate)
  const monthsMatch = durationStr.match(/(\d+)\s*(month|months|m)/i);
  if (monthsMatch) {
    return parseInt(monthsMatch[1]) * 30;
  }
  
  // If it's just a number, assume it's days
  const numberMatch = durationStr.match(/^(\d+)$/);
  if (numberMatch) {
    return parseInt(numberMatch[1]);
  }
  
  return null;
}

/**
 * Validate and clean frequency information
 * @param {string} frequency - The frequency value to validate
 * @returns {string} - Validated frequency or default message
 */
function validateFrequency(frequency) {
  if (!frequency) return 'Take as prescribed by your doctor';
  
  const freqLower = frequency.toLowerCase().trim();
  
  // Check against valid patterns
  for (const pattern of validFrequencyPatterns) {
    if (freqLower.includes(pattern)) {
      return frequency.trim();
    }
  }
  
  // Try to extract numeric frequency
  const numericMatch = freqLower.match(/(\d+)\s*times?\s*(daily|a day|per day)/i);
  if (numericMatch) {
    return `${numericMatch[1]} time${numericMatch[1] === '1' ? '' : 's'} daily`;
  }
  
  // If no valid pattern is found, return default
  return 'Take as prescribed by your doctor';
}

/**
 * Validate and clean timing information
 * @param {string} timing - The timing value to validate
 * @returns {string} - Validated timing or default message
 */
function validateTiming(timing) {
  if (!timing) return 'Follow your doctor\'s instructions';
  
  const timingLower = timing.toLowerCase().trim();
  
  // Check against valid patterns
  for (const pattern of validTimingPatterns) {
    if (timingLower.includes(pattern)) {
      return timing.trim();
    }
  }
  
  // If no valid pattern is found, return default
  return 'Follow your doctor\'s instructions';
}

/**
 * Extract medication information from raw OCR text
 * @param {string} ocrText - The raw OCR text
 * @returns {Promise<Object>} The structured medication information
 */
async function extractMedicationInfo(ocrText) {
  try {
    console.log('=== PREPROCESSING TEXT ===');
    // Clean up OCR text for better processing
    const cleanedText = cleanPrescriptionText(ocrText);
    console.log('Text length after cleaning:', cleanedText.length);
    
    // Check for API key
    if (!process.env.GROQ_API_KEY) {
      console.warn('GROQ_API_KEY not found in environment variables. Using fallback analysis.');
      return { 
        structuredText: { text: cleanedText, medications: [] }, 
        medicationCount: 0,
        isAiProcessed: false 
      };
    }

    // Use Groq API to structure the medication information
    const prompt = `
      Analyze the following prescription text and extract medication information in a structured JSON format.
      Include medication names, dosages, frequencies, durations, and any special instructions.
      Format your response as a JSON object with this exact structure:
      {
        "medications": [
          {
            "name": "medication name",
            "dosage": "dosage information",
            "frequency": "how often to take (e.g., once daily, twice daily)",
            "duration": "duration in days or specific period",
            "specialInstructions": "timing or special instructions (e.g., with food, before meals)"
          }
        ],
        "text": "original prescription text"
      }
      
      Here is the prescription text to analyze:
      ${cleanedText}
    `;

    console.log('Calling Groq API for medication extraction...');
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a pharmacist extracting medication information from prescriptions. Format your ENTIRE response as a valid JSON object with medications array and text field. Each medication should have name, dosage, frequency, duration, and specialInstructions fields. Use clear, standardized terms for frequency and timing.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1024
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the JSON from the response
    const contentText = response.data.choices[0].message.content;
    console.log('API Response received, length:', contentText.length);
    console.log('Raw API response:', contentText);
    
    let jsonData;
    try {
      // Try direct JSON parsing first
      jsonData = JSON.parse(contentText);
    } catch (parseError) {
      console.log('Direct parsing failed, trying regex extraction');
      // Try to extract JSON with regex if direct parsing fails
      const jsonMatch = contentText.match(/```(?:json)?\s*({[\s\S]*?})\s*```/) || contentText.match(/{[\s\S]*"medications"[\s\S]*}/);
      
      if (!jsonMatch) {
        console.warn('Failed to extract JSON from API response, returning cleaned text');
        return { 
          structuredText: { text: cleanedText, medications: [] }, 
          medicationCount: 0,
          isAiProcessed: false 
        };
      }

      jsonData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    }

    // Validate and clean the extracted data
    if (jsonData.medications && Array.isArray(jsonData.medications)) {
      jsonData.medications = jsonData.medications.map(med => ({
        name: med.name || '',
        dosage: med.dosage || '',
        frequency: validateFrequency(med.frequency),
        duration: validateDuration(med.duration),
        specialInstructions: validateTiming(med.specialInstructions)
      }));
    } else {
      jsonData.medications = [];
    }

    // Ensure the original text is included
    jsonData.text = cleanedText;

    const medicationCount = jsonData.medications ? jsonData.medications.length : 0;
    console.log(`Successfully parsed JSON with ${medicationCount} medications`);
    console.log('Structured data:', JSON.stringify(jsonData, null, 2));

    return { 
      structuredText: jsonData, // Return the object directly instead of stringifying it
      medicationCount: medicationCount,
      isAiProcessed: true 
    };
  } catch (error) {
    console.error('Error in medication extraction:', error.message);
    // Provide a fallback
    return {
      structuredText: { text: cleanPrescriptionText(ocrText), medications: [] }, 
      medicationCount: 0,
      isAiProcessed: false 
    };
  }
}

/**
 * Clean prescription text to improve readability
 * @param {string} text - The raw OCR text
 * @returns {string} - The cleaned text
 */
function cleanPrescriptionText(text) {
  if (!text) return '';
  
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, ' ');
  
  // Fix common OCR issues
  cleaned = cleaned
    .replace(/([0-9])l/g, '$11') // Replace "l" with "1" after numbers
    .replace(/([0-9])I/g, '$11') // Replace "I" with "1" after numbers
    .replace(/O([0-9])/g, '0$1') // Replace "O" with "0" before numbers
    .replace(/rng/gi, 'mg')      // Fix common "mg" misreads
    .replace(/tabiet/gi, 'tablet') // Fix common "tablet" misreads
    .trim();
  
  return cleaned;
}

/**
 * Count potential medications in text based on common patterns
 * @param {string} text - The prescription text
 * @returns {number} - The estimated number of medications
 */
function countMedicationsInText(text) {
  // Common medication names and patterns to look for
  const commonMeds = [
    'lisinopril', 'metformin', 'atorvastatin', 'levothyroxine', 'amlodipine',
    'metoprolol', 'omeprazole', 'simvastatin', 'losartan', 'albuterol',
    'gabapentin', 'hydrochlorothiazide', 'sertraline', 'acetaminophen', 'ibuprofen',
    'amoxicillin', 'prednisone', 'escitalopram', 'citalopram', 'furosemide',
    'pantoprazole', 'montelukast', 'fluticasone', 'rosuvastatin', 'tramadol',
    'trazodone', 'cetirizine', 'alprazolam', 'cyclobenzaprine', 'meloxicam',
    'fluoxetine', 'duloxetine', 'bupropion', 'venlafaxine', 'carvedilol',
    'clopidogrel', 'warfarin', 'tamsulosin', 'clonazepam', 'ondansetron',
    'zolpidem', 'cefdinir', 'glipizide', 'ciprofloxacin', 'azithromycin',
    'doxycycline', 'lorazepam', 'naproxen', 'diazepam', 'methylprednisolone'
  ];
  
  // Common dosage patterns
  const dosagePatterns = [
    /\d+\s*mg/gi, /\d+\s*mcg/gi, /\d+\s*ml/gi, /\d+\s*tablet/gi, 
    /\d+\s*cap/gi, /\d+\s*pill/gi, /\d+\s*dose/gi
  ];
  
  // Common frequency patterns
  const frequencyPatterns = [
    /once\s*daily/gi, /twice\s*daily/gi, /\d+\s*times\s*daily/gi,
    /every\s*\d+\s*hours/gi, /every\s*morning/gi, /every\s*night/gi,
    /with\s*meals/gi, /before\s*meals/gi, /after\s*meals/gi,
    /as\s*needed/gi, /prn/gi, /q\d+h/gi, /qd/gi, /bid/gi, /tid/gi, /qid/gi
  ];
  
  // Count based on common medication names
  let count = 0;
  for (const med of commonMeds) {
    if (text.toLowerCase().includes(med.toLowerCase())) {
      count++;
    }
  }
  
  // Count based on dosage and frequency patterns
  let dosageMatches = 0;
  let frequencyMatches = 0;
  
  for (const pattern of dosagePatterns) {
    const matches = text.match(pattern) || [];
    dosageMatches += matches.length;
  }
  
  for (const pattern of frequencyPatterns) {
    const matches = text.match(pattern) || [];
    frequencyMatches += matches.length;
  }
  
  // Combine counts with heuristic, giving more weight to actual medication names
  const patternBasedCount = Math.min(dosageMatches, frequencyMatches);
  count = Math.max(count, patternBasedCount);
  
  console.log(`Medication count estimate: ${count} (named meds: ${count}, pattern matches: ${patternBasedCount})`);
  return count;
}

/**
 * Generate a fallback analysis based on the text content
 * @param {string} text - The text to analyze
 * @returns {object} - The generated fallback analysis
 */
function generateFallbackAnalysis(text) {
  // Implement the logic to generate a fallback analysis based on the text content
  // This is a placeholder and should be replaced with the actual implementation
  return {
    success: false,
    message: 'Fallback analysis generated due to error',
    data: {
      structuredText: { text: text, medications: [] },
      medicationCount: 0,
      isAiProcessed: false
    }
  };
}

/**
 * Analyze the structured text for safety information
 * @param {object} structuredText - The structured text to analyze
 * @returns {Promise<object>} - The analyzed safety information
 */
async function analyzeMedicationSafety(structuredText) {
  try {
    console.log('=== ANALYZING MEDICATION SAFETY ===');
    console.log('Input structured text:', JSON.stringify(structuredText, null, 2));

    // Get API key from environment variables
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY not found in environment variables');
    }

    // Create a prompt for safety analysis
    const prompt = {
      medications: structuredText.medications || [],
      request: `Analyze these medications and provide comprehensive safety information. Include specific details about:
      - Dietary restrictions and food interactions
      - Activity limitations and precautions
      - Common and serious side effects
      - Drug interactions
      - Contraindications
      - Signs of overdose
      
      Format your response exactly as a JSON object with this structure:
      {
        "precautions": {
          "dietary_restrictions": ["list specific food restrictions"],
          "activity_limitations": ["list specific activity warnings"],
          "side_effects": ["list important side effects"]
        },
        "duration": {
          "total_days": number or null,
          "frequency": "specific frequency",
          "timing": "specific timing instructions"
        },
        "warnings": {
          "drug_interactions": ["list specific drug interactions"],
          "contraindications": ["list specific contraindications"],
          "overdose_symptoms": ["list specific overdose symptoms"]
        }
      }`
    };

    console.log('Calling Groq API with prompt:', JSON.stringify(prompt, null, 2));

    // Call Groq API for safety analysis
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a pharmacist providing medication safety information. Your response must be a valid JSON object with no additional text. Use clear, specific language that patients can understand.'
          },
          {
            role: 'user',
            content: JSON.stringify(prompt)
          }
        ],
        temperature: 0.3,
        max_tokens: 2048
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Parse and validate the API response
    const content = response.data.choices[0].message.content;
    console.log('Raw Groq API Response:', content);
    
    let safetyInfo;
    try {
      // Try direct JSON parsing first
      safetyInfo = JSON.parse(content.trim());
    } catch (parseError) {
      console.error('Direct parsing failed:', parseError.message);
      // Try to extract JSON with regex
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        safetyInfo = JSON.parse(jsonMatch[0].trim());
      } else {
        throw new Error('Failed to parse safety information from API response');
      }
    }

    // Validate and ensure all required fields are present
    const validatedAnalysis = {
      precautions: {
        dietary_restrictions: safetyInfo.precautions?.dietary_restrictions || [],
        activity_limitations: safetyInfo.precautions?.activity_limitations || [],
        side_effects: safetyInfo.precautions?.side_effects || []
      },
      duration: {
        total_days: safetyInfo.duration?.total_days || null,
        frequency: safetyInfo.duration?.frequency || "Take as prescribed",
        timing: safetyInfo.duration?.timing || "Follow doctor's instructions"
      },
      warnings: {
        drug_interactions: safetyInfo.warnings?.drug_interactions || [],
        contraindications: safetyInfo.warnings?.contraindications || [],
        overdose_symptoms: safetyInfo.warnings?.overdose_symptoms || []
      }
    };

    // Add default messages if any section is empty
    if (validatedAnalysis.precautions.dietary_restrictions.length === 0) {
      validatedAnalysis.precautions.dietary_restrictions = ["Take medication at consistent times relative to meals"];
    }
    if (validatedAnalysis.precautions.activity_limitations.length === 0) {
      validatedAnalysis.precautions.activity_limitations = ["Monitor how medication affects you before driving or operating machinery"];
    }
    if (validatedAnalysis.precautions.side_effects.length === 0) {
      validatedAnalysis.precautions.side_effects = ["Contact your doctor if you experience any unusual symptoms"];
    }
    if (validatedAnalysis.warnings.drug_interactions.length === 0) {
      validatedAnalysis.warnings.drug_interactions = ["Inform healthcare providers about all medications you take"];
    }
    if (validatedAnalysis.warnings.contraindications.length === 0) {
      validatedAnalysis.warnings.contraindications = ["Discuss any allergies or health conditions with your doctor"];
    }
    if (validatedAnalysis.warnings.overdose_symptoms.length === 0) {
      validatedAnalysis.warnings.overdose_symptoms = ["Seek immediate medical attention if you suspect an overdose"];
    }

    console.log('Validated Analysis:', JSON.stringify(validatedAnalysis, null, 2));
    return validatedAnalysis;
  } catch (error) {
    console.error('Error in medication safety analysis:', error.message);
    throw error; // Let the calling function handle the error with appropriate fallback
  }
}

/**
 * @desc    Get prescription history for a user
 * @route   GET /api/prescriptions/history
 * @access  Private
 */
exports.getPrescriptionHistory = async (req, res) => {
  try {
    // Find all prescriptions for the current user
    const prescriptions = await Prescription.find({ userId: req.user.id })
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();
    
    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    console.error('Error fetching prescription history:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching prescription history'
    });
  }
};