import jsPDF from 'jspdf';
import { 
  LifebookEntry, 
  LIFEBOOK_STRUCTURE, 
  SECTIONS,
  getSubcategoryInfo,
  getCategoryForSubcategory,
  LifebookSubcategory,
  LifebookSection
} from '@/components/lifebook/types';

interface LifebookPdfData {
  entries: LifebookEntry[];
  userName?: string;
  generatedAt: Date;
}

// Section display names
const SECTION_NAMES: Record<LifebookSection, { en: string; ro: string }> = {
  premise: { en: 'Premise', ro: 'Premise' },
  vision: { en: 'Vision', ro: 'Viziune' },
  purpose: { en: 'Purpose', ro: 'Scop' },
  strategy: { en: 'Strategy', ro: 'Strategie' },
  notes: { en: 'Notes', ro: 'Note' }
};

// Colors for categories
const CATEGORY_COLORS: Record<string, [number, number, number]> = {
  body: [59, 130, 246],      // Blue
  being: [139, 92, 246],     // Purple
  balance: [236, 72, 153],   // Pink
  business: [34, 197, 94]    // Green
};

export const exportLifebookToPdf = async (data: LifebookPdfData, language: 'en' | 'ro' = 'ro') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;

  // Helper function to add page break if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 30) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Helper to draw a horizontal line
  const drawLine = (y: number, color: [number, number, number] = [200, 200, 200]) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
  };

  // ========== COVER PAGE ==========
  // Background gradient effect (simulated with rectangles)
  doc.setFillColor(15, 23, 42); // Dark blue
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(255, 255, 255);
  doc.text('HAVE IT ALL', pageWidth / 2, 80, { align: 'center' });

  doc.setFontSize(24);
  doc.setTextColor(139, 92, 246); // Purple accent
  doc.text('My Life Book', pageWidth / 2, 95, { align: 'center' });

  // Decorative line
  doc.setDrawColor(139, 92, 246);
  doc.setLineWidth(1);
  doc.line(60, 105, pageWidth - 60, 105);

  // User name if provided
  if (data.userName) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(200, 200, 200);
    doc.text(data.userName, pageWidth / 2, 125, { align: 'center' });
  }

  // Core 4 icons
  const icons = ['💪', '🙏', '👥', '💼'];
  const iconLabels = language === 'ro' 
    ? ['Corp', 'Spiritualitate', 'Relații', 'Business']
    : ['Body', 'Spirituality', 'Relationships', 'Business'];
  
  doc.setFontSize(12);
  doc.setTextColor(180, 180, 180);
  
  const iconSpacing = (pageWidth - 80) / 4;
  icons.forEach((_, index) => {
    const x = 50 + (iconSpacing * index);
    doc.text(iconLabels[index], x, 160, { align: 'center' });
  });

  // Generation date
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  const dateStr = data.generatedAt.toLocaleDateString(language === 'ro' ? 'ro-RO' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(
    language === 'ro' ? `Generat: ${dateStr}` : `Generated: ${dateStr}`,
    pageWidth / 2,
    pageHeight - 30,
    { align: 'center' }
  );

  // ========== TABLE OF CONTENTS ==========
  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  yPos = margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(30, 30, 30);
  doc.text(language === 'ro' ? 'Cuprins' : 'Table of Contents', pageWidth / 2, yPos, { align: 'center' });
  yPos += 20;

  drawLine(yPos);
  yPos += 15;

  let pageNumber = 3; // Starting page for content

  LIFEBOOK_STRUCTURE.forEach((category) => {
    const color = CATEGORY_COLORS[category.key];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(`${category.icon} ${language === 'ro' ? category.nameRo : category.name}`, margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);

    category.subcategories.forEach((sub) => {
      const hasContent = data.entries.some(e => e.subcategory === sub.key);
      const text = `${sub.icon} ${language === 'ro' ? sub.nameRo : sub.name}`;
      const status = hasContent ? '' : (language === 'ro' ? ' (necompletat)' : ' (not completed)');
      
      doc.text(`    ${text}${status}`, margin, yPos);
      
      // Page number dots
      const textWidth = doc.getTextWidth(`    ${text}${status}`);
      const dotsStart = margin + textWidth + 2;
      const dotsEnd = pageWidth - margin - 15;
      
      doc.setTextColor(180, 180, 180);
      let dotX = dotsStart;
      while (dotX < dotsEnd) {
        doc.text('.', dotX, yPos);
        dotX += 2;
      }
      
      doc.setTextColor(80, 80, 80);
      doc.text(hasContent ? String(pageNumber) : '-', pageWidth - margin, yPos, { align: 'right' });
      
      if (hasContent) pageNumber++;
      yPos += 6;
    });
    yPos += 5;
  });

  // ========== CONTENT PAGES ==========
  LIFEBOOK_STRUCTURE.forEach((category) => {
    const color = CATEGORY_COLORS[category.key];

    category.subcategories.forEach((sub) => {
      const subcategoryEntries = data.entries.filter(e => e.subcategory === sub.key);
      
      if (subcategoryEntries.length === 0) return;

      // New page for each subcategory
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      yPos = margin;

      // Category header bar
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(0, 0, pageWidth, 15, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(`${category.icon} ${language === 'ro' ? category.nameRo : category.name}`, margin, 10);

      yPos = 30;

      // Subcategory title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(30, 30, 30);
      doc.text(`${sub.icon} ${language === 'ro' ? sub.nameRo : sub.name}`, margin, yPos);
      yPos += 12;

      drawLine(yPos, color);
      yPos += 15;

      // Sections
      SECTIONS.forEach((section) => {
        const entry = subcategoryEntries.find(e => e.section === section.key);
        
        if (!entry || !entry.summary) return;

        checkPageBreak(40);

        // Section header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(
          `${section.icon} ${language === 'ro' ? section.nameRo : section.name}`,
          margin,
          yPos
        );
        yPos += 8;

        // Section content
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);

        const summary = entry.summary || '';
        const lines = doc.splitTextToSize(summary, contentWidth);
        
        lines.forEach((line: string) => {
          checkPageBreak(7);
          doc.text(line, margin, yPos);
          yPos += 6;
        });

        yPos += 10;
      });
    });
  });

  // ========== FOOTER ON ALL PAGES ==========
  const pageCount = doc.getNumberOfPages();
  for (let i = 2; i <= pageCount; i++) { // Skip cover page
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `${language === 'ro' ? 'Pagina' : 'Page'} ${i - 1} ${language === 'ro' ? 'din' : 'of'} ${pageCount - 1}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      'Have It All - My Life Book',
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  // Save the PDF
  const fileName = `Life-Book-${data.generatedAt.toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);

  return fileName;
};

// Get completion stats for the PDF
export const getLifebookStats = (entries: LifebookEntry[]) => {
  const stats = {
    totalSubcategories: 12,
    completedSubcategories: 0,
    totalSections: 60, // 12 subcategories * 5 sections
    completedSections: 0,
    categoryProgress: {} as Record<string, { completed: number; total: number }>
  };

  LIFEBOOK_STRUCTURE.forEach((category) => {
    const categoryTotal = category.subcategories.length * SECTIONS.length;
    let categoryCompleted = 0;

    category.subcategories.forEach((sub) => {
      const subEntries = entries.filter(e => e.subcategory === sub.key && e.status === 'completed');
      categoryCompleted += subEntries.length;
      
      if (subEntries.length === SECTIONS.length) {
        stats.completedSubcategories++;
      }
    });

    stats.completedSections += categoryCompleted;
    stats.categoryProgress[category.key] = {
      completed: categoryCompleted,
      total: categoryTotal
    };
  });

  return stats;
};
