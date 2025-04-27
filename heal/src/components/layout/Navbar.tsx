import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigation } from "@/hooks/useNavigation";
import { AuthModal } from "../auth/AuthModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { navigateWithLoading } = useNavigation();

  // Define routes with protection status
  const links = [
    { name: "Home", href: "/", protected: false },
    { name: "Doctors", href: "/doctors", protected: false },
    { name: "Prescription Analysis", href: "/prescription-analysis", protected: true },
    { name: "About", href: "/about", protected: false },
    { name: "Contact", href: "/contact", protected: false },
  ];

  const handleLogout = () => {
    logout();
  };

  const handleNavigation = (link: typeof links[0], e: React.MouseEvent) => {
    e.preventDefault();
    
    if (link.protected && !isAuthenticated) {
      setShowAuthModal(true);
    } else {
      navigateWithLoading(link.href);
    }
  };

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center" onClick={(e) => handleNavigation({ name: "Home", href: "/", protected: false }, e)}>
              <span className="text-medical-primary font-bold text-2xl">
                Healio<span className="text-medical-secondary">fy</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden md:ml-6 md:flex md:space-x-8 md:items-center">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={(e) => handleNavigation(link, e)}
                className="text-gray-600 hover:text-medical-primary border-transparent hover:border-medical-primary px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-4">
                    <User className="h-4 w-4 mr-2" />
                    {user?.email?.split('@')[0] || 'Account'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => navigateWithLoading('/profile')}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => navigateWithLoading('/appointments')}
                  >
                    Appointments
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => navigateWithLoading('/subscription')}
                  >
                    Subscription
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button className="ml-4 btn-primary" onClick={() => setShowAuthModal(true)}>
                Sign In
              </Button>
            )}
          </div>
          
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-medical-primary focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-medical-primary hover:bg-gray-50"
                onClick={(e) => {
                  handleNavigation(link, e);
                  setIsOpen(false);
                }}
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <div className="px-3 py-2">
                <div className="px-3 py-2 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-500">Signed in as {user?.email}</p>
                  <Link 
                    to="/profile" 
                    className="block py-2 text-sm text-gray-700 hover:text-medical-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link 
                    to="/appointments" 
                    className="block py-2 text-sm text-gray-700 hover:text-medical-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    My Appointments
                  </Link>
                  <Link 
                    to="/subscription" 
                    className="block py-2 text-sm text-gray-700 hover:text-medical-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    My Subscription
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="w-full mt-2 text-red-600 justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="px-3 py-2">
                <Button 
                  className="w-full btn-primary"
                  onClick={() => {
                    setShowAuthModal(true);
                    setIsOpen(false);
                  }}
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </motion.nav>
  );
};
