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
          src="https://us06web.zoom.us/clips/embed/zx6Y36ecRyevoBcm8We9Tw" 
          frameBorder="0" 
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    </Card>
  );
};
