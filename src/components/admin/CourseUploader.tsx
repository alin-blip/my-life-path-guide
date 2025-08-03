
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { Switch } from "@/components/ui/switch";
import { useAdminCourseContext } from '../AdminCourseProvider';

// Form schema for validation
const courseSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  category: z.string(),
  subcategory: z.string().optional(),
  author: z.string().min(2, { message: "Author name required" }),
  duration: z.string(),
  url: z.string().url({ message: "Must be a valid URL" }),
  embedUrl: z.string().url({ message: "Must be a valid embed URL" }),
  isLocked: z.boolean().default(true),
  purchaseUrl: z.string().url({ message: "Must be a valid purchase URL" }).optional(),
  price: z.coerce.number().min(0),
  discountedPrice: z.coerce.number().min(0).optional(),
  accessLevel: z.enum(['free', 'basic', 'premium', 'enterprise']).default('basic'),
  type: z.enum(['video', 'book', 'audio', 'challenge']).default('video'),
  imageUrl: z.string().optional()
});

type CourseFormValues = z.infer<typeof courseSchema>;

export const CourseUploader: React.FC = () => {
  const { toast } = useToast();
  const { refreshCourses } = useAdminCourseContext();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'body',
      author: '',
      duration: '',
      url: 'https://',
      embedUrl: 'https://',
      isLocked: true,
      price: 0,
      accessLevel: 'basic',
      type: 'video'
    }
  });
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onSubmit = (values: CourseFormValues) => {
    // Create a new course object
    const newCourse = {
      id: uuidv4(),
      ...values,
      imageUrl: imagePreview || '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
      status: 'PENDING' as const,
      isApproved: false,
      createdAt: new Date().toISOString()
    };
    
    // Get existing courses from localStorage
    const existingCoursesJson = localStorage.getItem('adminCourses');
    const existingCourses = existingCoursesJson ? JSON.parse(existingCoursesJson) : [];
    
    // Add new course to the list
    const updatedCourses = [...existingCourses, newCourse];
    
    // Save back to localStorage
    localStorage.setItem('adminCourses', JSON.stringify(updatedCourses));
    
    // Refresh the course list in the admin panel
    refreshCourses();
    
    toast({
      title: "Course uploaded",
      description: "Your course has been uploaded and is pending approval.",
    });
    
    // Reset form
    form.reset();
    setImagePreview(null);
    setImageFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload New Course</CardTitle>
        <CardDescription>
          Fill in the details to add a new course to the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter course title" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructor/Author</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter instructor name" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter course description" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="body">Body (Corp)</SelectItem>
                          <SelectItem value="being">Being (Spiritualitate)</SelectItem>
                          <SelectItem value="balance">Balance (Relații)</SelectItem>
                          <SelectItem value="business">Business (Afaceri)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="courses">Video Course</SelectItem>
                          <SelectItem value="ebook">E-Book</SelectItem>
                          <SelectItem value="audiobook">Audiobook</SelectItem>
                          <SelectItem value="challenge">Challenge</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 6 weeks, 2 hours" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <FormLabel>Course Image</FormLabel>
                <div className="mt-2 flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="max-w-sm"
                  />
                  {imagePreview && (
                    <div className="relative w-24 h-24 overflow-hidden rounded-md border">
                      <img
                        src={imagePreview}
                        alt="Course preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/course" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="embedUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Embed URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://app.pluux.io/your-course" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL that will be used for the iframe embedding
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select content type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="book">Book</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="challenge">Challenge</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="accessLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Level</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select access level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (LEI)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          placeholder="0" 
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="isLocked"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Course Access</FormLabel>
                      <FormDescription>
                        Is this course locked by default?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {form.watch("isLocked") && (
                <FormField
                  control={form.control}
                  name="purchaseUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://checkout.example.com/course" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <Button type="submit" className="w-full">Upload Course</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
