import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  const upgrade = req.headers.get("upgrade") || "";
  
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected websocket connection", { status: 426 });
  }

  if (!OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY is not configured");
    return new Response("Server configuration error - missing API key", { status: 500 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let openaiWs: WebSocket | null = null;
  
  socket.onopen = async () => {
    console.log("✅ Client WebSocket connected");
    
    try {
      // Connect to OpenAI Realtime API using standard WebSocket
      // Connect to OpenAI Realtime API using standard WebSocket with protocols
      const url = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`;
      console.log("📡 Connecting to OpenAI:", url);

      // Use Sec-WebSocket-Protocol to pass API key and protocol identifiers
      openaiWs = new WebSocket(url, [
        "realtime",
        `openai-insecure-api-key.${OPENAI_API_KEY}`,
        "openai-realtime-api",
      ]);

      openaiWs.onopen = () => {
        console.log("✅ Connected to OpenAI Realtime API");
        
        // Notify client
        socket.send(JSON.stringify({
          type: "connection.ready",
          message: "Voice assistant ready"
        }));
      };
      
      // Track if session is configured
      let sessionConfigured = false;
      
      openaiWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 OpenAI event:", data.type);
          
          // Configure session after receiving session.created
          if (data.type === 'session.created' && !sessionConfigured) {
            sessionConfigured = true;
            
            const sessionConfig = {
              type: "session.update",
              session: {
                modalities: ["text", "audio"],
                instructions: "You are a helpful assistant. Be concise and natural in conversation.",
                voice: "alloy",
                input_audio_format: "pcm16",
                output_audio_format: "pcm16",
                input_audio_transcription: {
                  model: "whisper-1"
                },
                turn_detection: {
                  type: "server_vad",
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 1000
                },
                temperature: 0.8,
                max_response_output_tokens: "inf"
              }
            };
            
            openaiWs?.send(JSON.stringify(sessionConfig));
            console.log("📤 Session configuration sent");
          }
          
          // Forward all messages to client
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        } catch (error) {
          console.error("❌ Error processing message:", error);
        }
      };

      openaiWs.onerror = (error) => {
        console.error("❌ OpenAI WebSocket error:", error);
        socket.send(JSON.stringify({ 
          type: "error", 
          error: "Connection error",
          details: String(error)
        }));
      };

      openaiWs.onclose = (event) => {
        console.log("🔌 OpenAI closed:", event.code, event.reason);
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };

    } catch (error) {
      console.error("❌ Connection failed:", error);
      socket.send(JSON.stringify({ 
        type: "error", 
        error: "Failed to connect",
        details: error instanceof Error ? error.message : String(error)
      }));
      socket.close();
    }
  };

  socket.onmessage = (event) => {
    try {
      if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
        openaiWs.send(event.data);
      } else {
        console.warn("⚠️ OpenAI not ready");
      }
    } catch (error) {
      console.error("❌ Forward error:", error);
    }
  };

  socket.onerror = (error) => {
    console.error("❌ Client error:", error);
  };

  socket.onclose = () => {
    console.log("🔌 Client closed");
    if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.close();
    }
  };

  return response;
});
