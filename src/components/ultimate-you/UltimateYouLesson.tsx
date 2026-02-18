import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { UltimateYouDay } from '@/data/ultimateYouContent';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Quote } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { TextToSpeechButton } from '@/components/ui/TextToSpeechButton';

interface UltimateYouLessonProps {
  dayData: UltimateYouDay;
  onComplete: () => void;
  completed: boolean;
}

export const UltimateYouLesson: React.FC<UltimateYouLessonProps> = ({
  dayData,
  onComplete,
  completed,
}) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-6">
      <TextToSpeechButton
        text={dayData.lessonContent}
        size="lg"
        variant="outline"
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-black font-semibold border-0"
        label={language === 'ro' ? '🎧 Ascultă lecția citită de AI' : '🎧 Listen to the lesson read by AI'}
      />

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Quote className="h-5 w-5 text-primary shrink-0 mt-1" />
          <div>
            <p className="text-foreground font-medium italic leading-relaxed">{dayData.quote}</p>
            <p className="text-sm text-muted-foreground mt-2">— {dayData.quoteAuthor}</p>
          </div>
        </div>
      </div>

      {dayData.definitions && dayData.definitions.length > 0 && (
        <div className="space-y-3">
          {dayData.definitions.map((def, i) => (
            <div key={i} className="bg-accent/50 border border-accent rounded-lg p-4">
              <Badge variant="secondary" className="mb-2 gap-1">
                <BookOpen className="h-3 w-3" />
                {language === 'ro' ? 'Definiție' : 'Definition'}
              </Badge>
              <p className="font-bold text-foreground">{def.term}</p>
              <p className="text-muted-foreground text-sm mt-1">{def.definition}</p>
            </div>
          ))}
        </div>
      )}

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            h2: ({ children }) => <h2 className="text-xl font-bold text-foreground mt-6 mb-3 first:mt-0">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-semibold text-foreground mt-5 mb-2">{children}</h3>,
            p: ({ children }) => <p className="text-foreground/90 leading-relaxed mb-3">{children}</p>,
            blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 bg-primary/5 rounded-r-lg">{children}</blockquote>,
            strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
            ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 my-3">{children}</ol>,
            ul: ({ children }) => <ul className="list-disc list-inside space-y-2 my-3">{children}</ul>,
            table: ({ children }) => <div className="overflow-x-auto my-4"><table className="w-full border-collapse border border-border rounded-lg">{children}</table></div>,
            th: ({ children }) => <th className="border border-border px-3 py-2 bg-muted text-left font-semibold text-sm">{children}</th>,
            td: ({ children }) => <td className="border border-border px-3 py-2 text-sm">{children}</td>,
          }}
        >
          {dayData.lessonContent}
        </ReactMarkdown>
      </div>

      {!completed && (
        <button
          onClick={onComplete}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
          {language === 'ro' ? '✅ Am citit lecția' : '✅ I\'ve read the lesson'}
        </button>
      )}

      {completed && (
        <div className="text-center py-3 text-sm text-muted-foreground">
          ✅ {language === 'ro' ? 'Lecție completată' : 'Lesson completed'}
        </div>
      )}
    </div>
  );
};
