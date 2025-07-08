import React, { useEffect, useState } from 'react'


const Percakapan = ({ userId, onSelect }) => {
  const [percakapanList, setPercakapanList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const fetchPercakapan = async () => {
      try {
        const res = await fetch(
          `api/chatbot/percakapan/${userId}.json`
        )
        setPercakapanList(res.data) // asumsikan API return array of percakapan
      } catch (err) {
        console.error('Gagal fetch percakapan:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPercakapan()
  }, [userId])

  if (loading) return <p>🔄 Memuat percakapan...</p>
  if (percakapanList.length === 0) return <p>💬 Belum ada percakapan</p>

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-bold mb-2">Riwayat Percakapan</h2>
      {percakapanList.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect && onSelect(p.id)}
          className="block w-full text-left px-4 py-2 bg-gray-100 hover:bg-blue-100 rounded"
        >
          <div className="font-medium">{p.topik || 'Tanpa Topik'}</div>
          <div className="text-sm text-gray-600">
            {new Date(p.waktu_mulai).toLocaleString()}
          </div>
        </button>
      ))}
    </div>
  )
}

export default Percakapan
