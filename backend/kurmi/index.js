import { dailyWordService } from './kurmi.service.js';

setInterval(() => {
  console.log('Current word:', dailyWordService());
}, 2000);
