import jsPDF from 'jspdf';
import { MasterPlanProject } from './masterPlanProjectService';

const PRINCIPLES = [
  "Dorința", "Credința", "Autosuggestia", "Cunoaștere Specializată",
  "Imaginația", "Planificare Organizată", "Decizia", "Perseverența",
  "Master Mind", "Transmutarea Energiei", "Subconștientul",
  "Creierul", "Al Șaselea Simț", "Acțiunea Imediată"
];

export const masterPlanPdfService = {
  async generatePDF(project: MasterPlanProject): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Helper function to add text with word wrap
    const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      pdf.setTextColor(color[0], color[1], color[2]);
      
      const lines = pdf.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        checkPageBreak(fontSize * 0.5);
        pdf.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      });
      
      pdf.setTextColor(0, 0, 0); // Reset color
    };

    // Cover Page
    pdf.setFillColor(41, 98, 255);
    pdf.rect(0, 0, pageWidth, 80, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Master Plan', pageWidth / 2, 35, { align: 'center' });
    pdf.text('Planul de Acțiune', pageWidth / 2, 50, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text(project.project_name, pageWidth / 2, 65, { align: 'center' });
    
    yPosition = 100;
    pdf.setTextColor(0, 0, 0);

    // Project Details
    addText('Obiectiv:', 16, true);
    yPosition += 5;
    addText(project.goal_description, 12);
    yPosition += 10;

    if (project.goal_amount || project.goal_deadline) {
      addText('Ținte:', 14, true);
      yPosition += 5;
      
      if (project.goal_amount) {
        addText(`💰 ${project.goal_amount}`, 11);
      }
      if (project.goal_deadline) {
        const deadline = new Date(project.goal_deadline).toLocaleDateString('ro-RO', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        addText(`📅 Termen: ${deadline}`, 11);
      }
      yPosition += 10;
    }

    // Progress Overview
    checkPageBreak(40);
    addText('Progres General', 18, true, [41, 98, 255]);
    yPosition += 10;

    const completedCount = Object.keys(project.principle_answers).length;
    const progress = (completedCount / 14) * 100;

    // Progress bar
    const barWidth = maxWidth;
    const barHeight = 10;
    
    pdf.setFillColor(230, 230, 230);
    pdf.rect(margin, yPosition, barWidth, barHeight, 'F');
    
    pdf.setFillColor(41, 98, 255);
    pdf.rect(margin, yPosition, (barWidth * progress) / 100, barHeight, 'F');
    
    pdf.setFontSize(10);
    pdf.text(`${completedCount}/14 Principii (${progress.toFixed(0)}%)`, margin, yPosition - 3);
    
    yPosition += barHeight + 15;

    // Principles Details
    pdf.addPage();
    yPosition = margin;

    addText('Principiile Tale Master Plan', 20, true, [41, 98, 255]);
    yPosition += 15;

    Object.entries(project.principle_answers).forEach(([principleNum, answer]) => {
      const principle = parseInt(principleNum);
      const principleName = PRINCIPLES[principle - 1];
      const summary = project.principle_summaries[principle];

      checkPageBreak(60);

      // Principle header with number
      pdf.setFillColor(41, 98, 255);
      pdf.circle(margin + 5, yPosition + 3, 5, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(principle.toString(), margin + 5, yPosition + 5, { align: 'center' });
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.text(principleName, margin + 15, yPosition + 5);
      
      yPosition += 12;

      // Summary box
      if (summary) {
        pdf.setFillColor(240, 245, 255);
        const summaryLines = pdf.splitTextToSize(summary, maxWidth - 10);
        const boxHeight = summaryLines.length * 5 + 8;
        
        pdf.rect(margin, yPosition, maxWidth, boxHeight, 'F');
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text(summaryLines, margin + 5, yPosition + 5);
        
        yPosition += boxHeight + 5;
      }

      // Answer
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const answerLines = pdf.splitTextToSize(answer as string, maxWidth - 5);
      
      answerLines.forEach((line: string) => {
        checkPageBreak(6);
        pdf.text(line, margin + 2, yPosition);
        yPosition += 5;
      });

      yPosition += 10;
    });

    // Actions Section
    if (project.action_items.length > 0) {
      checkPageBreak(40);
      
      addText('Plan de Acțiune', 18, true, [41, 98, 255]);
      yPosition += 10;

      const completedActions = project.action_items.filter(a => a.completed).length;
      addText(`${completedActions}/${project.action_items.length} acțiuni completate`, 11);
      yPosition += 10;

      project.action_items.forEach((item, index) => {
        checkPageBreak(15);

        const checkbox = item.completed ? '☑' : '☐';
        pdf.setFontSize(11);
        pdf.setFont('helvetica', item.completed ? 'normal' : 'bold');
        
        if (item.completed) {
          pdf.setTextColor(150, 150, 150);
        }
        
        pdf.text(`${checkbox} ${item.action}`, margin + 2, yPosition);
        pdf.setTextColor(0, 0, 0);
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Principiul ${item.principle}`, margin + 2, yPosition + 5);
        
        yPosition += 12;
      });
    }

    // Statistics Page
    pdf.addPage();
    yPosition = margin;

    addText('Statistici & Perspective', 20, true, [41, 98, 255]);
    yPosition += 15;

    // Key metrics
    const metrics = [
      { label: 'Principii Complete', value: `${completedCount}/14`, icon: '✓' },
      { label: 'Progres Total', value: `${progress.toFixed(0)}%`, icon: '📊' },
      { label: 'Acțiuni Totale', value: project.action_items.length.toString(), icon: '🎯' },
      { label: 'Acțiuni Complete', value: project.action_items.filter(a => a.completed).length.toString(), icon: '✔️' }
    ];

    metrics.forEach(metric => {
      checkPageBreak(15);
      
      pdf.setFillColor(245, 247, 250);
      pdf.rect(margin, yPosition, maxWidth, 12, 'F');
      
      pdf.setFontSize(12);
      pdf.text(`${metric.icon} ${metric.label}`, margin + 5, yPosition + 8);
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text(metric.value, pageWidth - margin - 5, yPosition + 8, { align: 'right' });
      
      pdf.setFont('helvetica', 'normal');
      yPosition += 15;
    });

    yPosition += 10;

    // Next Steps
    checkPageBreak(40);
    addText('Pașii Următori', 16, true, [41, 98, 255]);
    yPosition += 10;

    if (project.status === 'completed') {
      addText('🎉 Felicitări! Ai completat toate principiile Master Plan.', 12, true);
      yPosition += 8;
      addText('Acum este timpul să implementezi tot ce ai învățat și să-ți atingi obiectivul!', 11);
    } else {
      const nextPrinciple = project.current_principle;
      if (nextPrinciple <= 14) {
        addText(`📍 Următorul principiu: ${PRINCIPLES[nextPrinciple - 1]}`, 12, true);
        yPosition += 8;
        addText('Continuă journey-ul pentru a descoperi și aplica acest principiu în viața ta.', 11);
      }
    }

    yPosition += 15;

    // Footer with date
    const footer = `Generat la ${new Date().toLocaleDateString('ro-RO')} • CEO Mind OS Napoleon Hill System`;
    pdf.setFontSize(9);
    pdf.setTextColor(150, 150, 150);
    pdf.text(footer, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save PDF
    pdf.save(`Napoleon-Hill-${project.project_name.replace(/[^a-z0-9]/gi, '-')}.pdf`);
  }
};
