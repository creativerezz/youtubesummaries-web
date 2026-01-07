// Backwards compatibility alias - proxies to /api/v1/youtube/search
// This ensures existing clients continue to work while we migrate to versioned APIs

export { GET, maxDuration } from '../../v1/youtube/search/route';
