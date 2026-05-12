/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as burnoutResults } from './burnout-results.tsx'
import { template as burnoutRecovery1 } from './burnout-recovery-1.tsx'
import { template as burnoutRecovery2 } from './burnout-recovery-2.tsx'
import { template as burnoutRecovery3 } from './burnout-recovery-3.tsx'
import { template as ebookDelivery } from './ebook-delivery.tsx'
import { template as challengeUpsell1 } from './challenge-upsell-1.tsx'
import { template as challengeUpsell2 } from './challenge-upsell-2.tsx'
import { template as challengeWelcomeSetPassword } from './challenge-welcome-set-password.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'burnout-results': burnoutResults,
  'burnout-recovery-1': burnoutRecovery1,
  'burnout-recovery-2': burnoutRecovery2,
  'burnout-recovery-3': burnoutRecovery3,
  'ebook-delivery': ebookDelivery,
  'challenge-upsell-1': challengeUpsell1,
  'challenge-upsell-2': challengeUpsell2,
  'challenge-welcome-set-password': challengeWelcomeSetPassword,
}
