
import React, { useRef } from 'react';
import { 
  Stethoscope, 
  FileSearch, 
  Clock, 
  Shield, 
  Award, 
  MessageCircle,
  Pill,
  AlertCircle,
  ArrowRight  // Added this import
} from "lucide-react";
import { motion, useInView } from 'framer-motion';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  isPrimary?: boolean;
  link?: string;
}

const Feature = ({ icon, title, description, delay, isPrimary, link }: FeatureProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <motion.div 
      ref={ref}
      className={`${isPrimary 
        ? "md:col-span-3 bg-gradient-to-r from-medical-primary to-medical-secondary text-white" 
        : "bg-white border border-gray-100"} rounded-xl p-6 shadow-sm card-hover`}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.8, delay: delay / 1000, ease: "easeOut" }}
    >
      <div className={`h-12 w-12 rounded-lg ${isPrimary ? "bg-white/20" : "bg-blue-100"} flex items-center justify-center ${isPrimary ? "text-white" : "text-medical-primary"} mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className={`${isPrimary ? "text-blue-50" : "text-gray-600"} mb-4`}>{description}</p>
      {isPrimary && link && (
        <Button variant="outline" className="bg-white text-medical-primary hover:bg-blue-50" asChild>
          <Link to={link}>
            Try Prescription Analysis <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )}
    </motion.div>
  );
};

export const Features = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  
  const features = [
    {
      icon: <FileSearch size={24} />,
      title: "Advanced Prescription Analysis",
      description: "Our AI-powered tool identifies potential drug interactions, explains side effects, and provides personalized recommendations based on your medications.",
      delay: 100,
      isPrimary: true,
      link: "/prescription-analysis"
    },
    {
      icon: <Stethoscope size={24} />,
      title: "Expert Doctors",
      description: "Connect with board-certified doctors specializing in various fields of medicine.",
      delay: 200
    },
    {
      icon: <Pill size={24} />,
      title: "Medication Insights",
      description: "Get detailed information about your prescriptions, proper usage, and potential alternatives.",
      delay: 300
    },
    {
      icon: <Clock size={24} />,
      title: "24/7 Availability",
      description: "Get medical assistance anytime, day or night, from anywhere in the world.",
      delay: 400
    },
    {
      icon: <AlertCircle size={24} />,
      title: "Interaction Warnings",
      description: "Receive alerts about potentially dangerous drug interactions and side effects.",
      delay: 500
    },
    {
      icon: <Shield size={24} />,
      title: "Secure & Private",
      description: "Your health data is protected with end-to-end encryption and HIPAA compliance.",
      delay: 600
    },
    {
      icon: <MessageCircle size={24} />,
      title: "Instant Consultation",
      description: "No waiting rooms. Get connected to a doctor within minutes.",
      delay: 700
    },
    {
      icon: <Award size={24} />,
      title: "Quality Care",
      description: "We maintain the highest standards of medical care and patient satisfaction.",
      delay: 800
    }
  ];
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Platform</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We combine cutting-edge technology with exceptional medical expertise to provide you with the best healthcare experience.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Feature key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};
