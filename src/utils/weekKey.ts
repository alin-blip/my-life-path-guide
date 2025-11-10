/**
 * Week key conversion utilities
 * - Door system uses: "door-week-YYYY-ww" (e.g., "door-week-2025-46")
 * - Planning system uses: "YYYY-Www" (e.g., "2025-W46")
 */

/**
 * Convert Door week key format to Planning week key format
 * @param doorKey - Format: "door-week-YYYY-ww"
 * @returns Planning key format: "YYYY-Www"
 */
export function toPlanningWeekKey(doorKey: string): string {
  // Extract from "door-week-2025-46" => "2025-W46"
  const match = doorKey.match(/door-week-(\d{4})-(\d{1,2})/);
  if (!match) {
    console.warn('⚠️ Invalid door key format:', doorKey);
    return doorKey;
  }
  
  const [, year, week] = match;
  return `${year}-W${week.padStart(2, '0')}`;
}

/**
 * Convert Planning week key format to Door week key format
 * @param planningKey - Format: "YYYY-Www"
 * @returns Door key format: "door-week-YYYY-ww"
 */
export function toDoorWeekKey(planningKey: string): string {
  // Extract from "2025-W46" => "door-week-2025-46"
  const match = planningKey.match(/(\d{4})-W(\d{1,2})/);
  if (!match) {
    console.warn('⚠️ Invalid planning key format:', planningKey);
    return planningKey;
  }
  
  const [, year, week] = match;
  return `door-week-${year}-${week.padStart(2, '0')}`;
}
