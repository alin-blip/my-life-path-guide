import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';

interface ChallengeScriptCardProps {
  script: string;
  maxHeight?: string;
}

export const ChallengeScriptCard: React.FC<ChallengeScriptCardProps> = ({
  script,
  maxHeight = '300px',
}) => {
  return (
    <div className="relative" style={{ height: maxHeight }}>
      <ScrollArea className="h-full">
        <div className="p-6 prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-xl font-bold mb-4 text-foreground">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-semibold mt-6 mb-3 text-foreground">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold mt-4 mb-2 text-foreground">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="mb-3 text-muted-foreground leading-relaxed">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic text-muted-foreground">{children}</em>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1 mb-3 text-muted-foreground">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1 mb-3 text-muted-foreground">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-muted-foreground">{children}</li>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full border-collapse text-sm">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-border px-3 py-2 bg-muted/50 text-left font-semibold text-foreground">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-border px-3 py-2 text-muted-foreground">
                  {children}
                </td>
              ),
              hr: () => <hr className="my-6 border-border" />,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-4">
                  {children}
                </blockquote>
              ),
            }}
          >
            {script}
          </ReactMarkdown>
        </div>
      </ScrollArea>

      {/* Fade gradient at bottom to indicate more content */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
    </div>
  );
};

export default ChallengeScriptCard;
