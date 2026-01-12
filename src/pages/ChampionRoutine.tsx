import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * DEPRECATED: This page now redirects to /daily-flow
 * All routine functionality has been unified into the Daily Flow page.
 * This redirect ensures backwards compatibility for existing bookmarks/links.
 */
const ChampionRoutine = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to unified daily flow with settings param if needed
    navigate('/daily-flow', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
};

export default ChampionRoutine;
