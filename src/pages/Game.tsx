import { Navigate } from 'react-router-dom';

// Redirect to Game Objectives page
const Game = () => {
  return <Navigate to="/game-objectives?tab=quarterly" replace />;
};

export default Game;
