
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, User, Check, X } from 'lucide-react';

export const Profile: React.FC = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [occupation, setOccupation] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setProfileImage(null);
    toast({
      title: "Profile picture removed",
      description: "Your profile picture has been deleted.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSaved(true);
      
      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully.",
      });
      
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving your profile.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">PROFILE</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="bg-warrior-DEFAULT border-warrior-muted/30 shadow-lg">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 sm:gap-6">
              <div className="relative group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center border border-muted/40">
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="flex flex-col items-center">
                    <label htmlFor="profile-upload" className="cursor-pointer text-xs text-white hover:text-warrior-accent mb-1 flex items-center">
                      <Upload className="h-3 w-3 mr-1" />
                      UPLOAD
                    </label>
                    {profileImage && (
                      <button 
                        type="button" 
                        onClick={handleDeleteImage}
                        className="text-xs text-white hover:text-red-400 flex items-center"
                      >
                        <X className="h-3 w-3 mr-1" />
                        DELETE
                      </button>
                    )}
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                      className="bg-muted border-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                      className="bg-muted border-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="bg-muted border-muted"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <label htmlFor="birthYear" className="text-sm font-medium">
                  Birth Year
                </label>
                <Input
                  id="birthYear"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  placeholder="Enter your birth year"
                  className="bg-muted border-muted"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="occupation" className="text-sm font-medium">
                  Occupation
                </label>
                <Input
                  id="occupation"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Enter your occupation"
                  className="bg-muted border-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Gender</label>
              <div className="flex space-x-6">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="male" 
                    checked={gender === 'male'} 
                    onCheckedChange={() => setGender('male')}
                  />
                  <label
                    htmlFor="male"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Male
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="female" 
                    checked={gender === 'female'} 
                    onCheckedChange={() => setGender('female')}
                  />
                  <label
                    htmlFor="female"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Female
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" disabled={isSaving} className="border-muted bg-muted/40">
              CANCEL
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving || isSaved}
              className={`${isSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-warrior-accent hover:bg-warrior-accent-hover'}`}
            >
              {isSaving ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  SAVING...
                </div>
              ) : isSaved ? (
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  SAVED
                </div>
              ) : (
                'SAVE'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>

      <div className="text-xs text-muted-foreground mt-6 text-right">
        AppVersion 1.0.0
      </div>
    </div>
  );
};
