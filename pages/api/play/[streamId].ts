import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { params } = req.query
  
  if (!params || !Array.isArray(params)) {
    return res.status(400).json({ error: 'Invalid parameters' })
  }

  // Expected format: /api/play/server/username/password/streamId.m3u8
  // or: /api/play/server/username/password/streamId.ts
  if (params.length < 4) {
    return res.status(400).json({ error: 'Missing parameters. Format: /api/play/server/username/password/streamId.m3u8' })
  }

  const server = params[0]
  const username = params[1] 
  const password = params[2]
  const streamFile = params[3]

  // Extract stream ID and extension
  const streamMatch = streamFile.match(/^(.+)\.(m3u8|ts|mp4)$/)
  if (!streamMatch) {
    return res.status(400).json({ error: 'Invalid stream format' })
  }

  const streamId = streamMatch[1]
  const extension = streamMatch[2]

  try {
    const baseUrl = `http://${server}`
    let streamUrl = ''

    if (extension === 'm3u8') {
      // HLS Live stream
      streamUrl = `${baseUrl}/live/${username}/${password}/${streamId}.m3u8`
    } else if (extension === 'ts') {
      // HLS segment
      streamUrl = `${baseUrl}/live/${username}/${password}/${streamId}.ts`
    } else if (extension === 'mp4') {
      // VOD stream
      streamUrl = `${baseUrl}/movie/${username}/${password}/${streamId}.mp4`
    }

    // Proxy the stream
    const response = await axios.get(streamUrl, {
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    // Set appropriate headers
    if (extension === 'm3u8') {
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl')
    } else if (extension === 'ts') {
      res.setHeader('Content-Type', 'video/mp2t')
    } else if (extension === 'mp4') {
      res.setHeader('Content-Type', 'video/mp4')
    }

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    res.setHeader('Cache-Control', 'no-cache')

    // Pipe the stream response
    response.data.pipe(res)

  } catch (error) {
    console.error('Stream proxy error:', error)
    res.status(404).json({ error: 'Stream not found or server unreachable' })
  }
}