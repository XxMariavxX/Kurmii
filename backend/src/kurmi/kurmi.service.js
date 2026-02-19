import { createDailyWordGenerator } from '../lib/timeOutIterator.js';

const globalDailyWordGenerator = createDailyWordGenerator();

export function dailyWordService() {
  return globalDailyWordGenerator.next().value;
}
