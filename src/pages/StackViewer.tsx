import { StackViewer } from '@/components/StackViewer';
import { FeatureGate } from '@/components/access/FeatureGate';

const StackViewerPage = () => {
  return (
    <FeatureGate
      featureKey="stack_session"
      featureName="Stack Library"
      teaser="Sesiuni nelimitate din întreaga bibliotecă de stack-uri în Basic."
      autoConsume
    >
      <StackViewer />
    </FeatureGate>
  );
};

export default StackViewerPage;