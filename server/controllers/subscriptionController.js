const StellarSdk = require('stellar-sdk');
const User = require('../models/User');

// Configure Stellar SDK for Testnet
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

// Platform's Stellar account (you'll need to create and fund this)
const platformAccount = process.env.STELLAR_PLATFORM_ACCOUNT;

// Subscription price in XLM
const SUBSCRIPTION_PRICE_XLM = 100;

/**
 * @desc    Get user subscription status
 * @route   GET /api/subscription/status
 * @access  Private
 */
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if subscription has expired
    if (user.subscriptionStatus === 'active' && 
        user.subscriptionEndDate && 
        new Date(user.subscriptionEndDate) < new Date()) {
      // Update subscription status to inactive
      user.subscriptionStatus = 'inactive';
      await user.save();
    }
    
    const subscriptionData = {
      status: user.subscriptionStatus,
      trialAnalysesRemaining: user.trialAnalysesRemaining,
      trialConsultationsRemaining: user.trialConsultationsRemaining,
      subscriptionEndDate: user.subscriptionEndDate,
      requiresPayment: user.subscriptionStatus === 'inactive' || 
                      (user.subscriptionStatus === 'trial' && 
                       user.trialAnalysesRemaining === 0 && 
                       user.trialConsultationsRemaining === 0)
    };

    return res.status(200).json({
      success: true,
      data: subscriptionData
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * @desc    Create a Stellar payment transaction
 * @route   POST /api/subscription/payment/create
 * @access  Private
 */
exports.createPaymentTransaction = async (req, res) => {
  try {
    if (!platformAccount) {
      return res.status(500).json({
        success: false,
        error: 'Platform Stellar account not configured'
      });
    }
    
    const { userPublicKey } = req.body;
    
    if (!userPublicKey) {
      return res.status(400).json({
        success: false,
        error: 'User Stellar public key is required'
      });
    }
    
    // Load user account details from Stellar network
    let userAccount;
    try {
      userAccount = await server.loadAccount(userPublicKey);
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Stellar account or account not funded. Please use Friendbot to fund your Testnet account.'
      });
    }

    // Build the transaction
    const transaction = new StellarSdk.TransactionBuilder(userAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: platformAccount,
        asset: StellarSdk.Asset.native(), // XLM
        amount: SUBSCRIPTION_PRICE_XLM.toString()
      }))
      .setTimeout(180) // 3 minutes timeout
      .build();

    // Convert transaction to XDR format
    const transactionXDR = transaction.toXDR();

    // Store user's Stellar address
    const user = await User.findById(req.user._id);
    user.stellarAddress = userPublicKey;
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        transactionXDR,
        amount: SUBSCRIPTION_PRICE_XLM
      }
    });
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    return res.status(500).json({
      success: false,
      error: 'Error creating payment transaction'
    });
  }
};

/**
 * @desc    Verify and process a submitted Stellar transaction
 * @route   POST /api/subscription/payment/verify
 * @access  Private
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { signedTransactionXDR } = req.body;
    
    if (!signedTransactionXDR) {
      return res.status(400).json({
        success: false,
        error: 'Signed transaction is required'
      });
    }
    
    // Convert XDR back to a transaction object
    const transaction = StellarSdk.TransactionBuilder.fromXDR(
      signedTransactionXDR,
      networkPassphrase
    );
    
    // Verify the transaction has exactly one payment operation to the platform account
    let isValid = false;
    let paymentAmount = 0;
    
    if (transaction.operations && transaction.operations.length === 1) {
      const operation = transaction.operations[0];
      if (
        operation.type === 'payment' &&
        operation.destination === platformAccount &&
        operation.asset.isNative() // XLM
      ) {
        paymentAmount = parseFloat(operation.amount);
        isValid = paymentAmount >= SUBSCRIPTION_PRICE_XLM;
      }
    }
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction. Must be a payment of at least ' + 
               SUBSCRIPTION_PRICE_XLM + ' XLM to the platform account.'
      });
    }
    
    // Submit the transaction to the Stellar network
    try {
      const result = await server.submitTransaction(transaction);
      
      if (result.successful) {
        // Update user's subscription status
        const user = await User.findById(req.user._id);
        
        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found'
          });
        }
        
        // Set subscription status to active
        user.subscriptionStatus = 'active';
        
        // Set subscription start date to now
        const startDate = new Date();
        user.subscriptionStartDate = startDate;
        
        // Set subscription end date to 30 days from now
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30); // 30 days subscription
        user.subscriptionEndDate = endDate;
        
        await user.save();
        
        return res.status(200).json({
          success: true,
          data: {
            message: 'Payment successful! Your subscription is now active.',
            startDate,
            endDate,
            transactionId: result.id
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Transaction submission failed'
        });
      }
    } catch (error) {
      console.error('Stellar transaction submission error:', error);
      return res.status(400).json({
        success: false,
        error: 'Error submitting Stellar transaction: ' + (error.message || 'Unknown error')
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * @desc    Create a test Stellar account (for hackathon demo)
 * @route   POST /api/subscription/testaccount
 * @access  Private
 */
exports.createTestAccount = async (req, res) => {
  try {
    // Create a new random Stellar keypair
    const keypair = StellarSdk.Keypair.random();
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();
    
    // Fund the account using Friendbot (Stellar testnet faucet)
    try {
      const response = await fetch(
        `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
      );
      await response.json();
      
      return res.status(200).json({
        success: true,
        data: {
          publicKey,
          secretKey,
          message: 'Test account created and funded with Testnet XLM'
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Error funding test account with Friendbot'
      });
    }
  } catch (error) {
    console.error('Error creating test account:', error);
    return res.status(500).json({
      success: false,
      error: 'Error creating test Stellar account'
    });
  }
};

/**
 * @desc    Process test payment directly (for hackathon demo)
 * @route   POST /api/subscription/payment/test
 * @access  Private
 */
exports.processTestPayment = async (req, res) => {
  try {
    const { publicKey, secretKey } = req.body;
    
    if (!publicKey || !secretKey) {
      return res.status(400).json({
        success: false,
        error: 'Public key and secret key are required'
      });
    }
    
    // Validate the keypair
    let keypair;
    try {
      keypair = StellarSdk.Keypair.fromSecret(secretKey);
      
      // Verify the public key matches
      if (keypair.publicKey() !== publicKey) {
        throw new Error('Public key does not match secret key');
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Stellar keypair'
      });
    }
    
    // Update user's subscription status directly
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Set subscription status to active
    user.subscriptionStatus = 'active';
    
    // Set subscription start date to now
    const startDate = new Date();
    user.subscriptionStartDate = startDate;
    
    // Set subscription end date to 30 days from now
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30 days subscription
    user.subscriptionEndDate = endDate;
    
    // Store the test Stellar address
    user.stellarAddress = publicKey;
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      data: {
        message: 'Test payment successful! Your subscription is now active.',
        startDate,
        endDate,
        transactionId: 'test_transaction_' + Date.now()
      }
    });
  } catch (error) {
    console.error('Error processing test payment:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
}; 