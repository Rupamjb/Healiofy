const axios = require('axios');

/**
 * Simple test script to verify the chatbot API endpoint
 */
async function testChatbotAPI() {
  console.log('Testing chatbot API...');
  
  try {
    // First, register a new test user
    console.log('Registering new test user...');
    
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
      email: 'chatbottest@example.com',
      password: 'test1234'
    }).catch(error => {
      // If registration fails, it might be because the user already exists
      // We'll continue with login in that case
      console.log('Registration skipped - user might already exist');
      return null;
    });
    
    // Now log in to get a token
    console.log('Logging in to get authentication token...');
    const authResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'chatbottest@example.com',
      password: 'test1234'
    });
    
    const token = authResponse.data.token;
    console.log('Successfully obtained token');
    
    // Test general health query
    console.log('\nTesting general health query...');
    const generalResponse = await axios.post(
      'http://localhost:5000/api/chatbot',
      {
        query: 'What are some tips for better sleep?',
        contextType: 'general'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('General query response:', generalResponse.data);
    
    // Test prescription query
    console.log('\nTesting prescription query...');
    const prescriptionResponse = await axios.post(
      'http://localhost:5000/api/chatbot',
      {
        query: 'What are the side effects of my medication?',
        contextType: 'prescription'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('Prescription query response:', prescriptionResponse.data);
    
    console.log('\nChatbot API tests completed successfully');
  } catch (error) {
    console.error('Error testing chatbot API:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    console.error('Full error config:', error.config);
  }
}

// Run the test
testChatbotAPI(); 