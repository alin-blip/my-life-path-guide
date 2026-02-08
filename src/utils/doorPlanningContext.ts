/**
 * Utility for tracking completed keys and injecting context
 * into AI planning conversations to prevent re-asking.
 */

export interface CompletedKeyInfo {
  keyNumber: number;
  title: string;
  stepsCount: number;
  responsible: string;
  deadline: string;
}

interface MessageLike {
  role: string;
  content: string;
}

/**
 * Detect if an AI message marks a key as completed.
 * Looks for patterns like "✅ Cheia N completă!" or "Cheia N completa".
 */
export function detectCompletedKey(
  aiMessage: string,
  recentMessages: MessageLike[]
): CompletedKeyInfo | null {
  const match = aiMessage.match(/Cheia\s+(\d)\s+complet[aă]/i);
  if (!match) return null;

  const keyNumber = parseInt(match[1]);
  if (keyNumber < 1 || keyNumber > 4) return null;

  const title = extractKeyTitle(recentMessages, keyNumber);
  const stepsCount = countStepsForKey(recentMessages, keyNumber);
  const responsible = extractFieldBackwards(recentMessages, /responsabil/i);
  const deadline = extractFieldBackwards(recentMessages, /deadline|termen/i);

  return {
    keyNumber,
    title: title || `Cheia ${keyNumber}`,
    stepsCount,
    responsible: responsible || 'Nespecificat',
    deadline: deadline || 'Nespecificat',
  };
}

/**
 * Build a context injection message summarizing completed keys.
 * Returns empty string if no keys are completed.
 */
export function buildCompletedKeysContext(completedKeys: CompletedKeyInfo[]): string {
  if (completedKeys.length === 0) return '';

  const keysSummary = completedKeys
    .sort((a, b) => a.keyNumber - b.keyNumber)
    .map(
      (k) =>
        `- Cheia ${k.keyNumber}: "${k.title}" - ${k.stepsCount} pași, responsabil: ${k.responsible}, deadline: ${k.deadline}`
    )
    .join('\n');

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

function extractKeyTitle(messages: MessageLike[], keyNumber: number): string {
  // Look for user's first answer after AI asks about this key
  const keyPattern = new RegExp(
    `Cheia\\s+${keyNumber}.*(?:ce.*vrei|vrei.*faci)|Ce.*Cheia\\s+${keyNumber}`,
    'i'
  );

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === 'assistant' && keyPattern.test(msg.content)) {
      // Next user message is likely the title/objective
      if (i + 1 < messages.length && messages[i + 1].role === 'user') {
        return messages[i + 1].content.substring(0, 120).trim();
      }
    }
  }

  // Fallback: look for AI confirmation that mentions the key title
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

function countStepsForKey(messages: MessageLike[], _keyNumber: number): number {
  // Count distinct step mentions in recent messages
  let maxStepNum = 0;
  for (const msg of messages) {
    // Match "Pasul 1", "Pasul 2", "pas 3", etc.
    const stepMatches = msg.content.matchAll(/pas(?:ul)?\s+(\d)/gi);
    for (const m of stepMatches) {
      const num = parseInt(m[1]);
      if (num > maxStepNum) maxStepNum = num;
    }
  }
  return maxStepNum;
}

function extractFieldBackwards(messages: MessageLike[], pattern: RegExp): string {
  // Search backwards for the AI question matching the pattern, return user's answer
  for (let i = messages.length - 1; i >= 1; i--) {
    if (messages[i - 1].role === 'assistant' && pattern.test(messages[i - 1].content)) {
      if (messages[i].role === 'user') {
        return messages[i].content.substring(0, 100).trim();
      }
    }
  }
  return '';
}
