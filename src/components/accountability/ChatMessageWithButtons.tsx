import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { extractPathsFromText, getRouteInfo } from '@/utils/navigationRoutes';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface ChatMessageWithButtonsProps {
  content: string;
  className?: string;
  isCompact?: boolean;
}

export const ChatMessageWithButtons: React.FC<ChatMessageWithButtonsProps> = ({
  content,
  className,
  isCompact = false,
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  // Extract navigation paths from the message
  const detectedPaths = extractPathsFromText(content);
  
  // Clean content by removing raw paths (optional - or keep them for context)
  const cleanedContent = content;

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Message content with markdown */}
      <div className={cn(
        "prose prose-sm max-w-none dark:prose-invert",
        isCompact && "[&>*]:my-1 [&_p]:my-0.5 [&_ul]:my-0.5 [&_li]:my-0"
      )}>
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className={cn("leading-relaxed", isCompact && "text-xs")}>{children}</p>,
            ul: ({ children }) => <ul className={cn("pl-4 list-disc", isCompact && "text-xs pl-3")}>{children}</ul>,
            li: ({ children }) => <li className={isCompact ? "text-xs" : undefined}>{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
            a: ({ href, children }) => (
              <button
                onClick={() => href && navigate(href)}
                className="text-primary hover:underline cursor-pointer"
              >
                {children}
              </button>
            ),
          }}
        >
          {cleanedContent}
        </ReactMarkdown>
      </div>

      {/* Navigation buttons */}
      {detectedPaths.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {detectedPaths.map((path) => {
            const routeInfo = getRouteInfo(path, language);
            if (!routeInfo) return null;
            
            const Icon = routeInfo.icon;
            const label = language === 'ro' ? routeInfo.labelRo : routeInfo.labelEn;
            
            return (
              <Button
                key={path}
                variant="outline"
                size="sm"
                onClick={() => handleNavigate(path)}
                className={cn(
                  "gap-1.5 bg-primary/5 hover:bg-primary/10 border-primary/20",
                  isCompact && "h-7 text-xs px-2"
                )}
              >
                <Icon className={cn("shrink-0", isCompact ? "w-3 h-3" : "w-3.5 h-3.5")} />
                <span className="truncate">{label}</span>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};
