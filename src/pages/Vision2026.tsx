import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Vision2026 - Redirect to Life Score
 * 
 * This page now redirects to Life Score to consolidate funnels.
 * All traffic from /vision-2026 goes to /life-score for a unified funnel.
 */
const Vision2026 = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Preserve any query params (UTM, etc.)
    const searchParams = window.location.search;
    navigate(`/life-score${searchParams}`, { replace: true });
  }, [navigate]);
  
  return null;
};

export default Vision2026;
