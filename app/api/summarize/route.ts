// Backwards compatibility alias - proxies to /api/v1/summarize
// This ensures existing clients continue to work while we migrate to versioned APIs

export { POST, maxDuration } from '../v1/summarize/route';
