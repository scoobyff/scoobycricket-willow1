import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { server, username, password, type = 'live' } = req.query

  if (!server || !username || !password) {
    return res.status(400).json({ error: 'Missing credentials' })
  }

  try {
    const baseUrl = (server as string).replace(/\/$/, '')
    let apiUrl = ''

    switch (type) {
      case 'live':
        apiUrl = `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_live_categories`
        break
      case 'vod':
        apiUrl = `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_vod_categories`
        break
      case 'series':
        apiUrl = `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_series_categories`
        break
      default:
        return res.status(400).json({ error: 'Invalid type. Use: live, vod, or series' })
    }

    const response = await axios.get(apiUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    res.status(200).json(response.data)
  } catch (error) {
    console.error('Categories error:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
}