import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Github, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Healiofy</h3>
            <p className="text-gray-400">
              Your health companion for better medication understanding and healthcare access.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://github.com" className="text-gray-400 hover:text-white transition-colors" aria-label="GitHub">
                <Github size={20} />
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/prescription-analysis" className="text-gray-400 hover:text-white transition-colors">
                  Prescription Analysis
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="text-gray-400 hover:text-white transition-colors">
                  Find a Doctor
                </Link>
              </li>
              <li>
                <Link to="/appointments" className="text-gray-400 hover:text-white transition-colors">
                  Book Appointments
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">Documentation</Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">Help Center</Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2025 Healiofy. All rights reserved.</p>
          <p className="flex items-center text-gray-400 text-sm mt-4 md:mt-0">
            Made with <Heart size={14} className="mx-1 text-red-500" /> for better healthcare
          </p>
        </div>
      </div>
    </footer>
  );
};
