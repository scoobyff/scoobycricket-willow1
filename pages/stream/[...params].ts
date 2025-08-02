import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function StreamPlayer() {
  const router = useRouter();
  const { streamId, u, p, url, name } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [streamUrl, setStreamUrl] = useState('');

  useEffect(() => {
    if (streamId && u && p && url) {
      // Build the proxy stream URL
      const proxyUrl = `/api/play/${streamId}.m3u8?u=${encodeURIComponent(u as string)}&p=${encodeURIComponent(p as string)}&url=${encodeURIComponent(url as string)}`;
      setStreamUrl(proxyUrl);
      setIsLoading(false);
    }
  }, [streamId, u, p, url]);

  const channelName = (name as string) || `Stream ${streamId}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="loading-spinner mb-4"></div>
          <p>Loading stream...</p>
        </div>
      </div>
    );
  }

  if (!streamId || !u || !p || !url) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h1 className="text-2xl mb-4">Error</h1>
          <p>Missing required stream parameters</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{channelName} - Live Stream</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <div className="bg-gray-900 p-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{channelName}</h1>
            <p className="text-gray-400 text-sm">Stream ID: {streamId}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Video Player */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <video
            className="absolute top-0 left-0 w-full h-full"
            controls
            autoPlay
            playsInline
            poster="/api/placeholder-poster"
            onError={(e) => setError('Failed to load stream')}
          >
            <source src={streamUrl} type="application/vnd.apple.mpegurl" />
            <p className="text-center text-red-500 p-8">
              Your browser doesn't support HLS playback. Please use a compatible player like VLC.
            </p>
          </video>
        </div>

        {/* Stream Info */}
        <div className="p-6">
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Stream Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Stream ID:</span>
                <span className="ml-2">{streamId}</span>
              </div>
              <div>
                <span className="text-gray-400">Format:</span>
                <span className="ml-2">HLS (M3U8)</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-400">Direct URL:</span>
                <div className="mt-1 bg-gray-800 p-2 rounded text-xs break-all">
                  {streamUrl}
                </div>
              </div>
            </div>
          </div>

          {/* Alternative Players */}
          <div className="mt-6 bg-gray-900 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Alternative Players</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <a
                href={`vlc://${window.location.origin}${streamUrl}`}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-center transition-colors"
              >
                📺 Open in VLC
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}${streamUrl}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                📋 Copy URL
              </button>
              <a
                href={`${window.location.origin}${streamUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-center transition-colors"
              >
                🔗 Direct Link
              </a>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mb-6 p-4 bg-red-900 border border-red-600 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .loading-spinner {
          border: 3px solid #374151;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
