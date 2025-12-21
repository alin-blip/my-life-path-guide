
import React from 'react';
import { Play } from 'lucide-react';

// Course interface definition
interface Course {
  id: string;
  title: string;
  subTitle?: string;
  image: string;
  status: 'NOT STARTED' | 'IN PROGRESS' | 'COMPLETED';
  progress: number;
  hasPlayButton?: boolean;
}

// Course data - Napoleon Hill themed
const courseData: Course[] = [
  {
    id: '1',
    title: 'THINK AND GROW RICH',
    subTitle: 'AUDIOBOOK',
    image: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
    status: 'NOT STARTED',
    progress: 0
  },
  {
    id: '2',
    title: 'THE 13 PRINCIPLES',
    subTitle: 'VIDEOBOOK',
    image: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
    status: 'IN PROGRESS',
    progress: 25,
    hasPlayButton: true
  },
  {
    id: '3',
    title: '\'ACTIVATE YOUR POWER\' WOW',
    subTitle: 'CHALLENGE',
    image: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
    status: 'IN PROGRESS',
    progress: 12
  },
  {
    id: '4',
    title: 'MASTER PLAN QUICK START',
    image: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
    status: 'NOT STARTED',
    progress: 0
  },
  {
    id: '5',
    title: 'WE LIVE BY A CODE',
    subTitle: 'AUDIOBOOK',
    image: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
    status: 'COMPLETED',
    progress: 100
  },
  {
    id: '6',
    title: 'ATTACK WITH THE STACK',
    subTitle: 'AUDIO EDITION',
    image: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
    status: 'IN PROGRESS',
    progress: 97
  },
  {
    id: '7',
    title: 'MASTER PLAN CORE 4',
    subTitle: 'AUDIOBOOK',
    image: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
    status: 'COMPLETED',
    progress: 100
  },
  {
    id: '8',
    title: 'WINNING IMPOSSIBLE GAMES',
    subTitle: 'AUDIOBOOK',
    image: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
    status: 'COMPLETED',
    progress: 100
  },
  {
    id: '9',
    title: 'THE DOOR: SEEK, KNOCK, ASK',
    subTitle: 'AUDIOBOOK',
    image: '/public/lovable-uploads/26a033cf-b370-4f36-b524-05194c9e8f64.png',
    status: 'COMPLETED',
    progress: 100
  }
];

export const ArmoryContent: React.FC = () => {
  return (
    <div className="armory-grid">
      {courseData.map((course) => (
        <div key={course.id} className="course-card">
          <div className="course-image-container" style={{ backgroundImage: `url(${course.image})` }}>
            <div className="course-overlay">
              <div className={`course-status ${course.status.replace(' ', '-').toLowerCase()}`}>
                {course.status}
              </div>
              {course.hasPlayButton && (
                <div className="play-button-container">
                  <button className="play-button">
                    <Play className="play-icon" />
                  </button>
                </div>
              )}
              <div className="course-info">
                <div className="course-title-container">
                  <h3 className="course-title">{course.title}</h3>
                  {course.subTitle && <p className="course-subtitle">{course.subTitle}</p>}
                </div>
                <div className="progress-indicator">
                  {course.progress}% COMPLETE
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
