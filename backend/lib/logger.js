const LEVELS = { DEBUG: 0, INFO: 1, ERROR: 2 };

const defaultFormatter = ({ level, fnName, args, result, error, durationMs, timestamp }) => {
  const base = { timestamp, level, fn: fnName, durationMs };
  if (error) return JSON.stringify({ ...base, error: error.message });
  return JSON.stringify({ ...base, args, result });
};

const writers = {
  console: (line, level) => {
    if (level === "ERROR") console.error(line);
    else if (level === "DEBUG") console.debug(line);
    else console.log(line);
  },
};

function createLogger(options = {}) {
  const {
    level: minLevel = "INFO",
    output = "console",
    formatter = defaultFormatter,
    write,
  } = options;

  const minLevelNum = LEVELS[minLevel] ?? LEVELS.INFO;

  const emit = (level, data) => {
    if ((LEVELS[level] ?? 0) < minLevelNum) return;
    const line = formatter({ ...data, level, timestamp: new Date().toISOString() });
    if (typeof write === "function") {
      write(line, level);
    } else {
      (writers[output] ?? writers.console)(line, level);
    }
  };

  return function log(fn, logLevel = minLevel) {
    const fnName = fn.name || "anonymous";

    if (fn.constructor.name === "AsyncFunction") {
      return async function (...args) {
        const start = Date.now();
        try {
          const result = await fn(...args);
          if (logLevel !== "ERROR") {
            emit(logLevel, { fnName, args, result, durationMs: Date.now() - start });
          }
          return result;
        } catch (error) {
          emit("ERROR", { fnName, args, error, durationMs: Date.now() - start });
          throw error;
        }
      };
    }

    return function (...args) {
      const start = Date.now();
      try {
        const result = fn(...args);
        if (logLevel !== "ERROR") {
          emit(logLevel, { fnName, args, result, durationMs: Date.now() - start });
        }
        return result;
      } catch (error) {
        emit("ERROR", { fnName, args, error, durationMs: Date.now() - start });
        throw error;
      }
    };
  };
}

export default createLogger;
