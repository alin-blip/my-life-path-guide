// Bilingual copy for auth email templates (RO / EN)
export type EmailLang = 'ro' | 'en'

export const normalizeLang = (raw?: string | null): EmailLang =>
  (raw || '').toLowerCase().startsWith('en') ? 'en' : 'ro'

type Dict = Record<EmailLang, Record<string, string>>

export const SUBJECTS: Record<string, Record<EmailLang, string>> = {
  signup: { ro: 'Confirmă-ți emailul · CEO Mind OS', en: 'Confirm your email · CEO Mind OS' },
  invite: { ro: 'Ai primit o invitație · CEO Mind OS', en: "You've been invited · CEO Mind OS" },
  magiclink: { ro: 'Linkul tău de autentificare · CEO Mind OS', en: 'Your login link · CEO Mind OS' },
  recovery: { ro: 'Resetează-ți parola · CEO Mind OS', en: 'Reset your password · CEO Mind OS' },
  email_change: { ro: 'Confirmă noul email · CEO Mind OS', en: 'Confirm your new email · CEO Mind OS' },
  reauthentication: { ro: 'Codul tău de verificare · CEO Mind OS', en: 'Your verification code · CEO Mind OS' },
}

export const T: Record<string, Dict> = {
  signup: {
    ro: {
      preview: 'Confirmă-ți emailul pentru CEO Mind OS',
      heading: 'Confirmă-ți emailul',
      body: 'Bine ai venit. Ai făcut primul pas — un pas mic, dar cel mai important. Apasă butonul de mai jos pentru a-ți activa contul și pentru a începe să construiești o viață pe care nu vrei să o eviți.',
      cta: 'Activează contul →',
      orCopy: 'Sau copiază linkul în browser:',
      footer: 'Dacă nu ai creat un cont, poți ignora în siguranță acest email.',
      signoff: '— Alin & echipa CEO Mind OS',
    },
    en: {
      preview: 'Confirm your email for CEO Mind OS',
      heading: 'Confirm your email',
      body: "Welcome. You took the first step — small, but the most important one. Click the button below to activate your account and start building a life you don't want to escape from.",
      cta: 'Activate account →',
      orCopy: 'Or copy the link into your browser:',
      footer: "If you didn't create an account, you can safely ignore this email.",
      signoff: '— Alin & the CEO Mind OS team',
    },
  },
  recovery: {
    ro: {
      preview: 'Resetează-ți parola pentru CEO Mind OS',
      heading: 'Resetează-ți parola',
      body: 'Am primit o cerere de resetare a parolei. Apasă butonul de mai jos pentru a-ți alege una nouă. Linkul expiră în 60 de minute.',
      cta: 'Setează parolă nouă →',
      orCopy: 'Sau copiază linkul în browser:',
      footer: 'Dacă nu ai cerut resetarea parolei, ignoră acest email — contul tău rămâne în siguranță.',
    },
    en: {
      preview: 'Reset your password for CEO Mind OS',
      heading: 'Reset your password',
      body: 'We received a password reset request. Click the button below to choose a new one. The link expires in 60 minutes.',
      cta: 'Set new password →',
      orCopy: 'Or copy the link into your browser:',
      footer: "If you didn't request a password reset, ignore this email — your account is safe.",
    },
  },
  magiclink: {
    ro: {
      preview: 'Linkul tău de autentificare · CEO Mind OS',
      heading: 'Linkul tău de autentificare',
      body: 'Apasă butonul de mai jos pentru a te autentifica. Linkul expiră în câteva minute, deci folosește-l acum.',
      cta: 'Intră în cont →',
      orCopy: 'Sau copiază linkul în browser:',
      footer: 'Dacă nu ai cerut acest link, ignoră acest email.',
    },
    en: {
      preview: 'Your login link · CEO Mind OS',
      heading: 'Your login link',
      body: 'Click the button below to sign in. The link expires in a few minutes, so use it now.',
      cta: 'Sign in →',
      orCopy: 'Or copy the link into your browser:',
      footer: "If you didn't request this link, ignore this email.",
    },
  },
  invite: {
    ro: {
      preview: 'Ai primit o invitație la CEO Mind OS',
      heading: 'Ai fost invitat(ă)',
      body: 'Cineva te-a invitat să intri în <strong>CEO Mind OS</strong> — sistemul de operare pentru antreprenori care vor Body, Being, Balance & Business aliniate.',
      cta: 'Acceptă invitația →',
      footer: 'Dacă nu te așteptai la această invitație, poți ignora în siguranță acest email.',
    },
    en: {
      preview: "You've been invited to CEO Mind OS",
      heading: "You've been invited",
      body: 'Someone invited you to join <strong>CEO Mind OS</strong> — the operating system for founders who want Body, Being, Balance & Business in alignment.',
      cta: 'Accept invite →',
      footer: "If you weren't expecting this invite, you can safely ignore this email.",
    },
  },
  email_change: {
    ro: {
      preview: 'Confirmă schimbarea emailului · CEO Mind OS',
      heading: 'Confirmă schimbarea emailului',
      bodyPrefix: 'Ai cerut să schimbi adresa de email de la ',
      bodyMiddle: ' la ',
      bodySuffix: '.',
      action: 'Apasă butonul de mai jos pentru a confirma:',
      cta: 'Confirmă schimbarea →',
      footer: 'Dacă nu ai cerut tu această schimbare, securizează-ți contul imediat.',
    },
    en: {
      preview: 'Confirm your email change · CEO Mind OS',
      heading: 'Confirm your email change',
      bodyPrefix: 'You requested to change your email address from ',
      bodyMiddle: ' to ',
      bodySuffix: '.',
      action: 'Click the button below to confirm:',
      cta: 'Confirm change →',
      footer: "If you didn't request this change, secure your account immediately.",
    },
  },
  reauthentication: {
    ro: {
      preview: 'Codul tău de verificare · CEO Mind OS',
      heading: 'Confirmă-ți identitatea',
      body: 'Folosește codul de mai jos pentru a continua:',
      footer: 'Codul expiră în câteva minute. Dacă nu ai cerut acest cod, ignoră acest email.',
    },
    en: {
      preview: 'Your verification code · CEO Mind OS',
      heading: 'Confirm your identity',
      body: 'Use the code below to continue:',
      footer: "The code expires in a few minutes. If you didn't request this code, ignore this email.",
    },
  },
}
