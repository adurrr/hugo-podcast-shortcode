/**
 * Source Adapters for <podcast-player>.
 *
 * This file re-exports the adapter classes and utilities from the main
 * component file so that unit tests can import them cleanly.
 *
 * The actual implementation lives in podcast-player.js (inlined there
 * because Hugo's resources.Get doesn't bundle ES module imports).
 *
 * @module sources
 */

export {
  detectSourceType,
  createSourceAdapter,
  LocalAdapter,
  AzuracastAdapter,
  IvooxAdapter,
} from "./podcast-player.js";
