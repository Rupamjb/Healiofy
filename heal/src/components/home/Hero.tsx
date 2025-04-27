import { ArrowRight, FileSearch, CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <section className="pt-20 pb-24 overflow-hidden bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-block py-1 px-3 rounded-full bg-blue-50 text-medical-primary mb-4">
            <span className="text-sm font-medium flex items-center">
              <Shield className="mr-2 h-4 w-4" /> Trusted by thousands of patients
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Understand Your <span className="text-medical-primary">Medications</span> Better
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Our intelligent prescription analysis tool helps you identify potential drug interactions, 
            understand side effects, and get personalized recommendations.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
        >
          <Button size="lg" className="btn-primary font-medium text-base" asChild>
            <Link to="/prescription-analysis">
              Analyze Prescription <FileSearch className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="font-medium text-base" asChild>
            <Link to="/doctors">
              Find a Doctor <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        >
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <FileSearch className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Advanced Analysis</h3>
            <p className="text-gray-600">Get AI-powered insights about your medications and potential interactions.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast Results</h3>
            <p className="text-gray-600">Receive detailed analysis within seconds of submitting your prescription.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
            <p className="text-gray-600">Your health data is securely processed and never shared with third parties.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
