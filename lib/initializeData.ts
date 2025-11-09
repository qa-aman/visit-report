import { seedVisitEntries } from './seedData';
import { saveVisitEntry, getVisitEntries } from './storage';

export function initializeDummyData() {
  // Check if data already exists
  const existingEntries = getVisitEntries();
  
  // Only initialize if no data exists
  if (existingEntries.length === 0) {
    const entries = seedVisitEntries();
    entries.forEach((entry) => {
      saveVisitEntry(entry);
    });
    console.log(`✅ Initialized ${entries.length} dummy visit entries`);
  }
}

