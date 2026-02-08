/**
 * Utility for tracking completed keys and injecting context
 * into AI planning conversations to prevent re-asking.
 * 
 * Enhanced version: extracts detailed steps with day, HIT/DO type,
 * objective, motivation, and expected results.
 */

export interface StepDetail {
  text: string;      // e.g. "Optimizare platforma B2C"
  day: string;       // e.g. "Luni"
  type: string;      // "HIT" or "DO"
}

export interface CompletedKeyInfo {
  keyNumber: number;
  title: string;
  steps: StepDetail[];
  responsible: string;
  deadline: string;
  objective: string;
  whyImportant: string;
  positiveResult: string;
  negativeResult: string;
}

interface MessageLike {
  role: string;
  content: string;
}

/**
 * Detect if an AI message marks a key as completed.
 * Looks for patterns like "✅ Cheia N completă!" or "Cheia N completa",
 * "Am notat Cheia N", etc.
 */
export function detectCompletedKey(
  aiMessage: string,
  recentMessages: MessageLike[]
): CompletedKeyInfo | null {
  // Match various completion patterns
  const patterns = [
    /Cheia\s+(\d)\s+complet[aă]/i,
    /✅\s*Cheia\s+(\d)/i,
    /Am\s+notat\s+Cheia\s+(\d)/i,
    /Cheia\s+(\d)\s+(?:este\s+)?(?:gata|finalizat[aă]|definit[aă])/i,
    /(?:Perfect|Excelent|Super).*Cheia\s+(\d).*(?:complet|gata|notat)/i,
  ];

  let keyNumber: number | null = null;
  for (const pattern of patterns) {
    const match = aiMessage.match(pattern);
    if (match) {
      keyNumber = parseInt(match[1]);
      break;
    }
  }

  if (!keyNumber || keyNumber < 1 || keyNumber > 4) return null;

  // Use the last 40 messages as context for extraction
  const contextMessages = recentMessages.slice(-40);

  const title = extractKeyTitle(contextMessages, keyNumber);
  const steps = extractStepsDetailed(contextMessages, keyNumber);
  const objective = extractQAField(contextMessages, /ce\s+(?:vrei|dorești|obiectiv|vrei\s+să)/i);
  const whyImportant = extractQAField(contextMessages, /de\s+ce|(?:importan[tț]|motiv|motiva[tț])/i);
  const positiveResult = extractQAField(contextMessages, /(?:rezultat\s+pozitiv|dac[aă]\s+reu[sș]e[sș]ti|impact\s+pozitiv|ce\s+se\s+[iî]nt[aâ]mpl[aă]\s+dac[aă])/i);
  const negativeResult = extractQAField(contextMessages, /(?:rezultat\s+negativ|dac[aă]\s+nu|risc|ce\s+pierzi|impact\s+negativ)/i);
  const responsible = extractQAField(contextMessages, /responsabil/i);
  const deadline = extractQAField(contextMessages, /deadline|termen/i);

  return {
    keyNumber,
    title: title || `Cheia ${keyNumber}`,
    steps,
    objective: objective || '',
    whyImportant: whyImportant || '',
    positiveResult: positiveResult || '',
    negativeResult: negativeResult || '',
    responsible: responsible || 'Nespecificat',
    deadline: deadline || 'Nespecificat',
  };
}

/**
 * Build a context injection message summarizing completed keys with full details.
 * Returns empty string if no keys are completed.
 */
export function buildCompletedKeysContext(completedKeys: CompletedKeyInfo[]): string {
  if (completedKeys.length === 0) return '';

  const keysSummary = completedKeys
    .sort((a, b) => a.keyNumber - b.keyNumber)
    .map((k) => {
      let summary = `--- Cheia ${k.keyNumber}: "${k.title}" ---`;
      
      if (k.objective) {
        summary += `\nObiectiv: ${k.objective}`;
      }
      if (k.whyImportant) {
        summary += `\nDe ce e important: ${k.whyImportant}`;
      }
      if (k.positiveResult) {
        summary += `\nRezultat pozitiv: ${k.positiveResult}`;
      }
      if (k.negativeResult) {
        summary += `\nRezultat negativ: ${k.negativeResult}`;
      }
      
      if (k.steps.length > 0) {
        summary += '\nPași:';
        k.steps.forEach((step, idx) => {
          summary += `\n  ${idx + 1}. ${step.text} - ${step.day} (${step.type})`;
        });
      }
      
      summary += `\nResponsabil: ${k.responsible} | Deadline: ${k.deadline}`;
      
      return summary;
    })
    .join('\n\n');

  const completedNumbers = completedKeys.map((k) => k.keyNumber).sort();
  const remainingNumbers = [1, 2, 3, 4].filter((n) => !completedNumbers.includes(n));

  return `[CONTEXT AUTOMAT] Cheile deja completate (NU întreba din nou pentru ele):

${keysSummary}

Cheile completate: ${completedNumbers.join(', ')} (${completedKeys.length} din 4).${
    remainingNumbers.length > 0
      ? ` Mai trebuie definite cheile: ${remainingNumbers.join(', ')}.`
      : ' Toate cheile sunt definite.'
  }`;
}

