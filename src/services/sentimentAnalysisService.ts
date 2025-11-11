import { supabase } from '@/integrations/supabase/client';

export interface SentimentAnalysis {
  primary_emotion: string;
  secondary_emotions?: string[];
  intensity: 'scăzută' | 'medie' | 'ridicată';
  sentiment_score: number;
  key_themes?: string[];
  psychological_insight: string;
  recommendation?: string;
}

export const sentimentAnalysisService = {
  /**
   * Analyze sentiment for a recording
   */
  async analyzeRecording(
    recordingId: string,
    transcript: string,
    questionText?: string
  ): Promise<{ success: boolean; analysis?: SentimentAnalysis; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
        body: {
          recordingId,
          transcript,
          questionText
        }
      });

      if (error) throw error;

      return {
        success: true,
        analysis: data.analysis
      };
    } catch (error) {
      console.error('❌ Error analyzing sentiment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Batch analyze all recordings in a session
   */
  async analyzeSession(sessionId: string): Promise<{
    success: boolean;
    analyzed: number;
    failed: number;
    error?: string;
  }> {
    try {
      const { data: recordings, error } = await supabase
        .from('voice_recordings')
        .select('id, transcript, question_text, sentiment_analysis')
        .eq('session_id', sessionId)
        .not('transcript', 'is', null);

      if (error) throw error;

      let analyzed = 0;
      let failed = 0;

      for (const recording of recordings || []) {
        // Skip if already analyzed
        if (recording.sentiment_analysis) {
          analyzed++;
          continue;
        }

        const result = await this.analyzeRecording(
          recording.id,
          recording.transcript!,
          recording.question_text || undefined
        );

        if (result.success) {
          analyzed++;
        } else {
          failed++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      return {
        success: true,
        analyzed,
        failed
      };
    } catch (error) {
      console.error('❌ Error analyzing session:', error);
      return {
        success: false,
        analyzed: 0,
        failed: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Get aggregate insights for a session
   */
  async getSessionInsights(sessionId: string): Promise<{
    success: boolean;
    insights?: {
      dominantEmotions: Array<{ emotion: string; count: number }>;
      averageSentiment: number;
      emotionalJourney: Array<{ emotion: string; intensity: string; timestamp: string }>;
      keyThemes: string[];
      overallInsight: string;
    };
    error?: string;
  }> {
    try {
      const { data: recordings, error } = await supabase
        .from('voice_recordings')
        .select('sentiment_analysis, created_at')
        .eq('session_id', sessionId)
        .not('sentiment_analysis', 'is', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!recordings || recordings.length === 0) {
        return {
          success: false,
          error: 'No analyzed recordings found for this session'
        };
      }

      // Aggregate data
      const emotionCounts = new Map<string, number>();
      let totalSentiment = 0;
      const emotionalJourney: Array<{ emotion: string; intensity: string; timestamp: string }> = [];
      const allThemes = new Set<string>();

      recordings.forEach((recording) => {
        const analysis = recording.sentiment_analysis as any;
        if (!analysis) return;
        
        // Count emotions
        emotionCounts.set(
          analysis.primary_emotion,
          (emotionCounts.get(analysis.primary_emotion) || 0) + 1
        );

        // Sum sentiment scores
        totalSentiment += analysis.sentiment_score || 0;

        // Track emotional journey
        emotionalJourney.push({
          emotion: analysis.primary_emotion,
          intensity: analysis.intensity,
          timestamp: recording.created_at
        });

        // Collect themes
        analysis.key_themes?.forEach((theme: string) => allThemes.add(theme));
      });

      const dominantEmotions = Array.from(emotionCounts.entries())
        .map(([emotion, count]) => ({ emotion, count }))
        .sort((a, b) => b.count - a.count);

      const averageSentiment = totalSentiment / recordings.length;

      // Generate overall insight
      const topEmotion = dominantEmotions[0]?.emotion || 'neutră';
      const sentimentDirection = averageSentiment > 0.3 ? 'pozitivă' : averageSentiment < -0.3 ? 'negativă' : 'echilibrată';
      
      const overallInsight = `Sesiunea ta a fost dominată de ${topEmotion}, cu o tendință emoțională ${sentimentDirection}. ${
        emotionalJourney.length > 3 
          ? `Se observă o evoluție emoțională de la ${emotionalJourney[0].emotion} la ${emotionalJourney[emotionalJourney.length - 1].emotion}.`
          : ''
      }`;

      return {
        success: true,
        insights: {
          dominantEmotions,
          averageSentiment,
          emotionalJourney,
          keyThemes: Array.from(allThemes),
          overallInsight
        }
      };
    } catch (error) {
      console.error('❌ Error getting session insights:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};
