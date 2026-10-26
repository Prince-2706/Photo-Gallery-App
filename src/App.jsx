import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { useFetchPhotos } from './hooks/useFetchPhotos'

const FAVOURITES_STORAGE_KEY = 'favouritePhotos'

// useReducer controls the list of favourite photo IDs.
function favouritesReducer(favouriteIds, action) {
  switch (action.type) {
    case 'TOGGLE_FAVOURITE':
      return favouriteIds.includes(action.photoId)
        ? favouriteIds.filter((id) => id !== action.photoId)
        : [...favouriteIds, action.photoId]

    default:
      return favouriteIds
  }
}

// Read saved favourites only when the component first renders.
function getSavedFavourites() {
  try {
    const savedFavourites = JSON.parse(
      localStorage.getItem(FAVOURITES_STORAGE_KEY),
    )

    return Array.isArray(savedFavourites) ? savedFavourites : []
  } catch {
    return []
  }
}

function HeartIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <div
      className="flex justify-center py-24"
      role="status"
      aria-label="Loading photos"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
    </div>
  )
}

function PhotoCard({ photo, isFavourite, onToggleFavourite }) {
  const buttonLabel = isFavourite
    ? `Remove ${photo.author} photo from favourites`
    : `Add ${photo.author} photo to favourites`

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
      <img
        src={`https://picsum.photos/id/${photo.id}/700/520`}
        alt={`Photograph by ${photo.author}`}
        className="aspect-[4/3] w-full object-cover"
      />

      <div className="flex items-center justify-between gap-3 p-4">
        <p className="truncate font-medium text-stone-800" title={photo.author}>
          {photo.author}
        </p>

        <button
          type="button"
          onClick={onToggleFavourite}
          aria-label={buttonLabel}
          aria-pressed={isFavourite}
          className={`shrink-0 rounded-full p-2 transition focus:outline-none focus:ring-4 focus:ring-orange-200 ${
            isFavourite
              ? 'text-red-500'
              : 'text-stone-400 hover:text-red-500'
          }`}
        >
          <HeartIcon filled={isFavourite} />
        </button>
      </div>
    </article>
  )
}

function Gallery() {
  const { photos, loading, error } = useFetchPhotos()
  const [searchQuery, setSearchQuery] = useState('')
  const [favouriteIds, dispatch] = useReducer(
    favouritesReducer,
    [],
    getSavedFavourites,
  )

  // Save favourites after every reducer state change.
  useEffect(() => {
    localStorage.setItem(
      FAVOURITES_STORAGE_KEY,
      JSON.stringify(favouriteIds),
    )
  }, [favouriteIds])

  // useCallback keeps this handler stable between renders.
  const handleSearch = useCallback((event) => {
    setSearchQuery(event.target.value)
  }, [])

  // useMemo recalculates only when the fetched photos or query changes.
  const filteredPhotos = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return photos
    }

    return photos.filter((photo) =>
      photo.author.toLowerCase().includes(normalizedQuery),
    )
  }, [photos, searchQuery])

  function toggleFavourite(photoId) {
    dispatch({ type: 'TOGGLE_FAVOURITE', photoId })
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="mb-10">
        <p className="text-left text-lg font-bold tracking-wide text-orange-600">
          Celebrare
        </p>

        <div className="mt-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
            Photo Gallery
          </h1>
          <p className="mt-3 text-base text-stone-600">
            Explore a collection of photographs and save the ones you love.
          </p>

          <label className="mx-auto mt-7 block max-w-xl text-left">
            <span className="sr-only">Search by photographer</span>
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by author name..."
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />
          </label>
        </div>
      </header>

      {loading && <LoadingSpinner />}

      {error && (
        <p
          className="rounded-xl bg-red-50 p-4 text-center text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          {filteredPhotos.length === 0 ? (
            <p className="py-16 text-center text-stone-600">No photos found for that author.</p>
          ) : (
            <section
              className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4"
              aria-label="Photos"
            >
              {filteredPhotos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  isFavourite={favouriteIds.includes(photo.id)}
                  onToggleFavourite={() => toggleFavourite(photo.id)}
                />
              ))}
            </section>
          )}
        </>
      )}
    </main>
  )
}

export default function App() {
  return <Gallery />
}
