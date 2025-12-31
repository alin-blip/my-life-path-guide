import { Navigate } from 'react-router-dom';

// Redirect to unified Command Center
const Game = () => {
  return <Navigate to="/door?tab=quarterly" replace />;
};

export default Game;
