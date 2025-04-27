import { useState } from 'react';
import { UserProfile, updateUserProfile, ProfileUpdateData } from '@/services/profileService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { DatePicker } from '@/components/ui/date-picker';

interface ProfileFormProps {
  profile: UserProfile;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

export const ProfileForm = ({ profile, onProfileUpdate }: ProfileFormProps) => {
  const [formData, setFormData] = useState<ProfileUpdateData>({
    name: profile.name || '',
    phone: profile.phone || '',
    address: profile.address || '',
    dateOfBirth: profile.dateOfBirth || '',
    gender: profile.gender || '',
    emergencyContact: profile.emergencyContact || '',
    allergies: profile.allergies || '',
    medicalConditions: profile.medicalConditions || '',
  });
  
  // Try to parse the date from the profile data
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(() => {
    if (profile.dateOfBirth) {
      try {
        return parseISO(profile.dateOfBirth);
      } catch (error) {
        return undefined;
      }
    }
    return undefined;
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setDateOfBirth(date);
    if (date) {
      // Format the date as an ISO string (YYYY-MM-DD) for the API
      setFormData(prev => ({ 
        ...prev, 
        dateOfBirth: format(date, 'yyyy-MM-dd') 
      }));
    } else {
      setFormData(prev => ({ ...prev, dateOfBirth: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const updatedProfile = await updateUserProfile(formData);
      if (updatedProfile) {
        onProfileUpdate(updatedProfile);
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully."
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update profile',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={profile.email}
            disabled
            className="bg-gray-100"
          />
          <p className="text-xs text-gray-500">Email cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <DatePicker
            date={dateOfBirth}
            setDate={handleDateChange}
            placeholder="Select your date of birth"
            disabled={(date) => date > new Date()}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select 
            value={formData.gender} 
            onValueChange={(value) => handleSelectChange('gender', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Input
            id="emergencyContact"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleChange}
            placeholder="Name and phone number"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter your address"
          rows={3}
        />
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-3">Medical Information</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="List any allergies you have"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicalConditions">Medical Conditions</Label>
              <Textarea
                id="medicalConditions"
                name="medicalConditions"
                value={formData.medicalConditions}
                onChange={handleChange}
                placeholder="List any medical conditions or past surgeries"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}; 