import { createDailyWordGenerator } from '../lib/iterator.js';

const globalDailyWordGenerator = createDailyWordGenerator();

export function dailyWordService() {
  return globalDailyWordGenerator.next().value;
}
