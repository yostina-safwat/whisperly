/**
 * Logger — a small custom logger class.
 *
 * Demonstrates OOP (a class with encapsulated behaviour) and gives us a
 * single, consistent place to format log output with levels, colours and
 * timestamps — instead of scattering raw console.log calls everywhere.
 */
const LEVELS = {
  error: { label: "ERROR", color: "\x1b[31m" }, // red
  warn: { label: "WARN", color: "\x1b[33m" }, // yellow
  info: { label: "INFO", color: "\x1b[32m" }, // green
  http: { label: "HTTP", color: "\x1b[36m" }, // cyan
  debug: { label: "DEBUG", color: "\x1b[35m" }, // magenta
};

const RESET = "\x1b[0m";

class Logger {
  constructor(context = "Whisperly") {
    this.context = context;
  }

  #format(level, message) {
    const { label, color } = LEVELS[level] || LEVELS.info;
    const timestamp = new Date().toISOString();
    return `${color}[${timestamp}] [${this.context}] ${label}:${RESET} ${message}`;
  }

  error(message) {
    console.error(this.#format("error", message));
  }

  warn(message) {
    console.warn(this.#format("warn", message));
  }

  info(message) {
    console.info(this.#format("info", message));
  }

  http(message) {
    console.log(this.#format("http", message));
  }

  debug(message) {
    if (process.env.NODE_ENV === "development") {
      console.debug(this.#format("debug", message));
    }
  }
}

// Export a shared singleton so the whole app logs with the same instance.
const logger = new Logger();
export default logger;
export { Logger };
