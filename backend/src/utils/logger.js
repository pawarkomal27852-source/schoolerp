/**
 * Lightweight structured logger.
 * In production, replace with Winston or Pino for file transport + log rotation.
 * All output goes to stdout/stderr so cloud hosts (Render, Railway) capture it.
 */

const isDev = process.env.NODE_ENV !== 'production';

function timestamp() {
  return new Date().toISOString();
}

export const logger = {
  /**
   * Informational messages (green in dev).
   * @param {string} message
   * @param {*} [meta]
   */
  info(message, meta = null) {
    const line = `[${timestamp()}] INFO: ${message}`;
    if (meta) {
      console.log(isDev ? `\x1b[32m${line}\x1b[0m`, meta : line, meta);
    } else {
      console.log(isDev ? `\x1b[32m${line}\x1b[0m` : line);
    }
  },

  /**
   * Warning messages (yellow in dev).
   * @param {string} message
   * @param {*} [meta]
   */
  warn(message, meta = null) {
    const line = `[${timestamp()}] WARN: ${message}`;
    if (meta) {
      console.warn(isDev ? `\x1b[33m${line}\x1b[0m` : line, meta);
    } else {
      console.warn(isDev ? `\x1b[33m${line}\x1b[0m` : line);
    }
  },

  /**
   * Error messages (red in dev). Only logs stack in development.
   * @param {string} message
   * @param {Error|*} [error]
   */
  error(message, error = null) {
    const line = `[${timestamp()}] ERROR: ${message}`;
    if (error) {
      const detail = isDev && error.stack ? error.stack : String(error);
      console.error(isDev ? `\x1b[31m${line}\x1b[0m` : line, detail);
    } else {
      console.error(isDev ? `\x1b[31m${line}\x1b[0m` : line);
    }
  },

  /**
   * Debug messages — only emitted in development.
   * @param {string} message
   * @param {*} [meta]
   */
  debug(message, meta = null) {
    if (!isDev) return;
    const line = `[${timestamp()}] DEBUG: ${message}`;
    if (meta) {
      console.log(`\x1b[36m${line}\x1b[0m`, meta);
    } else {
      console.log(`\x1b[36m${line}\x1b[0m`);
    }
  },
};
