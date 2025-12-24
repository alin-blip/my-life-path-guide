import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileDown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ExportConversationProps {
  messages: Message[];
  disabled?: boolean;
}

export const ExportConversation: React.FC<ExportConversationProps> = ({
  messages,
  disabled = false
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportAsText = () => {
    if (messages.length === 0) return;

    const header = `Conversație Vocală - ${formatDate(new Date())}\n${'='.repeat(50)}\n\n`;
    
    const content = messages.map(msg => {
      const role = msg.role === 'user' ? 'Tu' : 'AI Coach';
      const time = formatDate(msg.timestamp);
      return `[${time}] ${role}:\n${msg.content}\n`;
    }).join('\n');

    const fullText = header + content;

    // Create and download file
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversatie-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: '✅ Export completat',
      description: 'Conversația a fost salvată ca fișier text.',
    });
  };

  const exportAsPDF = async () => {
    if (messages.length === 0) return;

    setIsExporting(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Title
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Conversație Vocală', margin, yPosition);
      yPosition += 10;

      // Date
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100);
      pdf.text(formatDate(new Date()), margin, yPosition);
      yPosition += 15;

      // Separator
      pdf.setDrawColor(200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Messages
      pdf.setTextColor(0);
      
      for (const msg of messages) {
        const role = msg.role === 'user' ? 'Tu' : 'AI Coach';
        const roleColor = msg.role === 'user' ? [59, 130, 246] : [34, 197, 94]; // blue / green

        // Check if we need a new page
        if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        // Role header
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(roleColor[0], roleColor[1], roleColor[2]);
        pdf.text(role, margin, yPosition);
        yPosition += 6;

        // Message content
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60);
        
        const lines = pdf.splitTextToSize(msg.content, maxWidth);
        
        for (const line of lines) {
          if (yPosition > pdf.internal.pageSize.getHeight() - 20) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 5;
        }
        
        yPosition += 8;
      }

      // Save
      pdf.save(`conversatie-${Date.now()}.pdf`);

      toast({
        title: '✅ Export completat',
        description: 'Conversația a fost salvată ca PDF.',
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut genera PDF-ul.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || messages.length === 0 || isExporting}
          className="gap-1 text-xs"
        >
          {isExporting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Download className="w-3 h-3" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsText} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4" />
          Export ca Text (.txt)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsPDF} className="gap-2 cursor-pointer">
          <FileDown className="w-4 h-4" />
          Export ca PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
