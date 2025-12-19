import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath, fileId } = await req.json();
    
    if (!filePath) {
      throw new Error('File path is required');
    }

    console.log('Parsing PDF from path:', filePath);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('knowledge-base')
      .download(filePath);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Extract text from PDF using pdf-lib for basic extraction
    // For more complex PDFs, we'll use a text extraction approach
    let extractedText = '';
    
    try {
      // Convert PDF to text using a simple extraction method
      // This works for text-based PDFs (not scanned images)
      extractedText = await extractTextFromPdf(uint8Array);
    } catch (extractError) {
      console.error('PDF extraction error:', extractError);
      // Fallback: try to extract any readable text
      extractedText = extractReadableText(uint8Array);
    }

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('Nu s-a putut extrage text din PDF. Fișierul poate fi scanat sau protejat.');
    }

    console.log('Extracted text length:', extractedText.length);
    console.log('First 500 chars:', extractedText.substring(0, 500));

    // Update the database with the extracted content
    if (fileId) {
      const { error: updateError } = await supabase
        .from('knowledge_base_files')
        .update({ 
          content_preview: extractedText.substring(0, 50000) // Store up to 50k chars
        })
        .eq('id', fileId);

      if (updateError) {
        console.error('Database update error:', updateError);
      }
    }

    // Also save full text to a .txt file in storage
    const txtPath = filePath.replace(/\.pdf$/i, '_extracted.txt');
    const { error: uploadError } = await supabase.storage
      .from('knowledge-base')
      .upload(txtPath, new Blob([extractedText], { type: 'text/plain' }), {
        upsert: true
      });

    if (uploadError) {
      console.error('Failed to save extracted text:', uploadError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        textLength: extractedText.length,
        preview: extractedText.substring(0, 1000),
        txtPath: txtPath
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Parse PDF error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Simple PDF text extraction
async function extractTextFromPdf(pdfData: Uint8Array): Promise<string> {
  // Look for text streams in the PDF
  const text = extractReadableText(pdfData);
  
  if (text.length < 100) {
    // Try alternative extraction
    return extractTextStreams(pdfData);
  }
  
  return text;
}

// Extract readable ASCII/UTF-8 text from PDF binary
function extractReadableText(data: Uint8Array): string {
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const rawText = decoder.decode(data);
  
  // Extract text between BT and ET markers (PDF text objects)
  const textObjects: string[] = [];
  const btEtRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match;
  
  while ((match = btEtRegex.exec(rawText)) !== null) {
    const content = match[1];
    // Extract text from Tj and TJ operators
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
    
    let tjMatch;
    while ((tjMatch = tjRegex.exec(content)) !== null) {
      textObjects.push(decodePdfString(tjMatch[1]));
    }
    
    while ((tjMatch = tjArrayRegex.exec(content)) !== null) {
      const arrayContent = tjMatch[1];
      const stringRegex = /\(([^)]*)\)/g;
      let strMatch;
      while ((strMatch = stringRegex.exec(arrayContent)) !== null) {
        textObjects.push(decodePdfString(strMatch[1]));
      }
    }
  }
  
  // Also look for plain text streams
  const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
  while ((match = streamRegex.exec(rawText)) !== null) {
    const streamContent = match[1];
    // Extract readable text from streams
    const readable = streamContent.replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (readable.length > 50 && !readable.includes('obj') && !readable.includes('/Type')) {
      textObjects.push(readable);
    }
  }
  
  let result = textObjects.join(' ').trim();
  
  // Clean up the result
  result = result
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\t/g, ' ')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\s+/g, ' ')
    .replace(/([.!?])\s+/g, '$1\n')
    .trim();
  
  return result;
}

// Extract text from PDF stream objects
function extractTextStreams(data: Uint8Array): string {
  const decoder = new TextDecoder('latin1');
  const rawText = decoder.decode(data);
  
  const texts: string[] = [];
  
  // Look for text in various encodings
  const patterns = [
    /\/Contents\s*\(([^)]+)\)/g,
    /\/V\s*\(([^)]+)\)/g,
    /\/T\s*\(([^)]+)\)/g,
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(rawText)) !== null) {
      texts.push(decodePdfString(match[1]));
    }
  }
  
  return texts.join('\n').trim();
}

// Decode PDF string escapes
function decodePdfString(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}
