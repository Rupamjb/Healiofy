import { motion } from "framer-motion";
import { Code2, Database, Terminal, Palette, Server, Shield, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";

const About = () => {
  return (
    <MainLayout>
      <Helmet>
        <title>About Healiofy</title>
      </Helmet>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">About Healiofy</h1>
          
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-medical-primary">Our Mission</h2>
            <p className="text-gray-700 mb-4">
              Healiofy is a comprehensive healthcare platform designed to bridge the gap between patients and their healthcare information. 
              Our mission is to empower patients with easy-to-understand information about their prescriptions, provide access to qualified 
              healthcare professionals, and create a more transparent healthcare experience.
            </p>
            <p className="text-gray-700">
              Built as a part of a healthcare project, Healiofy aims to solve real-world problems in medication management and healthcare 
              access through innovative technology solutions.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 md:p-8 shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-medical-primary">Key Features</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li><span className="font-medium">User Profiles:</span> Manage your personal and medical information securely</li>
              <li><span className="font-medium">Prescription Analysis:</span> AI-powered tool to analyze and explain your medications</li>
              <li><span className="font-medium">Doctor Directory:</span> Find and connect with healthcare providers</li>
              <li><span className="font-medium">Appointment Booking:</span> Schedule appointments with doctors</li>
              <li><span className="font-medium">AI Health Assistant:</span> Get answers to your health questions</li>
              <li><span className="font-medium">Secure Authentication:</span> JWT-based protection for your sensitive health information</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 md:p-8 shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-medical-primary">Technology Stack</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-medium flex items-center">
                  <Code2 className="mr-2 h-5 w-5 text-blue-500" />
                  Frontend
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>React with TypeScript</li>
                  <li>React Router for navigation</li>
                  <li>Tailwind CSS for styling</li>
                  <li>Shadcn UI components</li>
                  <li>Framer Motion for animations</li>
                  <li>React Context API for state management</li>
                  <li>Axios for API requests</li>
                  <li>Vite as build tool</li>
                </ul>
              </div>
              
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-medium flex items-center">
                  <Server className="mr-2 h-5 w-5 text-green-500" />
                  Backend
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Node.js & Express.js</li>
                  <li>MongoDB for database</li>
                  <li>Mongoose for database modeling</li>
                  <li>JSON Web Tokens (JWT) for authentication</li>
                  <li>Bcrypt for password security</li>
                  <li>AI integration with Groq API</li>
                  <li>RESTful API architecture</li>
                  <li>Error handling middleware</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-medium flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-purple-500" />
                  Security Features
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>JWT-based authentication</li>
                  <li>Protected routes on frontend and backend</li>
                  <li>Password hashing with bcrypt</li>
                  <li>CORS configuration</li>
                  <li>Input validation and sanitization</li>
                </ul>
              </div>
              
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-medium flex items-center">
                  <UserCircle className="mr-2 h-5 w-5 text-teal-500" />
                  User Features
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Personal profile management</li>
                  <li>Medical information storage</li>
                  <li>Password management</li>
                  <li>Appointment history</li>
                  <li>Sensitive data encryption</li>
                </ul>
              </div>
              
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-xl font-medium flex items-center">
                  <Palette className="mr-2 h-5 w-5 text-orange-500" />
                  Development Tools
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  <li>Git for version control</li>
                  <li>ESLint for code linting</li>
                  <li>Nodemon for development</li>
                  <li>MongoDB Memory Server for testing</li>
                  <li>Responsive design principles</li>
                  <li>Postman for API testing</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 md:p-8 shadow-md mb-8 text-center">
            <h2 className="text-2xl font-semibold mb-4 text-medical-primary">Future Enhancements</h2>
            <p className="text-gray-700 mb-6">
              Healiofy is continuously evolving. Our roadmap includes features like medication reminders, 
              telemedicine integration, health record management, and enhanced AI capabilities for more 
              personalized healthcare insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="w-full sm:w-auto" asChild>
                <Link to="/">
                  Explore Healiofy
                </Link>
              </Button>
              <Button className="w-full sm:w-auto" variant="outline" asChild>
                <Link to="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default About; 