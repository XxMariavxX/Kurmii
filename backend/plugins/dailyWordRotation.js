import fp from "fastify-plugin";
import eventBus from "../lib/event.js";
import { dailyWord } from "../services/dailyWordGenerator.js";

const getNextMidnightDelay = () => {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  return nextMidnight.getTime() - now.getTime();
};

const getCurrentWord = () => dailyWord().next().value.toUpperCase();

async function dailyWordRotation(fastify) {
  let timeoutId;

  const scheduleNextRotation = () => {
    const delay = getNextMidnightDelay();
    timeoutId = setTimeout(() => {
      const newWord = getCurrentWord();
      eventBus.emit("word:changed", { newWord });
      scheduleNextRotation();
    }, delay);
  };

  scheduleNextRotation();

  fastify.addHook("onClose", (instance, done) => {
    if (timeoutId) clearTimeout(timeoutId);
    done();
  });
}

export default fp(dailyWordRotation);
