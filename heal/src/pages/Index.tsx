import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Hero } from '../components/home/Hero';
import { Features } from '../components/home/Features';
import { Testimonials } from '../components/home/Testimonials';
import { CallToAction } from '../components/home/CallToAction';
import { FeaturedDoctors } from '../components/home/FeaturedDoctors';
import { AuthModal } from '../components/auth/AuthModal';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if redirected from a protected route
    const loginRequired = searchParams.get('login');
    const fromRoute = searchParams.get('from');
    
    if (loginRequired === 'required') {
      setShowAuthModal(true);
      
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive"
      });
      
      // Remove the query parameters
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate, toast]);

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  return (
    <MainLayout>
      <Helmet>
        <title>Healiofy - Healthcare at Your Fingertips</title>
        <meta name="description" content="Connect with top doctors, analyze prescriptions, and get expert medical advice from the comfort of your home, anytime." />
      </Helmet>
      
      <main className="flex-grow">
        <Hero />
        <Features />
        <FeaturedDoctors />
        <Testimonials />
        <CallToAction />
      </main>
      
      <AuthModal isOpen={showAuthModal} onClose={handleCloseAuthModal} />
    </MainLayout>
  );
};

export default Index;
