
import { motion } from 'framer-motion';
import { FileSearch, Shield, Sparkles } from 'lucide-react';

export const PrescriptionHeader = () => {
  return (
    <motion.div 
      className="bg-gradient-to-r from-medical-secondary to-medical-accent py-16 md:py-20 relative overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {/* Animated floating pills background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div 
            key={i}
            className="absolute h-12 w-12 rounded-full bg-white/10"
            initial={{ 
              x: Math.random() * 100 - 50 + '%',
              y: Math.random() * 100 + '%',
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: [
                Math.random() * 100 + '%', 
                Math.random() * 20 + '%',
                Math.random() * 100 + '%'
              ]
            }}
            transition={{ 
              repeat: Infinity, 
              repeatType: "reverse", 
              duration: 10 + Math.random() * 20,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <motion.div 
            className="inline-flex items-center mb-4 bg-white/20 rounded-full px-4 py-1.5 text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            <span>AI-Powered Analysis</span>
          </motion.div>
          
          <motion.h1 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Prescription Analysis Tool
          </motion.h1>
          
          <motion.p 
            className="text-blue-50 text-lg md:text-xl max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Get detailed insights about your medications, potential interactions, and personalized health information.
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap justify-center gap-8 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <FileSearch size={20} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-white">Advanced Analysis</h3>
                <p className="text-blue-100 text-sm">Detailed medication insights</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <Shield size={20} className="text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-white">100% Secure</h3>
                <p className="text-blue-100 text-sm">HIPAA compliant data</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
