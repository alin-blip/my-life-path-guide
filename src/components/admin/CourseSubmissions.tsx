
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Eye, Trash2, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Interface for course submissions
interface CourseSubmission {
  id: string;
  title: string;
  description: string;
  author: string;
  category: 'body' | 'balance' | 'being' | 'business';
  type: 'video' | 'audio' | 'book' | 'challenge';
  price: number;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  courseUrl: string;
  imageUrl: string;
  revenue_share?: string;
  subcategory?: string;
}

// Mock data for course submissions with a real submission from console logs
const mockSubmissions: CourseSubmission[] = [
  {
    id: 'sub1',
    title: 'Mindfulness pentru antreprenori ocupați',
    description: 'Un curs rapid despre cum să implementezi mindfulness în viața ta de antreprenor',
    author: 'Maria Popescu',
    category: 'being',
    type: 'video',
    price: 149,
    submittedAt: '2023-10-12T14:30:00',
    status: 'pending',
    courseUrl: 'https://example.com/course/mindfulness',
    imageUrl: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png'
  },
  {
    id: 'sub2',
    title: 'Fitness pentru birou: 10 minute zilnic',
    description: 'Exerciții simple pe care le poți face la birou pentru a rămâne în formă',
    author: 'Alexandru Ionescu',
    category: 'body',
    type: 'video',
    price: 99,
    submittedAt: '2023-10-10T09:15:00',
    status: 'approved',
    courseUrl: 'https://example.com/course/office-fitness',
    imageUrl: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png'
  },
  {
    id: 'sub3',
    title: 'Comunicare eficientă cu echipa',
    description: 'Metode de comunicare care îmbunătățesc rezultatele și atmosfera în cadrul echipei',
    author: 'Elena Mihai',
    category: 'balance',
    type: 'audio',
    price: 199,
    submittedAt: '2023-10-08T16:45:00',
    status: 'rejected',
    courseUrl: 'https://example.com/course/team-communication',
    imageUrl: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png'
  },
  {
    id: 'real1',
    title: 'Affiliate Marketing - Full time Pasive Income!',
    description: 'Creaza un venit pasiv prin promovarea serviciilor si produselor altora! chiar din aceasta platforma!',
    author: 'Administrator',
    category: 'business',
    subcategory: 'mastermind',
    type: 'video',
    price: 0,
    submittedAt: new Date().toISOString(),
    status: 'pending',
    courseUrl: '<script src="https://embed.voomly.softwarepublishingapp.com/embed/embed-build.js"></script><div class="voomly-embed" data-id="a386c476-5c9a-4a16-b714-36326e386a98" data-ratio="1.777778" data-type="c" data-skin-color="#2758EB" data-shadow="" style="width: 100%; aspect-ratio: 1.77778 / 1; background: linear-gradient(45deg, rgb(142, 150, 164) 0%, rgb(201, 208, 222) 100%); border-radius: 10px;"></div>',
    imageUrl: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
    revenue_share: '50%'
  }
];

export const CourseSubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<CourseSubmission[]>(mockSubmissions);
  const [previewSubmission, setPreviewSubmission] = useState<CourseSubmission | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // This would be replaced with real API call in production
  const fetchSubmissions = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Here you would fetch actual submissions from your backend
    }, 1000);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleApprove = (id: string) => {
    setSubmissions(submissions.map(sub => 
      sub.id === id ? { ...sub, status: 'approved' } : sub
    ));
    
    toast({
      title: "Curs aprobat",
      description: "Cursul a fost aprobat și publicat.",
    });
  };
  
  const handleReject = (id: string) => {
    setSubmissions(submissions.map(sub => 
      sub.id === id ? { ...sub, status: 'rejected' } : sub
    ));
    
    toast({
      title: "Curs respins",
      description: "Cursul a fost respins și autorul va fi notificat.",
    });
  };
  
  const handleDelete = (id: string) => {
    setSubmissions(submissions.filter(sub => sub.id !== id));
    
    toast({
      title: "Curs șters",
      description: "Cursul a fost șters din sistem.",
    });
  };
  
  const getCategoryName = (category: string) => {
    switch(category) {
      case 'body': return 'Corp';
      case 'balance': return 'Relații';
      case 'being': return 'Spiritualitate';
      case 'business': return 'Afaceri';
      default: return category;
    }
  };
  
  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'video': return 'Video';
      case 'audio': return 'Audio';
      case 'book': return 'Book/PDF';
      case 'challenge': return 'Challenge';
      default: return type;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Cursuri trimise pentru aprobare</h3>
        <Button 
          onClick={fetchSubmissions}
          variant="outline"
          disabled={loading}
        >
          {loading ? "Încărcare..." : "Reîmprospătează"}
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titlu</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead>Preț</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map(submission => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.title}</TableCell>
                  <TableCell>{getCategoryName(submission.category)}</TableCell>
                  <TableCell>{submission.price} LEI</TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        submission.status === 'approved' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                        submission.status === 'rejected' ? 'bg-red-100 text-red-800 hover:bg-red-100' :
                        'bg-amber-100 text-amber-800 hover:bg-amber-100'
                      }
                    >
                      {submission.status === 'approved' ? 'Aprobat' :
                       submission.status === 'rejected' ? 'Respins' : 'În așteptare'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setPreviewSubmission(submission)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {submission.status === 'pending' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleApprove(submission.id)}
                            className="text-green-600"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleReject(submission.id)}
                            className="text-red-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(submission.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {submissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      <p>Nu există cursuri trimise pentru aprobare</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Course Preview Modal */}
      {previewSubmission && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Previzualizare curs</h2>
                <button 
                  onClick={() => setPreviewSubmission(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={previewSubmission.imageUrl} 
                    alt={previewSubmission.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Categorie</h4>
                    <p>{getCategoryName(previewSubmission.category)}</p>
                    {previewSubmission.subcategory && (
                      <p className="text-sm text-gray-500">Subcategorie: {previewSubmission.subcategory}</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Tip</h4>
                    <p>{getTypeLabel(previewSubmission.type)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Preț</h4>
                    <p>{previewSubmission.price} LEI</p>
                    {previewSubmission.revenue_share && (
                      <p className="text-sm text-gray-500">Revenue Share: {previewSubmission.revenue_share}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Titlu</h4>
                  <p className="text-lg font-semibold">{previewSubmission.title}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Descriere</h4>
                  <p>{previewSubmission.description}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">URL Curs</h4>
                  <div className="bg-gray-50 p-3 rounded-md border text-sm overflow-x-auto">
                    <code className="break-all">{previewSubmission.courseUrl}</code>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Autor</h4>
                    <p>{previewSubmission.author}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Data trimiterii</h4>
                    <p>{formatDate(previewSubmission.submittedAt)}</p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setPreviewSubmission(null)}
                  >
                    Închide
                  </Button>
                  
                  {previewSubmission.status === 'pending' && (
                    <>
                      <Button 
                        onClick={() => {
                          handleReject(previewSubmission.id);
                          setPreviewSubmission(null);
                        }}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Respinge
                      </Button>
                      <Button 
                        onClick={() => {
                          handleApprove(previewSubmission.id);
                          setPreviewSubmission(null);
                        }}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        Aprobă
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
