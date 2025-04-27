
import { motion } from 'framer-motion';

export const DoctorHeader = () => {
  return (
    <motion.div 
      className="bg-gradient-to-r from-medical-primary to-medical-secondary py-16 md:py-20"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          Meet Our Expert Doctors
        </h1>
        <p className="text-blue-50 text-lg md:text-xl max-w-3xl mx-auto">
          Connect with board-certified specialists who provide personalized care through secure video consultations.
        </p>
      </div>
    </motion.div>
  );
};
