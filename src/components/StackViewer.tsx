import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Calendar, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useDoorContent } from "@/hooks/useDoorContent";

type StackContent = {
  id: string;
  title?: string;
  type?: string;
  content?: any;
  created_at?: string;
  completed?: boolean;
};

export const StackViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stack, setStack] = useState<StackContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToHotList, setIsAddingToHotList] = useState(false);
  const { setHotList, hotList } = useDoorContent();

  useEffect(() => {
    if (id) {
      fetchStackContent();
    }
  }, [id]);

  const fetchStackContent = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Try to fetch from Supabase first
        const { data, error } = await supabase
          .from('stack_library')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error("Error fetching from Supabase:", error);
          // Fallback to localStorage
          loadFromLocalStorage();
          return;
        }

        if (data) {
          setStack(data);
        }
      } else {
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error("Exception in fetchStackContent:", error);
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const stackLibrary = JSON.parse(localStorage.getItem('stack_library') || '[]');
      const foundStack = stackLibrary.find((s: any) => s.id === id);
      if (foundStack) {
        setStack(foundStack);
      } else {
        toast({
          title: "Stack not found",
          description: "The requested stack could not be found.",
          variant: "destructive"
        });
        navigate('/stack-library');
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      toast({
        title: "Error",
        description: "Failed to load stack content.",
        variant: "destructive"
      });
    }
  };

  const handleAddToHotList = async () => {
    if (!stack?.content?.final_action) {
      toast({
        title: "No action to add",
        description: "This stack doesn't have a final action to add to your Hot List.",
        variant: "destructive"
      });
      return;
    }

    setIsAddingToHotList(true);
    try {
      const newItem = {
        id: Date.now().toString(),
        text: stack.content.final_action,
        selected: false,
        priority: 'important' as const
      };
      
      setHotList(prevList => [...prevList, newItem]);
      
      toast({
        title: "Success",
        description: "Action added to your Hot List!",
      });
    } catch (error) {
      console.error("Error adding to Hot List:", error);
      toast({
        title: "Error",
        description: "Failed to add action to Hot List.",
        variant: "destructive"
      });
    } finally {
      setIsAddingToHotList(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM d, yyyy - HH:mm');
    } catch (error) {
      return dateString;
    }
  };

  const renderConversation = () => {
    if (!stack?.content?.answers) return null;

    const answers = stack.content.answers;
    const questions = stack.content.questions || [];

    return (
      <div className="space-y-4">
        {Object.entries(answers).map(([stepKey, answer], index) => {
          const stepNumber = parseInt(stepKey.replace('step', '')) || index + 1;
          const question = questions[stepNumber - 1] || { text: `Step ${stepNumber}` };
          
          return (
            <div key={stepKey} className="border-l-4 border-primary/30 pl-4 py-2">
              <div className="mb-2">
                <h4 className="font-medium text-primary/80 text-sm">
                  Question {stepNumber}:
                </h4>
                <p className="text-muted-foreground">
                  {typeof question === 'string' ? question : question.text}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-white text-sm mb-1">Answer:</h4>
                <p className="text-gray-300 bg-gray-800/50 p-3 rounded-md">
                  {typeof answer === 'string' ? answer : JSON.stringify(answer)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pb-8">
          <div className="flex items-center justify-center p-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!stack) {
    return (
      <Layout>
        <div className="container mx-auto px-4 pb-8">
          <Card className="bg-gray-800/30 border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <h3 className="text-xl font-medium text-gray-300 mb-2">Stack not found</h3>
              <p className="text-gray-400 text-center mb-6">
                The requested stack could not be found.
              </p>
              <Button onClick={() => navigate('/stack-library')}>
                Back to Library
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/stack-library')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Button>
        </div>

        <div className="space-y-6">
          {/* Stack Header */}
          <Card className="bg-gray-800/30 border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    {stack.title || "Stack Details"}
                  </CardTitle>
                  <div className="flex items-center text-sm text-gray-400 gap-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(stack.created_at)}
                    </div>
                    {stack.type && (
                      <div className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
                        {stack.type}
                      </div>
                    )}
                    {stack.completed && (
                      <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                        Completed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Conversation */}
          <Card className="bg-gray-800/30 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderConversation()}
            </CardContent>
          </Card>

          {/* Final Action */}
          {stack.content?.final_action && (
            <Card className="bg-green-900/20 border-green-700">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-green-400">
                  Generated Action
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white mb-4 bg-gray-800/50 p-4 rounded-md">
                  {stack.content.final_action}
                </p>
                <Button
                  onClick={handleAddToHotList}
                  disabled={isAddingToHotList}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isAddingToHotList ? "Adding..." : "Add to Hot List"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Summary or additional content */}
          {stack.content?.summary && (
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white">
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  {stack.content.summary}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};