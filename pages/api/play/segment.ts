import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, file } = req.query

  if (!id || !file) {
    return res.status(400).json({ error: 'Missing parameters' })
  }

  // Your hidden credentials
  const server = process.env.XTREAM_SERVER || 'starshare.fun'
  const username = process.env.XTREAM_USERNAME || 'home123'
  const password = process.env.XTREAM_PASSWORD || 'home123'

  try {
    // Build the segment URL
    const segmentUrl = `https://${server}/live/${username}/${password}/${file}`

    // Proxy the TS segment
    const response = await axios.get(segmentUrl, {
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': `https://${server}/`,
      }
    })

    // Set proper headers for TS segments
    res.setHeader('Content-Type', 'video/mp2t')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Cache-Control', 'public, max-age=3600')

    // Pipe the segment
    response.data.pipe(res)

  } catch (error) {
    console.error('Segment error:', error)
    res.status(404).json({ error: 'Segment not found' })
  }
}