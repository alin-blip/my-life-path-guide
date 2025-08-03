
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, File, Calendar, Trash2, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type StackType = {
  id: string;
  title?: string;
  trigger?: string;
  color?: string;
  created_at?: string;
  user_id?: string;
  questions?: any;
  content?: any;
  trigger_label?: string;
  shared?: boolean;
  share_id?: string;
};

export const StackLibrary = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stacks, setStacks] = useState<StackType[]>([]);
  const [filteredStacks, setFilteredStacks] = useState<StackType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteStackId, setDeleteStackId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareableUrl, setShareableUrl] = useState("");
  const [currentStack, setCurrentStack] = useState<StackType | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStacks();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStacks(stacks);
    } else {
      const filtered = stacks.filter(stack => 
        stack.trigger?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stack.trigger_label?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStacks(filtered);
    }
  }, [searchTerm, stacks]);

  const fetchStacks = async () => {
    setIsLoading(true);
    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data, error } = await supabase
          .from('stack_library')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching stacks:", error);
          toast({
            title: "Error",
            description: "Failed to fetch stack library. Loading from local storage.",
            variant: "destructive"
          });
          loadLocalStacks();
          return;
        }

        if (data) {
          // Map the data to ensure types are compatible
          const formattedData: StackType[] = data.map(item => ({
            id: item.id,
            trigger: item.trigger,
            trigger_label: item.trigger_label,
            color: item.color,
            created_at: item.created_at,
            user_id: item.user_id,
            questions: item.questions,
            content: item.content,
            shared: item.shared,
            share_id: item.share_id
          }));
          
          setStacks(formattedData);
          setFilteredStacks(formattedData);
          console.log(`Loaded ${data.length} stacks from Supabase`);
        }
      } else {
        loadLocalStacks();
      }
    } catch (error) {
      console.error("Exception in fetchStacks:", error);
      loadLocalStacks();
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocalStacks = () => {
    try {
      const localStacks = localStorage.getItem('stack_library');
      if (localStacks) {
        const parsed = JSON.parse(localStacks);
        setStacks(parsed);
        setFilteredStacks(parsed);
        console.log(`Loaded ${parsed.length} stacks from local storage`);
      } else {
        setStacks([]);
        setFilteredStacks([]);
      }
    } catch (error) {
      console.error("Error loading local stacks:", error);
      setStacks([]);
      setFilteredStacks([]);
    }
  };

  const handleCreateStack = () => {
    navigate('/stack');
  };

  const handleStackClick = (stackId: string) => {
    navigate(`/stack?id=${stackId}`);
  };

  const handleDeleteStack = async () => {
    if (!deleteStackId) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { error } = await supabase
          .from('stack_library')
          .delete()
          .eq('id', deleteStackId)
          .eq('user_id', session.user.id);

        if (error) {
          console.error("Error deleting stack:", error);
          throw error;
        }
      }
      
      // Also remove from local state
      const updatedStacks = stacks.filter(stack => stack.id !== deleteStackId);
      setStacks(updatedStacks);
      setFilteredStacks(updatedStacks);
      
      toast({
        title: "Success",
        description: "Stack deleted successfully",
      });
    } catch (error) {
      console.error("Error in handleDeleteStack:", error);
      toast({
        title: "Error",
        description: "Failed to delete stack",
        variant: "destructive"
      });
    } finally {
      setDeleteStackId(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleShareStack = async (stack: StackType) => {
    try {
      setCurrentStack(stack);
      
      // Check if already shared
      if (stack.shared && stack.share_id) {
        const shareUrl = `${window.location.origin}/stack?shared=${stack.share_id}`;
        setShareableUrl(shareUrl);
        setShareDialogOpen(true);
        return;
      }
      
      // Create a share
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Error",
          description: "You must be logged in to share stacks",
          variant: "destructive"
        });
        return;
      }
      
      // Update the stack to set shared=true and generate share_id if not exists
      const shareId = stack.share_id || crypto.randomUUID();
      const { error } = await supabase
        .from('stack_library')
        .update({ 
          shared: true,
          share_id: shareId
        })
        .eq('id', stack.id)
        .eq('user_id', session.user.id);
        
      if (error) {
        console.error("Error sharing stack:", error);
        throw error;
      }
      
      // Update local state
      const updatedStacks = stacks.map(s => 
        s.id === stack.id 
          ? { ...s, shared: true, share_id: shareId } 
          : s
      );
      setStacks(updatedStacks);
      setFilteredStacks(updatedStacks);
      
      // Set shareable URL
      const shareUrl = `${window.location.origin}/stack?shared=${shareId}`;
      setShareableUrl(shareUrl);
      setShareDialogOpen(true);
    } catch (error) {
      console.error("Error sharing stack:", error);
      toast({
        title: "Error",
        description: "Failed to share stack",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Success",
        description: "URL copied to clipboard",
      });
    } catch (err) {
      console.error("Failed to copy:", err);
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const getStackColor = (color?: string) => {
    switch(color) {
      case 'red': return 'bg-red-900/20 border-red-700';
      case 'green': return 'bg-green-900/20 border-green-700';
      case 'blue': return 'bg-blue-900/20 border-blue-700';
      case 'purple': return 'bg-purple-900/20 border-purple-700';
      case 'orange': return 'bg-orange-900/20 border-orange-700';
      default: return 'bg-blue-900/20 border-blue-700';
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Stack Library
        </h1>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search stacks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-gray-800/50 border-gray-700"
            />
          </div>
          <Button 
            onClick={handleCreateStack} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Stack
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : filteredStacks.length === 0 ? (
        <Card className="bg-gray-800/30 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <File className="h-16 w-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No stacks found</h3>
            <p className="text-gray-400 text-center mb-6">
              {searchTerm ? 
                "No stacks match your search term. Try a different search." : 
                "You haven't created any stacks yet. Create your first stack to get started."}
            </p>
            {!searchTerm && (
              <Button 
                onClick={handleCreateStack} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Stack
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStacks.map((stack) => (
            <Card 
              key={stack.id} 
              className={`border ${getStackColor(stack.color)} hover:bg-gray-800/50 transition-colors cursor-pointer group relative`}
              onClick={(e) => {
                // Only navigate if the card itself is clicked, not buttons inside it
                if ((e.target as Element).closest('button')) return;
                handleStackClick(stack.id);
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-medium text-white">
                    {stack.trigger_label || stack.trigger || "Untitled Stack"}
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                        <span className="sr-only">Open menu</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                      <DropdownMenuItem 
                        className="text-gray-200 focus:text-white focus:bg-gray-700"
                        onClick={() => handleShareStack(stack)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                          <polyline points="16 6 12 2 8 6" />
                          <line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-400 focus:text-red-300 focus:bg-gray-700"
                        onClick={() => {
                          setDeleteStackId(stack.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-gray-400 mb-2">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  {formatDate(stack.created_at)}
                </div>
                {stack.shared && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded">
                      Shared
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              This action cannot be undone. This will permanently delete your
              stack and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteStack}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Share Stack</DialogTitle>
            <DialogDescription className="text-gray-300">
              Copy this link to share your stack with others.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-2">
            <Input
              readOnly
              value={shareableUrl}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Button
              onClick={copyToClipboard}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <DialogFooter className="mt-4">
            <Button 
              onClick={() => setShareDialogOpen(false)}
              className="bg-gray-700 text-white hover:bg-gray-600"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
