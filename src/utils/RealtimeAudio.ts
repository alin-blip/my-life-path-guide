import { supabase } from '@/integrations/supabase/client';

// Audio Recorder - captures microphone audio at 24kHz PCM16
export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;

  constructor(
    private onAudioData: (audioData: Float32Array) => void,
    private onAudioLevel?: (level: number) => void
  ) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({ sampleRate: 24000 });
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      if (this.onAudioLevel) {
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.source.connect(this.analyser);
        this.analyser.connect(this.processor);
      } else {
        this.source.connect(this.processor);
      }
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
        
        if (this.onAudioLevel && this.analyser && this.dataArray) {
          this.analyser.getByteFrequencyData(this.dataArray);
          const values = Array.from(this.dataArray);
          const average = values.reduce((a, b) => a + b, 0) / values.length;
          this.onAudioLevel(average / 255);
        }
      };
      
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('❌ Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    if (this.source) this.source.disconnect();
    if (this.analyser) this.analyser.disconnect();
    if (this.processor) this.processor.disconnect();
    if (this.stream) this.stream.getTracks().forEach(track => track.stop());
    if (this.audioContext) this.audioContext.close();
    this.source = null;
    this.analyser = null;
    this.processor = null;
    this.stream = null;
    this.audioContext = null;
  }

  static encodeAudioForAPI(float32Array: Float32Array): string {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    const bytes = new Uint8Array(int16Array.buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
}

export class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;

  constructor(private audioContext: AudioContext) {}

  async addToQueue(audioData: Uint8Array) {
    this.queue.push(audioData);
    if (!this.isPlaying) await this.playNext();
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }
    this.isPlaying = true;
    const audioData = this.queue.shift()!;
    try {
      const wavData = this.createWavFromPCM(audioData);
      const audioBuffer = await this.audioContext.decodeAudioData(wavData.buffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.onended = () => this.playNext();
      source.start(0);
    } catch (error) {
      console.error('❌ Error playing audio:', error);
      this.playNext();
    }
  }

  private createWavFromPCM(pcmData: Uint8Array): Uint8Array {
    const int16Data = new Int16Array(pcmData.length / 2);
    for (let i = 0; i < pcmData.length; i += 2) {
      int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
    }
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    };
    const sampleRate = 24000, numChannels = 1, bitsPerSample = 16;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + int16Data.byteLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, int16Data.byteLength, true);
    const wavArray = new Uint8Array(wavHeader.byteLength + int16Data.byteLength);
    wavArray.set(new Uint8Array(wavHeader), 0);
    wavArray.set(new Uint8Array(int16Data.buffer), wavHeader.byteLength);
    return wavArray;
  }

  clear() {
    this.queue = [];
    this.isPlaying = false;
  }
}

export class RealtimeChat {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;

  constructor(
    private onMessage: (message: any) => void,
    private audioQueue: AudioQueue,
    private onAudioLevel?: (level: number) => void
  ) {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
  }

  async init() {
    try {
      const { data, error } = await supabase.functions.invoke('realtime-ephemeral-session');
      if (error) throw error;
      if (!data?.client_secret?.value) throw new Error("Failed to get ephemeral token");

      const EPHEMERAL_KEY = data.client_secret.value;
      this.pc = new RTCPeerConnection();
      this.pc.ontrack = e => this.audioEl.srcObject = e.streams[0];

      const ms = await navigator.mediaDevices.getUserMedia({ 
        audio: { sampleRate: 24000, channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      this.pc.addTrack(ms.getTracks()[0]);

      this.dc = this.pc.createDataChannel("oai-events");
      this.dc.addEventListener("message", (e) => {
        try {
          const event = JSON.parse(e.data);
          this.onMessage(event);
        } catch (error) {
          console.error('❌ Error parsing data channel message:', error);
        }
      });

      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      const sdpResponse = await fetch("https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17", {
        method: "POST",
        body: offer.sdp,
        headers: { Authorization: `Bearer ${EPHEMERAL_KEY}`, "Content-Type": "application/sdp" },
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        throw new Error(`OpenAI SDP error: ${sdpResponse.status} - ${errorText}`);
      }

      const answer = { type: "answer" as RTCSdpType, sdp: await sdpResponse.text() };
      await this.pc.setRemoteDescription(answer);
      console.log('✅ WebRTC connection established');
    } catch (error) {
      console.error("❌ Error initializing WebRTC chat:", error);
      throw error;
    }
  }

  disconnect() {
    if (this.dc) this.dc.close();
    if (this.pc) this.pc.close();
    this.dc = null;
    this.pc = null;
  }
}
