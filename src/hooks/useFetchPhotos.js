import { useEffect, useState } from 'react'

const PHOTOS_URL = 'https://picsum.photos/v2/list?limit=30'

// Fetches the gallery photos and exposes only the data states the UI needs.
export function useFetchPhotos() {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadPhotos() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(PHOTOS_URL, { signal: controller.signal })

        if (!response.ok) {
          throw new Error('Unable to load photos. Please try again later.')
        }

        const photoData = await response.json()
        setPhotos(photoData)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Unable to load photos. Please try again later.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadPhotos()
    return () => controller.abort()
  }, [])

  return { photos, loading, error }
}
