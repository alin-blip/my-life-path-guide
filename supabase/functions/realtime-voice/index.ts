import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

console.log("🚀 Realtime Voice Edge Function Starting...");
console.log("📍 Environment Check:");
console.log("  - OPENAI_API_KEY configured:", !!OPENAI_API_KEY);
console.log("  - API Key length:", OPENAI_API_KEY?.length || 0);

serve(async (req) => {
  console.log("📨 Incoming request:", {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  const upgrade = req.headers.get("upgrade") || "";
  
  if (upgrade.toLowerCase() !== "websocket") {
    console.error("❌ Not a WebSocket request. Upgrade header:", upgrade);
    return new Response("Expected websocket connection", { status: 426 });
  }

  if (!OPENAI_API_KEY) {
    console.error("❌ CRITICAL: OPENAI_API_KEY is not configured in secrets!");
    return new Response("Server configuration error - missing API key", { status: 500 });
  }
  
  console.log("✅ WebSocket upgrade request validated");

  let openaiWs: WebSocket | null = null;
  let connectionStartTime: number = 0;
  
  try {
    const { socket, response } = Deno.upgradeWebSocket(req);
    console.log("✅ Deno WebSocket upgraded successfully");
    
    socket.onopen = async () => {
      console.log("✅ Client WebSocket connected");
      connectionStartTime = Date.now();
      
      try {
        const url = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`;
        console.log("📡 Attempting OpenAI connection:", {
          url,
          timestamp: new Date().toISOString(),
          apiKeyPresent: !!OPENAI_API_KEY
        });

        // Use Sec-WebSocket-Protocol to pass API key and protocol identifiers
        console.log("🔐 Creating WebSocket with protocols...");
        openaiWs = new WebSocket(url, [
          "realtime",
          `openai-insecure-api-key.${OPENAI_API_KEY}`,
          "openai-realtime-api",
        ]);

        openaiWs.onopen = () => {
          const connectionTime = Date.now() - connectionStartTime;
          console.log("✅ Connected to OpenAI Realtime API", {
            connectionTimeMs: connectionTime,
            timestamp: new Date().toISOString()
          });
          
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
            console.log("📨 OpenAI event:", {
              type: data.type,
              timestamp: new Date().toISOString(),
              hasAudio: !!data.delta,
              eventId: data.event_id
            });
          
            // Configure session after receiving session.created
            if (data.type === 'session.created' && !sessionConfigured) {
              sessionConfigured = true;
              console.log("🎯 Session created, configuring...");
              
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
              
              console.log("📤 Sending session configuration:", {
                modalities: sessionConfig.session.modalities,
                voice: sessionConfig.session.voice,
                turnDetection: sessionConfig.session.turn_detection.type
              });
              
              openaiWs?.send(JSON.stringify(sessionConfig));
              console.log("✅ Session configuration sent successfully");
            }
          
            // Forward all messages to client
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(event.data);
            } else {
              console.warn("⚠️ Cannot forward to client - socket not open:", socket.readyState);
            }
          } catch (error) {
            console.error("❌ Error processing OpenAI message:", {
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined
            });
          }
        };

        openaiWs.onerror = (error) => {
          console.error("❌ OpenAI WebSocket error:", {
            error: String(error),
            timestamp: new Date().toISOString(),
            connectionTime: Date.now() - connectionStartTime
          });
          
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ 
              type: "error", 
              error: "OpenAI connection error",
              details: String(error)
            }));
          }
        };

        openaiWs.onclose = (event) => {
          console.log("🔌 OpenAI WebSocket closed:", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            timestamp: new Date().toISOString()
          });
          
          if (socket.readyState === WebSocket.OPEN) {
            console.log("🔌 Closing client socket...");
            socket.close();
          }
        };

      } catch (error) {
        console.error("❌ OpenAI connection failed:", {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        });
        
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ 
            type: "error", 
            error: "Failed to connect to OpenAI",
            details: error instanceof Error ? error.message : String(error)
          }));
          socket.close();
        }
      }
    };

    socket.onmessage = (event) => {
      try {
        if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
          console.log("📤 Forwarding client message to OpenAI");
          openaiWs.send(event.data);
        } else {
          console.warn("⚠️ Cannot forward to OpenAI - not ready:", {
            wsExists: !!openaiWs,
            readyState: openaiWs?.readyState
          });
        }
      } catch (error) {
        console.error("❌ Error forwarding to OpenAI:", {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    };

    socket.onerror = (error) => {
      console.error("❌ Client WebSocket error:", {
        error: String(error),
        timestamp: new Date().toISOString()
      });
    };

    socket.onclose = () => {
      console.log("🔌 Client WebSocket closed");
      if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
        console.log("🔌 Closing OpenAI connection...");
        openaiWs.close();
      }
    };

    return response;
    
  } catch (error) {
    console.error("❌ CRITICAL: Failed to upgrade WebSocket:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response("Failed to establish WebSocket connection", { status: 500 });
  }
});
