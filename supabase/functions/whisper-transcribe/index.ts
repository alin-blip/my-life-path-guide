import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

// Convert PCM16 bytes to WAV container
function createWavFromPCM(pcmBytes: Uint8Array, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBytes.byteLength;

  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true);  // Audio format PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const wavBytes = new Uint8Array(44 + dataSize);
  wavBytes.set(new Uint8Array(header), 0);
  wavBytes.set(pcmBytes, 44);
  return wavBytes;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const retryWithBackoff = async (fn: () => Promise<Response>, maxRetries = 2) => {
  const delays = [800, 1600]; // Backoff delays in ms
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fn();
      
      // If rate limited and we have retries left, wait and retry
      if ((response.status === 429 || response.status === 402) && attempt < maxRetries) {
        const retryAfter = response.headers.get('retry-after');
        const delayMs = retryAfter 
          ? parseInt(retryAfter) * 1000 
          : delays[attempt] || 1600;
        
        console.log(`⏳ Rate limited (attempt ${attempt + 1}/${maxRetries + 1}), retrying after ${delayMs}ms`);
        await sleep(delayMs);
        continue;
      }
      
      return response;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      console.log(`⏳ Error on attempt ${attempt + 1}, retrying after ${delays[attempt]}ms`);
      await sleep(delays[attempt]);
    }
  }
  
  throw new Error('Max retries exceeded');
};



serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured');
      throw new Error('OPENAI_API_KEY not configured');
    }

    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    console.log('🎙️ Processing audio transcription...');
    console.log('📊 Audio data length:', audio.length);

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio);
    console.log('✅ Audio decoded, size:', binaryAudio.length, 'bytes');
    
    // Prepare form data (detect format, wrap PCM to WAV)
    const RIFF = binaryAudio[0] === 0x52 && binaryAudio[1] === 0x49 && binaryAudio[2] === 0x46 && binaryAudio[3] === 0x46;
    const WEBM = binaryAudio[0] === 0x1A && binaryAudio[1] === 0x45 && binaryAudio[2] === 0xDF && binaryAudio[3] === 0xA3;

    let fileBytes = binaryAudio;
    let filename = 'audio.wav';
    let mime = 'audio/wav';

    if (WEBM) {
      filename = 'audio.webm';
      mime = 'audio/webm';
    } else if (!RIFF) {
      // Assume raw PCM16 at 24kHz, wrap to WAV
      fileBytes = createWavFromPCM(binaryAudio);
      console.log('🔄 Wrapped PCM to WAV, size:', fileBytes.length);
    }

    const formData = new FormData();
    const blob = new Blob([fileBytes], { type: mime });
    formData.append('file', blob, filename);
    formData.append('model', 'whisper-1');
    formData.append('language', 'ro');
    formData.append('response_format', 'json');

    console.log('📤 Sending to OpenAI Whisper API...');

    // Send to OpenAI with retry logic
    const response = await retryWithBackoff(() => 
      fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData,
      })
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      
      // Gracefully signal rate/quota issues without 4xx to avoid UI crash overlays
      if (response.status === 429 || response.status === 402) {
        const retryAfter = response.headers.get('retry-after');
        return new Response(
          JSON.stringify({ 
            error: response.status === 429 ? 'Rate limit exceeded' : 'Insufficient quota',
            code: response.status,
            shouldFallback: true,
            retryAfter: retryAfter ? Number(retryAfter) : undefined
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Transcription successful:', result.text);

    return new Response(
      JSON.stringify({ text: result.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Transcription error:', error);
    const message = error instanceof Error ? error.message : String(error);
    const isRateOrQuota = /429|rate limit|insufficient_quota|quota/i.test(message);

    const payload = isRateOrQuota
      ? { error: 'Rate limit exceeded', code: 429, shouldFallback: true }
      : { error: message || 'Unknown error' };

    return new Response(
      JSON.stringify(payload),
      {
        status: isRateOrQuota ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
