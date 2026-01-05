import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { RelationshipStep } from '@/components/champion-routine/steps/RelationshipStep';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Person {
  id: string;
  name: string;
  relationship_type: string;
}

interface RelationshipAction {
  person_id: string;
  action: string;
  completed: boolean;
}

const Relationships = () => {
  const navigate = useNavigate();
  const [people, setPeople] = useState<Person[]>([]);
  const [actions, setActions] = useState<RelationshipAction[]>([]);

  useEffect(() => {
    loadPeople();
  }, []);

  const loadPeople = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('champion_routine_people')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('position');

    if (data) {
      setPeople(data);
      // Initialize empty actions for each person
      const initialActions = data.map(person => ({
        person_id: person.id,
        action: '',
        completed: false
      }));
      setActions(initialActions);
    }
  };

  const handleActionsChange = (newActions: RelationshipAction[]) => {
    setActions(newActions);
  };

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <RelationshipStep
          people={people}
          actions={actions}
          onActionsChange={handleActionsChange}
          onNext={handleComplete}
        />
      </div>
    </Layout>
  );
};

export default Relationships;
