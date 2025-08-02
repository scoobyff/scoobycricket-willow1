export default function Home() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Xtream Codes to M3U Converter API</h1>
      
      <h2>Available Endpoints:</h2>
      
      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>1. Authentication</h3>
        <p><strong>POST</strong> <code>/api/auth</code></p>
        <p>Body: <code>{"{"}"server": "http://yourserver.com", "username": "your_user", "password": "your_pass"{"}"}</code></p>
      </div>

      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>2. Get Categories</h3>
        <p><strong>GET</strong> <code>/api/get-categories?server=SERVER&username=USER&password=PASS&type=TYPE</code></p>
        <p>Types: <code>live</code>, <code>vod</code>, <code>series</code></p>
      </div>

      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>3. Generate M3U Playlist</h3>
        <p><strong>GET</strong> <code>/api/generate-m3u?server=SERVER&username=USER&password=PASS&type=TYPE&category_id=ID</code></p>
        <p>Returns downloadable M3U file</p>
      </div>

      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>4. Stream Proxy</h3>
        <p><strong>GET</strong> <code>/api/play/SERVER/USERNAME/PASSWORD/STREAM_ID.m3u8</code></p>
        <p>Direct HLS streaming endpoint</p>
      </div>

      <div style={{ backgroundColor: '#e8f4fd', padding: '20px', borderRadius: '8px', marginTop: '30px' }}>
        <h3>Example Usage:</h3>
        <p>1. Generate M3U: <br/>
        <code>/api/generate-m3u?server=yourserver.com&username=testuser&password=testpass&type=live</code></p>
        
        <p>2. Stream URL: <br/>
        <code>/api/play/yourserver.com/testuser/testpass/12345.m3u8</code></p>
      </div>
    </div>
  )
}