
import { useRef } from 'react';
import { QuoteIcon } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

const testimonials = [
  {
    content: "The prescription analysis tool saved me from a potential drug interaction. The doctors here are responsive and knowledgeable. Highly recommend!",
    author: "Sarah Johnson",
    role: "Patient",
    avatar: "https://randomuser.me/api/portraits/women/45.jpg"
  },
  {
    content: "As a busy professional, Healiofy has been a game-changer. I can consult with specialists without taking time off work. The interface is intuitive and the service is excellent.",
    author: "Michael Chen",
    role: "Software Engineer",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    content: "The detailed analysis of my prescriptions helped me understand my treatment plan better. The doctors take time to explain everything clearly.",
    author: "Emily Rodriguez",
    role: "Teacher",
    avatar: "https://randomuser.me/api/portraits/women/67.jpg"
  }
];

export const Testimonials = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true });
  
  return (
    <section ref={sectionRef} className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Patients Say</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Hear from patients who have experienced our telemedicine services and prescription analysis tools.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.15, ease: "easeOut" }}
            >
              <QuoteIcon className="h-10 w-10 text-medical-primary opacity-20 mb-4" />
              <p className="text-gray-700 mb-6">{testimonial.content}</p>
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="h-12 w-12 rounded-full mr-4"
                />
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
