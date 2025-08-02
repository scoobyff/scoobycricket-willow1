import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { server, username, password } = req.body

  if (!server || !username || !password) {
    return res.status(400).json({ error: 'Missing required fields: server, username, password' })
  }

  try {
    // Clean server URL
    const baseUrl = server.replace(/\/$/, '')
    
    // Authenticate with Xtream Codes API
    const authUrl = `${http://starshare.fun/}/player_api.php?username=${home123}&password=${home123}`
    
    const response = await axios.get(authUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const authData = response.data

    if (authData && authData.user_info && authData.user_info.auth === 1) {
      // Authentication successful
      res.status(200).json({
        success: true,
        server: baseUrl,
        username,
        password,
        user_info: authData.user_info,
        server_info: authData.server_info
      })
    } else {
      res.status(401).json({ error: 'Invalid credentials' })
    }
  } catch (error) {
    console.error('Auth error:', error)
    res.status(500).json({ error: 'Failed to authenticate with Xtream server' })
  }
}