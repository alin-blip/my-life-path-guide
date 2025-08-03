import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Edit, Trash2, Lock, Unlock, DollarSign, PercentIcon, Users, ShieldCheck, Ban, FileEdit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Interface for courses with locking capabilities and pricing
interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  author: string;
  duration: string;
  url: string;
  embedUrl: string;
  isLocked?: boolean;
  purchaseUrl?: string;
  price: number;
  discountedPrice?: number;
  revenue_share?: string;
  affiliateEnabled?: boolean;
  featuredOrder?: number;
  accessLevel?: 'free' | 'basic' | 'premium' | 'enterprise';
  isApproved?: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  imageUrl?: string;
  type?: 'video' | 'book' | 'audio' | 'challenge';
  createdAt?: string;
}

// Form schema for validation
const courseSchema = z.object({
  id: z.string().optional(),
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
  revenue_share: z.string().optional(),
  affiliateEnabled: z.boolean().default(false),
  featuredOrder: z.coerce.number().min(0).optional(),
  accessLevel: z.enum(['free', 'basic', 'premium', 'enterprise']).default('basic'),
  isApproved: z.boolean().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  imageUrl: z.string().optional(),
  type: z.enum(['video', 'book', 'audio', 'challenge']).optional()
});

type CourseFormValues = z.infer<typeof courseSchema>;

// Mock data for online courses - we're using the same data as ArmoryContent to maintain consistency
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Fundamentals of Body Health',
    description: 'Learn the basics of maintaining a healthy body through nutrition and exercise.',
    category: 'body',
    author: 'Dr. Jane Smith',
    duration: '6 weeks',
    url: 'https://example.com/course/body-health',
    embedUrl: 'https://app.pluux.io/body-health-course',
    isLocked: true,
    purchaseUrl: 'https://checkout.pluux.io/body-health',
    price: 199,
    accessLevel: 'basic',
    status: 'APPROVED',
    isApproved: true
  },
  {
    id: '2',
    title: 'Mindfulness and Being Present',
    description: 'Discover techniques to enhance your sense of being and mindfulness in daily life.',
    category: 'being',
    author: 'Michael Chen',
    duration: '4 weeks',
    url: 'https://example.com/course/mindfulness',
    embedUrl: 'https://app.pluux.io/mindfulness-course',
    isLocked: false,
    price: 0,
    accessLevel: 'free',
    status: 'APPROVED',
    isApproved: true
  },
  {
    id: '3',
    title: 'Work-Life Balance Mastery',
    description: 'Strategies to achieve harmony between personal and professional responsibilities.',
    category: 'balance',
    author: 'Sarah Johnson',
    duration: '5 weeks',
    url: 'https://example.com/course/balance',
    embedUrl: 'https://app.pluux.io/balance-mastery',
    isLocked: true,
    purchaseUrl: 'https://checkout.pluux.io/balance-mastery',
    price: 299,
    discountedPrice: 249,
    accessLevel: 'premium',
    status: 'PENDING',
    isApproved: false
  },
  {
    id: '4',
    title: 'Business Growth Strategies',
    description: 'Learn effective approaches to scale your business and increase profitability.',
    category: 'business',
    author: 'Robert Williams',
    duration: '8 weeks',
    url: 'https://example.com/course/business-growth',
    embedUrl: 'https://app.pluux.io/business-growth',
    isLocked: false,
    price: 499,
    accessLevel: 'premium',
    status: 'PENDING',
    isApproved: false
  },
  {
    id: '5',
    title: 'Physical Training Fundamentals',
    description: 'Build strength and endurance with proven training methodologies.',
    category: 'body',
    author: 'Alex Fitness',
    duration: '10 weeks',
    url: 'https://example.com/course/training',
    embedUrl: 'https://app.pluux.io/physical-training',
    isLocked: true,
    purchaseUrl: 'https://checkout.pluux.io/physical-training',
    price: 349,
    accessLevel: 'basic',
    status: 'REJECTED',
    isApproved: false
  },
];

