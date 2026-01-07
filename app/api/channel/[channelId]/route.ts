// Backwards compatibility alias - proxies to /api/v1/channel/[channelId]
// This ensures existing clients continue to work while we migrate to versioned APIs

export { GET, maxDuration } from '../../v1/channel/[channelId]/route';
