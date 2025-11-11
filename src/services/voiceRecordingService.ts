import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface VoiceRecordingMetadata {
  sessionId: string;
  stackType: string;
  questionNumber?: number;
  questionText?: string;
  transcript?: string;
  durationSeconds?: number;
  metadata?: Record<string, any>;
}

export const voiceRecordingService = {
  /**
   * Upload voice recording to Supabase Storage
   */
  async uploadRecording(
    audioBlob: Blob,
    metadata: VoiceRecordingMetadata
  ): Promise<{ success: boolean; recordingId?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Generate unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${user.id}/${metadata.sessionId}/${timestamp}_${uuidv4()}.webm`;

      console.log('📤 Uploading voice recording:', filename);

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-recordings')
        .upload(filename, audioBlob, {
          contentType: 'audio/webm',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw uploadError;
      }

      console.log('✅ Audio uploaded successfully:', uploadData.path);

      // Save metadata to database
      const { data: recordingData, error: dbError } = await supabase
        .from('voice_recordings')
        .insert({
          user_id: user.id,
          session_id: metadata.sessionId,
          stack_type: metadata.stackType,
          question_number: metadata.questionNumber,
          question_text: metadata.questionText,
          storage_path: uploadData.path,
          duration_seconds: metadata.durationSeconds,
          transcript: metadata.transcript,
          metadata: metadata.metadata || {}
        })
        .select('id')
        .single();

      if (dbError) {
        console.error('❌ Database error:', dbError);
        // Try to delete the uploaded file
        await supabase.storage
          .from('voice-recordings')
          .remove([filename]);
        throw dbError;
      }

      console.log('✅ Voice recording metadata saved:', recordingData.id);

      return {
        success: true,
        recordingId: recordingData.id
      };
    } catch (error) {
      console.error('❌ Error uploading voice recording:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Get all recordings for a session
   */
  async getSessionRecordings(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from('voice_recordings')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return { success: true, recordings: data };
    } catch (error) {
      console.error('❌ Error fetching recordings:', error);
      return { success: false, error };
    }
  },

  /**
   * Get signed URL for playback
   */
  async getRecordingUrl(storagePath: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from('voice-recordings')
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      if (error) throw error;

      return data.signedUrl;
    } catch (error) {
      console.error('❌ Error getting signed URL:', error);
      return null;
    }
  },

  /**
   * Delete recording
   */
  async deleteRecording(recordingId: string) {
    try {
      // Get storage path first
      const { data: recording, error: fetchError } = await supabase
        .from('voice_recordings')
        .select('storage_path')
        .eq('id', recordingId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('voice-recordings')
        .remove([recording.storage_path]);

      if (storageError) throw storageError;

      // Delete metadata
      const { error: dbError } = await supabase
        .from('voice_recordings')
        .delete()
        .eq('id', recordingId);

      if (dbError) throw dbError;

      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting recording:', error);
      return { success: false, error };
    }
  }
};
