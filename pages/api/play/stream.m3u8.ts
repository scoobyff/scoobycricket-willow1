import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Missing stream ID. Use: ?id=158442' })
  }

  // Your hidden credentials (from .env.local or hardcoded)
  const server = process.env.XTREAM_SERVER || 'starshare.fun'
  const username = process.env.XTREAM_USERNAME || 'home123'
  const password = process.env.XTREAM_PASSWORD || 'home123'

  try {
    // Build the actual stream URL
    const streamUrl = `https://${server}/live/${username}/${password}/${id}.m3u8`

    // Fetch the stream
    const response = await axios.get(streamUrl, {
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': `https://${server}/`,
      }
    })

    // Set proper HLS headers
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')

    // Handle M3U8 content modification if needed
    if (response.headers['content-type']?.includes('mpegurl') || response.headers['content-type']?.includes('m3u8')) {
      let m3u8Content = ''
      
      response.data.on('data', (chunk: Buffer) => {
        m3u8Content += chunk.toString()
      })
      
      response.data.on('end', () => {
        // Modify the M3U8 content to use your proxy for .ts segments
        const modifiedContent = m3u8Content.replace(
          /^([^#\n].+\.ts)$/gm, 
          (match, tsFile) => {
            // If it's a relative path, make it absolute through your proxy
            if (!tsFile.startsWith('http')) {
              return `https://scoobycricket-willow1-llltfff.vercel.app/api/play/segment.ts?id=${id}&file=${encodeURIComponent(tsFile)}`
            }
            return match
          }
        )
        
        res.status(200).send(modifiedContent)
      })
    } else {
      // For non-M3U8 content, just pipe through
      response.data.pipe(res)
    }

  } catch (error) {
    console.error('Stream error:', error)
    
    // Try alternative URL format
    try {
      const altStreamUrl = `https://${server}/get.php?username=${username}&password=${password}&type=m3u_plus&output=ts&streamid=${id}`
      
      const altResponse = await axios.get(altStreamUrl, {
        responseType: 'stream',
        timeout: 30000,
        headers: {
          'User-Agent': 'VLC/3.0.0 LibVLC/3.0.0',
        }
      })

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
      res.setHeader('Access-Control-Allow-Origin', '*')
      altResponse.data.pipe(res)

    } catch (altError) {
      console.error('Alternative stream error:', altError)
      res.status(404).json({ 
        error: 'Stream not found or server unreachable',
        streamId: id,
        attempts: ['live format', 'get.php format']
      })
    }
  }
}