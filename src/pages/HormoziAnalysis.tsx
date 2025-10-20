import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

export default function HormoziAnalysis() {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateAnalysis = async () => {
    setIsLoading(true);
    setAnalysis('');

    try {
      const { data, error } = await supabase.functions.invoke('hormozi-platform-analysis');

      if (error) {
        console.error('Edge function error:', error);
        toast({
          variant: "destructive",
          title: "Eroare",
          description: error.message || "Nu am putut genera analiza. Încearcă din nou.",
        });
        return;
      }

      if (data?.analysis) {
        setAnalysis(data.analysis);
        toast({
          title: "Analiză completă!",
          description: "Feedback-ul Alex Hormozi a fost generat cu succes.",
        });
      }
    } catch (err) {
      console.error('Analysis error:', err);
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "A apărut o eroare la generarea analizei.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-primary" />
            Analiza Alex Hormozi
          </h1>
          <p className="text-muted-foreground text-lg">
            Feedback strategic brutal despre platforma RoWarrior din perspectiva lui Alex Hormozi, 
            focusat pe antreprenori români de 6-8 cifre.
          </p>
        </div>

        <Card className="p-6 mb-6 border-primary/20">
          <div className="flex items-start gap-4 mb-4">
            <AlertCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Despre această analiză</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• <strong>Value Proposition</strong> - Claritatea ofertei pentru target-ul 6-8 cifre</li>
                <li>• <strong>Product-Market Fit</strong> - Match-ul dintre features și pain points reale</li>
                <li>• <strong>Pricing Strategy</strong> - Optimizarea prețurilor și value stack-ului</li>
                <li>• <strong>Bottleneck Analysis</strong> - Identificarea blocajelor critice</li>
                <li>• <strong>Feature Audit</strong> - Ce să păstrezi, ce să elimini, ce lipsește</li>
                <li>• <strong>Recomandări Actionable</strong> - Pași concreți pentru următoarele 90 de zile</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="mb-8">
          <Button
            onClick={generateAnalysis}
            disabled={isLoading}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generez analiza Hormozi...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-5 w-5" />
                Generează Analiza Completă
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            Analiza durează ~30-60 secunde. Folosește Lovable AI (Gemini 2.5 Pro) pentru feedback strategic.
          </p>
        </div>

        {analysis && (
          <Card className="p-8 prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold mb-6 text-foreground">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground border-b border-border pb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">{children}</h3>,
                p: ({ children }) => <p className="mb-4 text-foreground/90 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                li: ({ children }) => <li className="text-foreground/90">{children}</li>,
                strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => (
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{children}</code>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border-collapse border border-border">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
                th: ({ children }) => (
                  <th className="border border-border px-4 py-2 text-left font-semibold">{children}</th>
                ),
                td: ({ children }) => (
                  <td className="border border-border px-4 py-2">{children}</td>
                ),
              }}
            >
              {analysis}
            </ReactMarkdown>
          </Card>
        )}
      </div>
    </Layout>
  );
}
