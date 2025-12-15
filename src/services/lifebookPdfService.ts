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
  coverImage?: string; // Base64 encoded image
  printOptimized?: boolean;
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
  
  // Print-optimized margins (larger for binding)
  const margin = data.printOptimized ? 25 : 20;
  const innerMargin = data.printOptimized ? 30 : 20; // Extra margin on binding side
  const contentWidth = pageWidth - margin - innerMargin;
  let yPos = margin;

  // Get current page margin (alternates for print-optimized double-sided)
  const getLeftMargin = () => {
    if (!data.printOptimized) return margin;
    const pageNum = doc.getCurrentPageInfo().pageNumber;
    return pageNum % 2 === 0 ? margin : innerMargin;
  };

  const getRightMargin = () => {
    if (!data.printOptimized) return margin;
    const pageNum = doc.getCurrentPageInfo().pageNumber;
    return pageNum % 2 === 0 ? innerMargin : margin;
  };

  // Helper function to add page break if needed
  const checkPageBreak = (requiredSpace: number) => {
    const bottomMargin = data.printOptimized ? 35 : 30;
    if (yPos + requiredSpace > pageHeight - bottomMargin) {
      doc.addPage();
      yPos = data.printOptimized ? 30 : margin;
      return true;
    }
    return false;
  };

  // Helper to draw a horizontal line
  const drawLine = (y: number, color: [number, number, number] = [200, 200, 200]) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.3);
    doc.line(getLeftMargin(), y, pageWidth - getRightMargin(), y);
  };

  // ========== COVER PAGE ==========
  // Background gradient effect (simulated with rectangles)
  doc.setFillColor(15, 23, 42); // Dark blue
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Add subtle gradient overlay
  for (let i = 0; i < 20; i++) {
    const alpha = 0.02 * i;
    doc.setFillColor(139, 92, 246);
    doc.setGState(doc.GState({ opacity: alpha }));
    doc.rect(0, pageHeight - (i * 15), pageWidth, 15, 'F');
  }
  doc.setGState(doc.GState({ opacity: 1 }));

  // Cover image/logo if provided
  let titleYOffset = 80;
  if (data.coverImage) {
    try {
      const imgSize = 60; // Size in mm
      const imgX = (pageWidth - imgSize) / 2;
      const imgY = 35;
      doc.addImage(data.coverImage, 'JPEG', imgX, imgY, imgSize, imgSize);
      titleYOffset = 110; // Push title down
    } catch (error) {
      console.error('Error adding cover image:', error);
    }
  }

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(255, 255, 255);
  doc.text('HAVE IT ALL', pageWidth / 2, titleYOffset, { align: 'center' });

  doc.setFontSize(24);
  doc.setTextColor(139, 92, 246); // Purple accent
  doc.text('My Life Book', pageWidth / 2, titleYOffset + 15, { align: 'center' });

  // Decorative line
  doc.setDrawColor(139, 92, 246);
  doc.setLineWidth(1);
  doc.line(60, titleYOffset + 25, pageWidth - 60, titleYOffset + 25);

  // User name if provided
  if (data.userName) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(200, 200, 200);
    doc.text(data.userName, pageWidth / 2, titleYOffset + 45, { align: 'center' });
  }

  // Core 4 categories section
  const iconLabels = language === 'ro' 
    ? ['Corp', 'Spiritualitate', 'Relații', 'Business']
    : ['Body', 'Spirituality', 'Relationships', 'Business'];
  
  const categoryY = data.coverImage ? 175 : 160;
  doc.setFontSize(12);
  doc.setTextColor(180, 180, 180);
  
  const iconSpacing = (pageWidth - 80) / 4;
  iconLabels.forEach((label, index) => {
    const x = 50 + (iconSpacing * index);
    doc.text(label, x, categoryY, { align: 'center' });
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

  // Print optimization note
  if (data.printOptimized) {
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      language === 'ro' ? 'Versiune optimizată pentru tipărire' : 'Print-optimized version',
      pageWidth / 2,
      pageHeight - 20,
      { align: 'center' }
    );
  }

  // ========== TABLE OF CONTENTS ==========
  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  const tocMargin = getLeftMargin();
  yPos = data.printOptimized ? 30 : margin;
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
    doc.text(`${category.icon} ${language === 'ro' ? category.nameRo : category.name}`, tocMargin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);

    category.subcategories.forEach((sub) => {
      const hasContent = data.entries.some(e => e.subcategory === sub.key);
      const text = `${sub.icon} ${language === 'ro' ? sub.nameRo : sub.name}`;
      const status = hasContent ? '' : (language === 'ro' ? ' (necompletat)' : ' (not completed)');
      
      doc.text(`    ${text}${status}`, tocMargin, yPos);
      
      // Page number dots
      const textWidth = doc.getTextWidth(`    ${text}${status}`);
      const dotsStart = tocMargin + textWidth + 2;
      const dotsEnd = pageWidth - getRightMargin() - 15;
      
      doc.setTextColor(180, 180, 180);
      let dotX = dotsStart;
      while (dotX < dotsEnd) {
        doc.text('.', dotX, yPos);
        dotX += 2;
      }
      
      doc.setTextColor(80, 80, 80);
      doc.text(hasContent ? String(pageNumber) : '-', pageWidth - getRightMargin(), yPos, { align: 'right' });
      
      if (hasContent) pageNumber++;
      yPos += 6;
    });
    yPos += 5;
  });

  // ========== CONTENT PAGES ==========
  LIFEBOOK_STRUCTURE.forEach((category) => {
    const color = CATEGORY_COLORS[category.key];

    // Add category divider page for print-optimized version
    if (data.printOptimized) {
      const hasAnyCategoryContent = category.subcategories.some(sub => 
        data.entries.some(e => e.subcategory === sub.key)
      );
      
      if (hasAnyCategoryContent) {
        doc.addPage();
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(48);
        doc.setTextColor(255, 255, 255);
        doc.text(category.icon, pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
        
        doc.setFontSize(32);
        doc.text(
          language === 'ro' ? category.nameRo : category.name, 
          pageWidth / 2, 
          pageHeight / 2 + 15, 
          { align: 'center' }
        );
      }
    }

    category.subcategories.forEach((sub) => {
      const subcategoryEntries = data.entries.filter(e => e.subcategory === sub.key);
      
      if (subcategoryEntries.length === 0) return;

      // New page for each subcategory
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      const leftMargin = getLeftMargin();
      const rightMargin = getRightMargin();
      const currentContentWidth = pageWidth - leftMargin - rightMargin;
      
      yPos = data.printOptimized ? 30 : margin;

      // Category header bar
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(0, 0, pageWidth, 15, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(`${category.icon} ${language === 'ro' ? category.nameRo : category.name}`, leftMargin, 10);

      yPos = 35;

      // Subcategory title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(30, 30, 30);
      doc.text(`${sub.icon} ${language === 'ro' ? sub.nameRo : sub.name}`, leftMargin, yPos);
      yPos += 12;

      drawLine(yPos, color);
      yPos += 15;

      // Sections
      SECTIONS.forEach((section) => {
        const entry = subcategoryEntries.find(e => e.section === section.key);
        
        if (!entry || !entry.summary) return;

        // For print-optimized, start important sections on new page
        if (data.printOptimized && (section.key === 'vision' || section.key === 'strategy')) {
          if (yPos > 100) {
            doc.addPage();
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
            
            // Re-add header on new page
            doc.setFillColor(color[0], color[1], color[2]);
            doc.rect(0, 0, pageWidth, 15, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(255, 255, 255);
            doc.text(`${sub.icon} ${language === 'ro' ? sub.nameRo : sub.name}`, getLeftMargin(), 10);
            
            yPos = 30;
          }
        }

        checkPageBreak(40);

        // Section header with decorative element
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(color[0], color[1], color[2]);
        
        const sectionTitle = `${section.icon} ${language === 'ro' ? section.nameRo : section.name}`;
        doc.text(sectionTitle, getLeftMargin(), yPos);
        
        // Underline for section
        const titleWidth = doc.getTextWidth(sectionTitle);
        doc.setDrawColor(color[0], color[1], color[2]);
        doc.setLineWidth(0.5);
        doc.line(getLeftMargin(), yPos + 2, getLeftMargin() + titleWidth, yPos + 2);
        
        yPos += 10;

        // Section content with proper line height
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);

        const summary = entry.summary || '';
        const lines = doc.splitTextToSize(summary, currentContentWidth);
        
        const lineHeight = data.printOptimized ? 7 : 6;
        lines.forEach((line: string) => {
          checkPageBreak(lineHeight + 2);
          doc.text(line, getLeftMargin(), yPos);
          yPos += lineHeight;
        });

        yPos += data.printOptimized ? 15 : 10;
      });
    });
  });

  // ========== FOOTER ON ALL PAGES ==========
  const pageCount = doc.getNumberOfPages();
  for (let i = 2; i <= pageCount; i++) { // Skip cover page
    doc.setPage(i);
    
    // Determine margins for this page
    const footerLeftMargin = data.printOptimized ? (i % 2 === 0 ? margin : innerMargin) : margin;
    const footerRightMargin = data.printOptimized ? (i % 2 === 0 ? innerMargin : margin) : margin;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    
    // Page number
    doc.text(
      `${language === 'ro' ? 'Pagina' : 'Page'} ${i - 1} ${language === 'ro' ? 'din' : 'of'} ${pageCount - 1}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    
    // Book title on alternating sides for print
    if (data.printOptimized) {
      doc.text(
        'Have It All - My Life Book',
        i % 2 === 0 ? footerLeftMargin : pageWidth - footerRightMargin,
        pageHeight - 10,
        { align: i % 2 === 0 ? 'left' : 'right' }
      );
    } else {
      doc.text(
        'Have It All - My Life Book',
        pageWidth - margin,
        pageHeight - 10,
        { align: 'right' }
      );
    }
  }

  // Save the PDF
  const suffix = data.printOptimized ? '-print' : '';
  const fileName = `Life-Book-${data.generatedAt.toISOString().split('T')[0]}${suffix}.pdf`;
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
