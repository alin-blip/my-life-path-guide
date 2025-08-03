
import { format } from 'date-fns';

export function useDoorStorageLogger() {
  const logStorageAction = (action: string, details: any = {}) => {
    const timestamp = format(new Date(), 'HH:mm:ss');
    console.log(`🗄️ [${timestamp}] Door Storage - ${action}:`, details);
  };

  return { logStorageAction };
}
