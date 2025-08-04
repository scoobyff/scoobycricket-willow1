import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get YOUR credentials from environment variables
  const server = process.env.XTREAM_SERVER
  const username = process.env.XTREAM_USERNAME
  const password = process.env.XTREAM_PASSWORD

  if (!server || !username || !password) {
    return res.status(500).json({ error: 'Credentials not configured in environment variables' })
  }

  const { type = 'live', category_id } = req.query

  try {
    const baseUrl = server.startsWith('http') ? server : `http://${server}`
    let apiUrl = ''

    switch (type) {
      case 'live':
        apiUrl = category_id 
          ? `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams&category_id=${category_id}`
          : `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams`
        break
      case 'vod':
        apiUrl = category_id
          ? `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_streams&category_id=${category_id}`
          : `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_streams`
        break
      default:
        return res.status(400).json({ error: 'Invalid type. Use: live or vod' })
    }

    const response = await axios.get(apiUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const streams = response.data

    if (!Array.isArray(streams)) {
      return res.status(400).json({ error: 'No streams found' })
    }

    // Generate M3U playlist
    let m3uContent = '#EXTM3U\n'

    streams.forEach((stream: any) => {
      if (type === 'live') {
        const streamUrl = `${baseUrl}/live/${username}/${password}/${stream.stream_id}.m3u8`
        m3uContent += `#EXTINF:-1 tvg-id="${stream.stream_id}" tvg-name="${stream.name}" tvg-logo="${stream.stream_icon || ''}" group-title="${stream.category_name || 'Live'}",${stream.name}\n`
        m3uContent += `${streamUrl}\n`
      } else if (type === 'vod') {
        const streamUrl = `${baseUrl}/movie/${username}/${password}/${stream.stream_id}.${stream.container_extension || 'mp4'}`
        m3uContent += `#EXTINF:-1 tvg-id="${stream.stream_id}" tvg-name="${stream.name}" tvg-logo="${stream.stream_icon || ''}" group-title="${stream.category_name || 'Movies'}",${stream.name}\n`
        m3uContent += `${streamUrl}\n`
      }
    })

    // Set headers for M3U download
    res.setHeader('Content-Type', 'audio/x-mpegurl')
    res.setHeader('Content-Disposition', `attachment; filename="${type}_playlist.m3u"`)
    res.setHeader('Access-Control-Allow-Origin', '*')

    res.status(200).send(m3uContent)
  } catch (error) {
    console.error('Streams error:', error)
    res.status(500).json({ error: 'Failed to generate playlist' })
  }
}