// ── Internal helpers ──

/**
 * Extract detailed steps with day and HIT/DO type from messages.
 * Looks for patterns like:
 * - "Pasul 1: Optimizare platforma (Luni, HIT)"
 * - "Pas 1 - Optimizare platforma - Luni (HIT)"
 * - "1. Optimizare platforma → Luni, HIT"
 * - "Am notat: Pasul 1, Luni, HIT - Optimizare platforma"
 * - AI confirmations with structured step info
 */
function extractStepsDetailed(messages: MessageLike[], _keyNumber: number): StepDetail[] {
  const steps: StepDetail[] = [];
  const days = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Sambata', 'Marti', 'Miercuri'];
  const dayPattern = days.join('|');
  
  // Patterns that capture step text, day, and type
  const stepPatterns = [
    // "Pasul 1: Text - Luni (HIT)" or "Pasul 1: Text (Luni, HIT)"
    new RegExp(`Pas(?:ul)?\\s*(\\d)\\s*[:\\-–]\\s*(.+?)\\s*[\\(\\-–]\\s*(${dayPattern})\\s*[,\\s]*\\s*(HIT|DO)\\s*\\)?`, 'gi'),
    // "1. Text - Luni (HIT)"
    new RegExp(`(\\d)\\.\\s*(.+?)\\s*[\\-–]\\s*(${dayPattern})\\s*[\\(,]\\s*(HIT|DO)\\s*\\)?`, 'gi'),
    // "Text → Luni, HIT" with step number context
    new RegExp(`(\\d)\\.?\\s*(.+?)\\s*→\\s*(${dayPattern})\\s*[,\\s]\\s*(HIT|DO)`, 'gi'),
    // "Am notat. Pasul 1, Luni, HIT" or "Am notat: Pasul 1 - Text, Luni, HIT"
    new RegExp(`(?:Am\\s+notat|Notat)[.:]?\\s*Pas(?:ul)?\\s*(\\d)\\s*[,\\-–:]\\s*(.+?)[,\\s]+(${dayPattern})\\s*[,\\s]+(HIT|DO)`, 'gi'),
  ];

  const seenSteps = new Set<number>();

  for (const msg of messages) {
    for (const pattern of stepPatterns) {
      // Reset lastIndex for global regex
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(msg.content)) !== null) {
        const stepNum = parseInt(match[1]);
        if (!seenSteps.has(stepNum) && stepNum >= 1 && stepNum <= 10) {
          seenSteps.add(stepNum);
          steps.push({
            text: match[2].trim().replace(/[\(\)\-–→,]+$/, '').trim(),
            day: normalizeDay(match[3]),
            type: match[4].toUpperCase(),
          });
        }
      }
    }
  }

  // Sort by step number implied by order
  return steps;
}

/**
 * Normalize day names to consistent Romanian format.
 */
function normalizeDay(day: string): string {
  const normalized = day.trim().toLowerCase();
  const dayMap: Record<string, string> = {
    'luni': 'Luni',
    'marti': 'Marți',
    'marți': 'Marți',
    'miercuri': 'Miercuri',
    'joi': 'Joi',
    'vineri': 'Vineri',
    'sambata': 'Sâmbătă',
    'sâmbătă': 'Sâmbătă',
  };
  return dayMap[normalized] || day.trim();
}

/**
 * Extract a Q&A field: find the AI question matching the pattern,
 * then return the user's answer.
 * Searches backwards to get the most recent match.
 */
function extractQAField(messages: MessageLike[], questionPattern: RegExp): string {
  for (let i = messages.length - 1; i >= 1; i--) {
    if (messages[i - 1].role === 'assistant' && questionPattern.test(messages[i - 1].content)) {
      if (messages[i].role === 'user') {
        return messages[i].content.substring(0, 200).trim();
      }
    }
  }
  return '';
}

/**
 * Extract the title/objective for a specific key number.
 */
function extractKeyTitle(messages: MessageLike[], keyNumber: number): string {
  // Look for user's first answer after AI asks about this key
  const keyPattern = new RegExp(
    `Cheia\\s+${keyNumber}.*(?:ce.*vrei|vrei.*faci)|Ce.*Cheia\\s+${keyNumber}`,
    'i'
  );

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === 'assistant' && keyPattern.test(msg.content)) {
      if (i + 1 < messages.length && messages[i + 1].role === 'user') {
        return messages[i + 1].content.substring(0, 120).trim();
      }
    }
  }

  // Fallback: look for AI confirmation that mentions the key title in quotes
  for (const msg of messages) {
    if (msg.role === 'assistant') {
      const titleMatch = msg.content.match(
        new RegExp(`Cheia\\s+${keyNumber}[:\\s]+[""]([^""]+)[""]`, 'i')
      );
      if (titleMatch) return titleMatch[1].substring(0, 120);
    }
  }

  return '';
}
