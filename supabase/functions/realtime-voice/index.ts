import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  const upgrade = req.headers.get("upgrade") || "";
  
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected websocket connection", { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let openaiWs: WebSocket | null = null;
  
  socket.onopen = async () => {
    console.log("Client WebSocket connected");
    
    try {
      // Connect to OpenAI Realtime API
      const url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17";
      openaiWs = new WebSocket(url, {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "OpenAI-Beta": "realtime=v1"
        }
      });

      openaiWs.onopen = () => {
        console.log("Connected to OpenAI");
        
        // Send session configuration after connection
        const sessionConfig = {
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: "You are a helpful weekly planning assistant. Guide users through planning their week by asking questions one at a time. Be concise and encouraging.",
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
        console.log("Session configuration sent");
      };

      openaiWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("OpenAI message:", data.type);
          
          // Forward all messages to client
          socket.send(event.data);
        } catch (error) {
          console.error("Error processing OpenAI message:", error);
        }
      };

      openaiWs.onerror = (error) => {
        console.error("OpenAI WebSocket error:", error);
        socket.send(JSON.stringify({ 
          type: "error", 
          error: "OpenAI connection error" 
        }));
      };

      openaiWs.onclose = () => {
        console.log("OpenAI WebSocket closed");
        socket.close();
      };

    } catch (error) {
      console.error("Error connecting to OpenAI:", error);
      socket.send(JSON.stringify({ 
        type: "error", 
        error: "Failed to connect to AI" 
      }));
      socket.close();
    }
  };

  socket.onmessage = (event) => {
    try {
      if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
        openaiWs.send(event.data);
      }
    } catch (error) {
      console.error("Error forwarding to OpenAI:", error);
    }
  };

  socket.onerror = (error) => {
    console.error("Client WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("Client WebSocket closed");
    if (openaiWs) {
      openaiWs.close();
    }
  };

  return response;
});
