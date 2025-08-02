// Xtream Codes Configuration
// Update these with your actual Xtream credentials
export const XTREAM_CONFIG = {
  url: 'http://your-server.com:8080',  // Your Xtream server URL
  username: 'your_username',           // Your Xtream username
  password: 'your_password',           // Your Xtream password
};

// Helper function to get clean server URL
export const getCleanUrl = (url: string): string => {
  return url.replace(/\/$/, '');
};

// Build Xtream API URLs
export const buildXtreamUrl = (action: string): string => {
  const cleanUrl = getCleanUrl(XTREAM_CONFIG.url);
  return `${cleanUrl}/player_api.php?username=${XTREAM_CONFIG.username}&password=${XTREAM_CONFIG.password}&action=${action}`;
};

// Build stream URL
export const buildStreamUrl = (streamId: string, format: 'ts' | 'm3u8' = 'ts'): string => {
  const cleanUrl = getCleanUrl(XTREAM_CONFIG.url);
  return `${cleanUrl}/live/${XTREAM_CONFIG.username}/${XTREAM_CONFIG.password}/${streamId}.${format}`;
};