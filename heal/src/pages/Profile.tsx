import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { PasswordChangeForm } from '@/components/profile/PasswordChangeForm';
import { getUserProfile, UserProfile } from '@/services/profileService';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { SubscriptionDialog } from '@/components/subscription/SubscriptionDialog';

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getUserProfile();
        setProfile(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile data');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load profile data. Please try again later.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, toast]);

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been updated successfully.',
    });
  };

  const handlePasswordChange = () => {
    toast({
      title: 'Password Changed',
      description: 'Your password has been changed successfully.',
    });
  };

  const handleSubscribeClick = () => {
    setShowSubscriptionDialog(true);
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <Helmet>
          <title>Profile | Healiofy</title>
        </Helmet>
        <div className="container py-8">
          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              Please sign in to view and edit your profile.
            </AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <Helmet>
          <title>Profile | Healiofy</title>
        </Helmet>
        <div className="container flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 text-medical-primary animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Helmet>
          <title>Profile | Healiofy</title>
        </Helmet>
        <div className="container py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Helmet>
        <title>Profile | Healiofy</title>
      </Helmet>
      
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        
        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Personal Information</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="pt-4">
                  {profile && (
                    <ProfileForm profile={profile} onProfileUpdate={handleProfileUpdate} />
                  )}
                </TabsContent>
                
                <TabsContent value="security" className="pt-4">
                  <PasswordChangeForm onPasswordChange={handlePasswordChange} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <SubscriptionStatus onSubscribe={handleSubscribeClick} />
          </div>
        </div>
      </div>
      
      <SubscriptionDialog 
        open={showSubscriptionDialog} 
        onOpenChange={setShowSubscriptionDialog} 
      />
    </MainLayout>
  );
};

export default Profile; 