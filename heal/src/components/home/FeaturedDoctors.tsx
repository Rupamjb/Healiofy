
import React, { useRef } from 'react';
import { Star, ArrowRight } from "lucide-react";
import { motion, useInView } from 'framer-motion';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface FeaturedDoctorProps {
  name: string;
  specialty: string;
  image: string;
  rating: number;
  delay: number;
}

const FeaturedDoctor = ({ name, specialty, image, rating, delay }: FeaturedDoctorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: delay, ease: "easeOut" }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={image} alt={name} />
              <AvatarFallback>{name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-medical-primary mb-2">{specialty}</p>
            <div className="flex items-center mt-1">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-sm font-medium">{rating}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const FeaturedDoctors = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  
  const featuredDoctors = [
    {
      name: "Dr. Pallabi Sharma",
      specialty: "Cardiology",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      rating: 4.9,
    },
    {
      name: "Dr. Mikel Sinha",
      specialty: "Dermatology",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 4.8,
    },
    {
      name: "Dr. Ankurisa Gogoi",
      specialty: "Pediatrics",
      image: "https://randomuser.me/api/portraits/women/67.jpg",
      rating: 4.9,
    },
    {
      name: "Dr. Jarjee Bhuyan",
      specialty: "Neurology",
      image: "https://randomuser.me/api/portraits/women/52.jpg",
      rating: 4.7,
    }
  ];
  
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          ref={ref}
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Top Specialists</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Meet our team of experienced healthcare professionals ready to provide you with exceptional care
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDoctors.map((doctor, index) => (
            <FeaturedDoctor 
              key={index} 
              name={doctor.name} 
              specialty={doctor.specialty} 
              image={doctor.image}
              rating={doctor.rating}
              delay={0.1 * index}
            />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" asChild>
            <Link to="/doctors">
              View All Doctors <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
