import type { NextApiRequest, NextApiResponse } from 'next';
import { XTREAM_CONFIG, buildStreamUrl } from '../../../lib/config';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { streamId } = req.query;

  // Extract stream ID from filename (remove .m3u8 or .ts extension)
  const cleanStreamId = Array.isArray(streamId) 
    ? streamId[0].replace(/\.(m3u8|ts)$/, '') 
    : streamId?.replace(/\.(m3u8|ts)$/, '');

  if (!cleanStreamId) {
    return res.status(400).json({ 
      error: 'Missing stream ID parameter' 
    });
  }

  try {
    // Determine stream format based on original request
    const originalStreamId = Array.isArray(streamId) ? streamId[0] : streamId;
    const isM3U8 = originalStreamId?.endsWith('.m3u8');
    const format = isM3U8 ? 'm3u8' : 'ts';

    // Build the actual Xtream stream URL using config
    const streamUrl = buildStreamUrl(cleanStreamId, format);

    // Fetch the stream
    const streamResponse = await fetch(streamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': XTREAM_CONFIG.url,
      },
    });

    if (!streamResponse.ok) {
      throw new Error(`Stream not available: ${streamResponse.status}`);
    }

    // Set appropriate headers based on stream type
    if (isM3U8) {
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    } else {
      res.setHeader('Content-Type', 'video/mp2t');
    }

    // Set caching and CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Disposition', `inline; filename="${cleanStreamId}.${format}"`);

    // Stream the content
    const streamBuffer = await streamResponse.arrayBuffer();
    res.status(200).send(Buffer.from(streamBuffer));

  } catch (error) {
    console.error('Stream proxy error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to proxy stream' 
    });
  }
}