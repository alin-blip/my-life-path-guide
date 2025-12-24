import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Activity, Utensils, Heart, Brain, PenLine, Book, DollarSign, MessageSquare, Send, Handshake, Sparkles, Target, Compass } from 'lucide-react';

interface ExplainerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'core4' | 'biz4' | 'stack';
}

export const ExplainerModal: React.FC<ExplainerModalProps> = ({ open, onOpenChange, type }) => {
  const content = {
    core4: {
      title: 'Calea Războinicului - Core 4',
      description: 'Cele 8 activități zilnice pentru transformare completă',
      items: [
        {
          icon: <Activity className="h-5 w-5 text-blue-400" />,
          title: '⚡ DISCIPLINA CORPULUI',
          description: 'Exerciții fizice minim 30 de minute. Antrenament, alergare, yoga - orice te face să transpiri.'
        },
        {
          icon: <Utensils className="h-5 w-5 text-green-400" />,
          title: '🍎 COMBUSTIBIL SUBCONȘTIENT',
          description: 'Mâncare 80% neprocesată, accent pe proteine. Alimentează-ți corpul cu energie curată.'
        },
        {
          icon: <Heart className="h-5 w-5 text-pink-400" />,
          title: '💝 LEGEA SERVIRII #1',
          description: 'Fă ceva frumos pentru o persoană. Un gest de bunătate, un compliment sincer.'
        },
        {
          icon: <Heart className="h-5 w-5 text-pink-400" />,
          title: '💝 LEGEA SERVIRII #2',
          description: 'Fă ceva frumos pentru încă o persoană. Dublează impactul tău pozitiv.'
        },
        {
          icon: <Brain className="h-5 w-5 text-purple-400" />,
          title: '🧘 AUTOSUGESTIE & CREDINȚĂ',
          description: 'Meditație și afirmații. Reprogramează-ți subconștientul pentru succes.'
        },
        {
          icon: <PenLine className="h-5 w-5 text-amber-400" />,
          title: '✍️ PROGRAMARE SUBCONȘTIENT',
          description: 'Scrie și vizualizează obiectivele tale. Îți programezi mintea pentru realizare.'
        },
        {
          icon: <Book className="h-5 w-5 text-cyan-400" />,
          title: '📚 CUNOȘTINȚE SPECIALIZATE',
          description: 'Învață ceva nou în domeniul tău. 30 minute de lectură sau curs.'
        },
        {
          icon: <DollarSign className="h-5 w-5 text-emerald-400" />,
          title: '💰 PLANIFICARE ORGANIZATĂ',
          description: 'Revizuiește și planifică pașii pentru obiectivele tale financiare.'
        }
      ]
    },
    biz4: {
      title: 'Daily for Biz - Biz 4',
      description: 'Cele 4 activități zilnice pentru creșterea afacerii tale',
      items: [
        {
          icon: <PenLine className="h-5 w-5 text-blue-400" />,
          title: '📝 CONTENT',
          description: 'Creează o postare/conținut zilnic. Video, articol, carusel - orice aduce valoare audienței tale.'
        },
        {
          icon: <MessageSquare className="h-5 w-5 text-green-400" />,
          title: '💬 ENGAGE',
          description: 'Interacțiune autentică pe social media. Comentează, răspunde, conectează-te cu oamenii.'
        },
        {
          icon: <Send className="h-5 w-5 text-purple-400" />,
          title: '📨 OUTREACH',
          description: 'Contactează prospecți noi. DM-uri, email-uri, propuneri de colaborare.'
        },
        {
          icon: <Handshake className="h-5 w-5 text-amber-400" />,
          title: '🤝 CLOSE',
          description: 'Conversații de vânzare. Închide deal-uri, follow-up clienți potențiali.'
        }
      ]
    },
    stack: {
      title: 'Introspecție - Stack-uri AI',
      description: 'Sesiuni ghidate de coaching AI pentru transformare personală',
      items: [
        {
          icon: <Target className="h-5 w-5 text-amber-400" />,
          title: '🌅 Daily Master Stack',
          description: 'Pregătirea ta zilnică de dimineață. Stabilizare energetică, clarificarea obiectivelor, plan de acțiune.'
        },
        {
          icon: <Sparkles className="h-5 w-5 text-emerald-400" />,
          title: '✨ Divin & Recunoștință',
          description: 'Conexiune spirituală combinată cu practică de recunoștință. Dialog cu divinitatea și mulțumire.'
        },
        {
          icon: <Activity className="h-5 w-5 text-red-400" />,
          title: '🔥 Alchimia Furiei',
          description: 'Transformă furia în claritate și putere. Procesează emoțiile dificile constructiv.'
        },
        {
          icon: <Compass className="h-5 w-5 text-blue-400" />,
          title: '📖 Napoleon Hill Coaching',
          description: 'Ghidare bazată pe principiile din "Think and Grow Rich".'
        }
      ]
    }
  };

  const currentContent = content[type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{currentContent.title}</DialogTitle>
          <DialogDescription>{currentContent.description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {currentContent.items.map((item, index) => (
            <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
              <div className="flex-shrink-0 mt-0.5">
                {item.icon}
              </div>
              <div>
                <h4 className="font-semibold text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
