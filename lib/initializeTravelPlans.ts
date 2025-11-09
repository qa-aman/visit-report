import { seedTravelPlans, seedLocations, seedPurposeOptions } from './seedTravelPlans';
import { getTravelPlans, getTravelPlanEntries, saveTravelPlan, saveTravelPlanEntry } from './storage';

/**
 * Initialize travel plan data if it doesn't exist
 * This function is safe to call multiple times - it only initializes if no data exists
 */
export function initializeTravelPlanData() {
  if (typeof window === 'undefined') return;

  try {
    const existingPlans = getTravelPlans();
    
    // Only initialize if no plans exist (prevents overwriting user data)
    if (existingPlans.length === 0) {
      const { plans, entries } = seedTravelPlans();
      
      // Save all plans
      plans.forEach((plan) => {
        saveTravelPlan(plan);
      });
      
      // Save all entries
      entries.forEach((entry) => {
        saveTravelPlanEntry(entry);
      });
      
      console.log(`✅ Initialized ${plans.length} travel plans with ${entries.length} entries`);
    }
  } catch (error) {
    console.error('Error initializing travel plan data:', error);
    // Don't throw - allow app to continue even if initialization fails
  }
}