export const CourseManager: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const { toast } = useToast();
  
  // Load courses from localStorage
  useEffect(() => {
    const loadCourses = () => {
      try {
        const savedCourses = localStorage.getItem('adminCourses');
        if (savedCourses) {
          const parsedCourses = JSON.parse(savedCourses);
          // Process the saved courses to ensure they conform to the Course type
          const processedCourses = parsedCourses.map((course: any) => {
            // Ensure the status is one of the allowed enum values
            let status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING';
            if (course.status === 'APPROVED') {
              status = 'APPROVED';
            } else if (course.status === 'REJECTED') {
              status = 'REJECTED';
            }
            
            return {
              ...course,
              status
            };
          });
          
          // Combine with mock courses
          setCourses([...mockCourses, ...processedCourses]);
        }
      } catch (error) {
        console.error('Error loading courses:', error);
      }
    };
    
    loadCourses();
  }, []);
  
  // Use react-hook-form with zod validation
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'body',
      author: '',
      duration: '',
      url: '',
      embedUrl: '',
      isLocked: true,
      price: 0,
      accessLevel: 'basic',
      isApproved: false,
      status: 'PENDING'
    }
  });
  
  const editForm = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema)
  });

  const handleAddCourse = (values: CourseFormValues) => {
    const newId = (courses.length + 1).toString();
    const courseToAdd: Course = {
      ...values,
      id: values.id || newId,
      title: values.title,
      description: values.description,
      category: values.category,
      author: values.author,
      duration: values.duration,
      url: values.url,
      embedUrl: values.embedUrl,
      price: values.price,
      status: 'PENDING',
      isApproved: false
    };
    
    const updatedCourses = [...courses, courseToAdd];
    setCourses(updatedCourses);
    
    // Save to localStorage - only save non-mock courses
    localStorage.setItem('adminCourses', JSON.stringify(
      updatedCourses.filter(course => !mockCourses.some(mock => mock.id === course.id))
    ));
    
    toast({
      title: "Course added",
      description: "The new course has been added to the catalog.",
    });
    setIsAddingCourse(false);
    form.reset();
  };
  
  const handleUpdateCourse = (values: CourseFormValues) => {
    if (!editingCourse) return;
    
    // Ensure status is one of the allowed values
    let courseStatus: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING';
    if (values.status === 'APPROVED') {
      courseStatus = 'APPROVED';
    } else if (values.status === 'REJECTED') {
      courseStatus = 'REJECTED';
    }
    
    const updatedCourse: Course = {
      ...values,
      id: editingCourse.id,
      title: values.title,
      description: values.description,
      category: values.category,
      author: values.author,
      duration: values.duration,
      url: values.url,
      embedUrl: values.embedUrl,
      price: values.price,
      isApproved: values.isApproved || values.status === 'APPROVED',
      status: courseStatus
    };
    
    const updatedCourses = courses.map(course => 
      course.id === editingCourse.id ? updatedCourse : course
    );
    
    setCourses(updatedCourses);
    
    // Save to localStorage - only save non-mock courses
    localStorage.setItem('adminCourses', JSON.stringify(
      updatedCourses.filter(course => !mockCourses.some(mock => mock.id === course.id))
    ));
    
    toast({
      title: "Course updated",
      description: "The course has been successfully updated.",
    });
    
    setEditingCourse(null);
  };
  
  const handleApproveCourse = (courseId: string) => {
    const updatedCourses = courses.map(course => 
      course.id === courseId 
        ? { ...course, status: 'APPROVED' as const, isApproved: true } 
        : course
    );
    
    setCourses(updatedCourses);
    
    // Save to localStorage
    localStorage.setItem('adminCourses', JSON.stringify(
      updatedCourses.filter(course => !mockCourses.some(mock => mock.id === course.id))
    ));
    
    toast({
      title: "Course approved",
      description: "The course has been approved and is now available for users.",
    });
  };
  
  const handleRejectCourse = (courseId: string) => {
    const updatedCourses = courses.map(course => 
      course.id === courseId 
        ? { ...course, status: 'REJECTED' as const, isApproved: false } 
        : course
    );
    
    setCourses(updatedCourses);
    
    // Save to localStorage
    localStorage.setItem('adminCourses', JSON.stringify(
      updatedCourses.filter(course => !mockCourses.some(mock => mock.id === course.id))
    ));
    
    toast({
      title: "Course rejected",
      description: "The course has been rejected.",
    });
  };
  
  const handleToggleCourseLock = (courseId: string) => {
    const updatedCourses = courses.map(course => 
      course.id === courseId 
        ? { ...course, isLocked: !course.isLocked } 
        : course
    );
    
    setCourses(updatedCourses);
    
    // Save to localStorage
    localStorage.setItem('adminCourses', JSON.stringify(
      updatedCourses.filter(course => !mockCourses.some(mock => mock.id === course.id))
    ));
    
    toast({
      title: "Course updated",
      description: "The course lock status has been updated.",
    });
  };
  
  const handleDeleteCourse = (courseId: string) => {
    const updatedCourses = courses.filter(course => course.id !== courseId);
    setCourses(updatedCourses);
    
    // Save to localStorage
    localStorage.setItem('adminCourses', JSON.stringify(
      updatedCourses.filter(course => !mockCourses.some(mock => mock.id === course.id))
    ));
    
    toast({
      title: "Course deleted",
      description: "The course has been removed from the catalog.",
    });
  };

  const startEditing = (course: Course) => {
    setEditingCourse(course);
    editForm.reset(course);
  };
  
  const getAccessLevelBadge = (level: string) => {
    switch(level) {
      case 'free':
        return <Badge className="bg-green-100 text-green-800">Free</Badge>;
      case 'basic':
        return <Badge className="bg-blue-100 text-blue-800">Basic</Badge>;
      case 'premium':
        return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>;
      case 'enterprise':
        return <Badge className="bg-amber-100 text-amber-800">Enterprise</Badge>;
      default:
        return <Badge>{level}</Badge>;
    }
  };
  
  const getStatusBadge = (status?: string) => {
    switch(status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };
  
  const getCategoryLabel = (category: string) => {
    switch(category) {
      case 'body': return 'Corp';
      case 'balance': return 'Relații';
      case 'being': return 'Spiritualitate';
      case 'business': return 'Afaceri';
      default: return category;
    }
  };

  // Filter courses based on active tab
  const filteredCourses = activeTab === 'ALL' 
    ? courses 
    : courses.filter(course => course.status === activeTab);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Course Management</h3>
        <Button 
          onClick={() => setIsAddingCourse(true)}
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          Add New Course
        </Button>
      </div>
      
      {/* Filter tabs */}
      <div className="flex space-x-2 mb-4">
        <Button 
          variant={activeTab === 'ALL' ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveTab('ALL')}
        >
          All Courses
        </Button>
        <Button 
          variant={activeTab === 'PENDING' ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveTab('PENDING')}
        >
          Pending Approval
        </Button>
        <Button 
          variant={activeTab === 'APPROVED' ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveTab('APPROVED')}
        >
          Approved
        </Button>
        <Button 
          variant={activeTab === 'REJECTED' ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveTab('REJECTED')}
        >
          Rejected
        </Button>
      </div>
      
      {/* Course List */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map(course => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{getCategoryLabel(course.category)}</TableCell>
                  <TableCell>
                    {course.price === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      <div>
                        {course.discountedPrice ? (
                          <div>
                            <span className="line-through text-gray-400">{course.price} LEI</span>
                            <span className="ml-2 text-green-600 font-medium">{course.discountedPrice} LEI</span>
                          </div>
                        ) : (
                          <span>{course.price} LEI</span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {getAccessLevelBadge(course.accessLevel || 'basic')}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(course.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => startEditing(course)}
                      >
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      
                      {course.status === 'PENDING' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleApproveCourse(course.id)}
                            className="text-green-500"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRejectCourse(course.id)}
                            className="text-red-500"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleToggleCourseLock(course.id)}
                        className={course.isLocked ? "text-amber-500" : "text-green-500"}
                      >
                        {course.isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add Course Form */}
      {isAddingCourse && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Course</CardTitle>
            <CardDescription>
              Fill in the details to add a new course to the catalog.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddCourse)} className="space-y-6">
                <div className="grid gap-4">
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
                          <FormLabel>Subcategory (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., fitness, mindfulness" {...field} />
                          </FormControl>
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
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <div className="relative">
                              <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                              <Input 
                                type="number" 
                                min="0"
                                placeholder="0" 
                                className="pl-8" 
                                {...field}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="discountedPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discounted Price (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                              <Input 
                                type="number" 
                                min="0"
                                placeholder="0" 
                                className="pl-8" 
                                {...field}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    
                    <FormField
                      control={form.control}
                      name="affiliateEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel className="flex items-center gap-1">
                              <Users className="h-4 w-4" /> Affiliate Program
                            </FormLabel>
                            <FormDescription>
                              Can this course be promoted by affiliates?
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
                  </div>
                  
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
                  
                  {form.watch("affiliateEnabled") && (
                    <FormField
                      control={form.control}
                      name="revenue_share"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <PercentIcon className="h-4 w-4" /> Revenue Share
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 30%" {...field} />
                          </FormControl>
                          <FormDescription>
                            Percentage of revenue shared with affiliates
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddingCourse(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Course</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      {/* Edit Course Form */}
      {editingCourse && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Course</CardTitle>
            <CardDescription>
              Update the course details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleUpdateCourse)} className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="author"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instructor/Author</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={editForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={editForm.control}
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
                                <SelectValue />
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
                      control={editForm.control}
                      name="subcategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subcategory (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>External URL</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="embedUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Embed URL</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={editForm.control}
                      name="accessLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Level</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value || 'basic'}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
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
                      control={editForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (LEI)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                              <Input 
                                type="number" 
                                min="0"
                                className="pl-8" 
                                {...field}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="discountedPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discounted Price (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                              <Input 
                                type="number" 
                                min="0"
                                className="pl-8" 
                                {...field}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="isLocked"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Course Access</FormLabel>
                            <FormDescription>
                              Is this course locked?
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
                    
                    <FormField
                      control={editForm.control}
                      name="affiliateEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel className="flex items-center gap-1">
                              <Users className="h-4 w-4" /> Affiliate Program
                            </FormLabel>
                            <FormDescription>
                              Can this course be promoted by affiliates?
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
                  </div>
                  
                  {editForm.watch("isLocked") && (
                    <FormField
                      control={editForm.control}
                      name="purchaseUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Purchase URL</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                  
                  {editForm.watch("affiliateEnabled") && (
                    <FormField
                      control={editForm.control}
                      name="revenue_share"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            <PercentIcon className="h-4 w-4" /> Revenue Share
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 30%" {...field} />
                          </FormControl>
                          <FormDescription>
                            Percentage of revenue shared with affiliates
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={editForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value || 'PENDING'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditingCourse(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Update Course</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
