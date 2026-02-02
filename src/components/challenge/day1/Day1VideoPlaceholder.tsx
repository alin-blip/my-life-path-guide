import React from 'react';
import { Card } from '@/components/ui/card';

export const Day1VideoPlaceholder: React.FC = () => {
  return (
    <Card className="overflow-hidden mb-6">
      <div 
        className="relative w-full" 
        style={{ paddingBottom: '56.25%' }}
      >
        <iframe 
          src="https://embed.voomly.softwarepublishingapp.com/embed/assets/embed.html?videoId=go9bXtqEsDTLGYdXU4_JNbKMGBDMHDfRU9dYEOMGNqzMjEIY4&videoRatio=1.777778&type=v&skinColor=%232758EB"
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    </Card>
  );
};
