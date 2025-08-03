
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { LearnDashboard } from '@/components/LearnDashboard';
import { LearnCourses } from '@/components/LearnCourses';
import { AdminCourseProvider } from '@/components/AdminCourseProvider';
import { useLocation } from 'react-router-dom';

const LearnPage = () => {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string>('courses');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  // Check for category in URL when component mounts or URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const subcategoryParam = params.get('subcategory');
    
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
    
    if (subcategoryParam) {
      setActiveSubcategory(subcategoryParam);
    }
  }, [location]);

  // Calculate the resources per category
  useEffect(() => {
    // This would normally fetch from an API
    setCategoryCounts({
      body: 3,
      balance: 2,
      being: 2,
      business: 2
    });
  }, []);

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setActiveCategory(category);
    
    // Update URL with category param
    const params = new URLSearchParams(location.search);
    params.set('category', category);
    
    // Keep subcategory if it exists
    if (activeSubcategory) {
      params.set('subcategory', activeSubcategory);
    }
    
    const newUrl = `${location.pathname}?${params.toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };
  
  // Handle subcategory selection
  const handleSubcategorySelect = (subcategory: string) => {
    setActiveSubcategory(subcategory);
    
    // Update URL with subcategory param
    const params = new URLSearchParams(location.search);
    params.set('subcategory', subcategory);
    
    // Keep category if it exists
    if (activeCategory) {
      params.set('category', activeCategory);
    }
    
    const newUrl = `${location.pathname}?${params.toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  return (
    <AdminCourseProvider>
      <Layout>
        <div className="w-full max-w-full px-2 sm:px-4 pb-4 sm:pb-8">
          <div className="flex justify-between items-center mb-3 sm:mb-6">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">LEARN</h1>
          </div>
          
          <LearnDashboard 
            onCategorySelect={handleCategorySelect}
            activeCategory={activeCategory}
            categoryCounts={categoryCounts}
            onSubcategorySelect={handleSubcategorySelect}
            activeSubcategory={activeSubcategory}
          />
          
          <div className="mt-3 sm:mt-6">
            <LearnCourses 
              activeCategory={activeCategory} 
              activeSubcategory={activeSubcategory}
            />
          </div>
        </div>
      </Layout>
    </AdminCourseProvider>
  );
};

export default LearnPage;
