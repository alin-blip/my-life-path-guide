import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [state, setState] = useState<'loading'|'valid'|'used'|'invalid'|'done'|'error'>('loading');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!token) { setState('invalid'); return; }
    (async () => {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`;
        const res = await fetch(url, { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } });
        const data = await res.json();
        if (data.status === 'used' || data.alreadyUnsubscribed) { setState('used'); setEmail(data.email || ''); }
        else if (data.valid || data.email) { setState('valid'); setEmail(data.email || ''); }
        else setState('invalid');
      } catch { setState('error'); }
    })();
  }, [token]);

  const confirm = async () => {
    try {
      await supabase.functions.invoke('handle-email-unsubscribe', { body: { token } });
      setState('done');
    } catch { setState('error'); }
  };

  return (
    <div className="min-h-screen bg-[#10172d] text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <h1 className="text-amber-400 text-2xl font-bold mb-4">CEO MIND OS</h1>
        {state === 'loading' && <p>Se verifică...</p>}
        {state === 'valid' && (
          <>
            <h2 className="text-xl font-bold mb-3">Confirmă dezabonarea</h2>
            <p className="text-white/70 text-sm mb-6">{email}</p>
            <button onClick={confirm} className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-[#10172d] font-bold rounded-lg">Da, dezabonează-mă</button>
          </>
        )}
        {state === 'used' && <p className="text-white/80">Ești deja dezabonat. {email}</p>}
        {state === 'done' && <p className="text-white/80">✅ Dezabonat cu succes. Nu vei mai primi emailuri.</p>}
        {state === 'invalid' && <p className="text-white/80">Link invalid sau expirat.</p>}
        {state === 'error' && <p className="text-white/80">Eroare. Încearcă din nou.</p>}
      </div>
    </div>
  );
}
