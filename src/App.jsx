import { useEffect, useRef, useState } from 'react'
import './App.css'

const tracks = [
  {
    id: 1,
    title: 'SoundHelix Song 1',
    artist: 'SoundHelix',
    album: 'SoundHelix MP3 sample',
    language: 'Instrumental',
    genre: 'Electronic',
    categories: ['Trending Songs', 'Melody Songs'],
    cover:
      'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=700&q=85',
    color: '#d264a5',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 2,
    title: 'SoundHelix Song 2',
    artist: 'SoundHelix',
    album: 'SoundHelix MP3 sample',
    language: 'Instrumental',
    genre: 'Ambient',
    categories: ['Trending Songs', 'Love Songs'],
    cover:
      'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=700&q=85',
    color: '#d99743',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 3,
    title: 'SoundHelix Song 3',
    artist: 'SoundHelix',
    album: 'SoundHelix MP3 sample',
    language: 'Instrumental',
    genre: 'Chill',
    categories: ['Trending Songs', 'Sad Songs'],
    cover:
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=700&q=85',
    color: '#498c9b',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 4,
    title: 'SoundHelix Song 4',
    artist: 'SoundHelix',
    album: 'SoundHelix MP3 sample',
    language: 'Instrumental',
    genre: 'Electronic',
    categories: ['Trending Songs', 'Mass Songs'],
    cover:
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=700&q=85',
    color: '#7294a7',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: 5,
    title: 'SoundHelix Song 5',
    artist: 'SoundHelix',
    album: 'SoundHelix MP3 sample',
    language: 'Instrumental',
    genre: 'Downtempo',
    categories: ['Trending Songs', 'Love Songs'],
    cover:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=85',
    color: '#de7953',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
  {
    id: 6,
    title: 'SoundHelix Song 6',
    artist: 'SoundHelix',
    album: 'SoundHelix MP3 sample',
    language: 'Instrumental',
    genre: 'Ambient',
    categories: ['Trending Songs', 'Melody Songs'],
    cover:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=700&q=85',
    color: '#625eb1',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  },
]

const categories = [
  'Tamil Songs',
  'English Songs',
  'Sinhala Songs',
  'Hindi Songs',
  'Trending Songs',
  'Love Songs',
  'Melody Songs',
  'Sad Songs',
  'Mass Songs',
]

const languages = ['All languages', 'Tamil', 'English', 'Sinhala', 'Hindi', 'Korean', 'Other languages']
const genres = ['All genres', 'Pop', 'Rock', 'Hip-hop', 'R&B', 'Electronic', 'Ambient', 'Chill', 'Downtempo', 'Instrumental', 'Other']
const providerApiBase = import.meta.env.VITE_TUNEWAVE_API_BASE_URL?.replace(/\/+$/, '') ?? ''
const languageCountries = {
  Tamil: 'IN',
  English: 'US',
  Sinhala: 'LK',
  Hindi: 'IN',
  Korean: 'KR',
}
const countries = [
  { code: 'US', name: 'United States' },
  { code: 'IN', name: 'India' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'KR', name: 'South Korea' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'SG', name: 'Singapore' },
]
const appleBadgeUrl =
  'https://tools.applemediaservices.com/api/badges/listen-on-apple-music/badge/en-us?size=150x40'

function rchAppleCatalogue(params, signal) {sea
  return new Promise((resolve, reject) => {
    const callbackName = `tuneWaveAppleSearch${Date.now()}${Math.random().toString(36).slice(2)}`
    const script = document.createElement('script')
    const cleanup = () => {
      window.clearTimeout(timeoutId)
      script.remove()
      delete window[callbackName]
      signal.removeEventListener('abort', abort)
    }
    const abort = () => {
      cleanup()
      reject(new DOMException('Search cancelled', 'AbortError'))
    }
    const timeoutId = window.setTimeout(() => {
      cleanup()
      reject(new Error('Apple Music search timed out. Please try again.'))
    }, 15000)

    window[callbackName] = (data) => {
      cleanup()
      if (!data || !Array.isArray(data.results)) {
        reject(new Error('Apple Music returned an unexpected search response.'))
        return
      }
      resolve(data)
    }
    script.onerror = () => {
      cleanup()
      reject(new Error('Could not connect to Apple Music Search.'))
    }
    signal.addEventListener('abort', abort, { once: true })
    if (signal.aborted) {
      abort()
      return
    }

    const searchParams = new URLSearchParams(params)
    searchParams.set('callback', callbackName)
    script.src = `https://itunes.apple.com/search?${searchParams.toString()}`
    document.head.append(script)
  })
}

function normalizeProviderTrack(track, index, selectedCategory) {
  if (
    !track ||
    typeof track !== 'object' ||
    typeof track.id !== 'string' ||
    !['title', 'artist', 'album', 'language', 'artworkUrl'].every(
      (field) => typeof track[field] === 'string' && track[field].trim(),
    )
  ) {
    return null
  }

  const playbackUrl = typeof track.playbackUrl === 'string' ? track.playbackUrl.trim() : ''
  const isWebUrl = /^https:\/\//i.test(playbackUrl)
  const isProviderPath =
    playbackUrl.startsWith('/api/music/playback/') && !playbackUrl.startsWith('//')
  const authorizedPlayback =
    track.playbackAuthorized === true && playbackUrl && (isWebUrl || isProviderPath)
      ? playbackUrl
      : null
  const artworkUrl = track.artworkUrl.trim()
  const isValidArtwork =
    /^https:\/\//i.test(artworkUrl) ||
    (artworkUrl.startsWith('/') && !artworkUrl.startsWith('//'))
  if (!isValidArtwork) return null
  const cover = artworkUrl.startsWith('/')
    ? `${providerApiBase}${artworkUrl}`
    : artworkUrl
  const trackCategories = Array.isArray(track.categories)
    ? track.categories.filter((category) => categories.includes(category))
    : []

  return {
    id: `provider:${track.id}`,
    title: track.title.trim(),
    artist: track.artist.trim(),
    album: track.album.trim(),
    language: track.language.trim(),
    genre: typeof track.genre === 'string' && track.genre.trim() ? track.genre.trim() : 'Other',
    categories: trackCategories.length ? trackCategories : [selectedCategory],
    cover,
    color: tracks[index % tracks.length].color,
    audio: authorizedPlayback
      ? authorizedPlayback.startsWith('/')
        ? `${providerApiBase}${authorizedPlayback}`
        : authorizedPlayback
      : null,
    audioSource:
      typeof track.sourceName === 'string' && track.sourceName.trim()
        ? track.sourceName.trim()
        : 'Licensed provider',
  }
}

function normalizeAppleTrack(track, index, selectedLanguage, country, category) {
  if (
    !track ||
    !Number.isFinite(track.trackId) ||
    typeof track.trackName !== 'string' ||
    typeof track.artistName !== 'string' ||
    typeof track.artworkUrl100 !== 'string' ||
    typeof track.trackViewUrl !== 'string'
  ) {
    return null
  }
  const artworkUrl = track.artworkUrl100.replace(/\/\d+x\d+bb\./, '/600x600bb.')
  if (!/^https:\/\//i.test(artworkUrl) || !/^https:\/\//i.test(track.trackViewUrl)) {
    return null
  }
  const previewUrl =
    typeof track.previewUrl === 'string' && /^https:\/\//i.test(track.previewUrl)
      ? track.previewUrl
      : null
  const genre = typeof track.primaryGenreName === 'string' ? track.primaryGenreName : 'Other'
  const storeUrl = track.trackViewUrl

  return {
    id: `apple:${track.trackId}`,
    title: track.trackName,
    artist: track.artistName,
    album: typeof track.collectionName === 'string' ? track.collectionName : 'Single',
    language: selectedLanguage === 'All languages' ? 'Not provided' : `${selectedLanguage} · ${country} storefront`,
    genre,
    categories: [category],
    cover: artworkUrl,
    color: tracks[index % tracks.length].color,
    audio: previewUrl,
    audioSource: previewUrl ? 'Apple Music preview' : '',
    storeUrl,
  }
}

const sampleAudioSource = 'SoundHelix public audio example'

const artists = [
  {
    name: 'The Weeknd',
    genre: 'R&B · Pop',
    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=85',
  },
  {
    name: 'Taylor Swift',
    genre: 'Pop · Singer-songwriter',
    image:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=85',
  },
  {
    name: 'Frank Ocean',
    genre: 'Alternative R&B',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=85',
  },
  {
    name: 'SZA',
    genre: 'R&B · Soul',
    image:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=500&q=85',
  },
]

const starterPlaylists = [
  { id: 'late-night', name: 'Late Night Drift', description: 'Soft sounds for the long way home.', trackIds: [1, 3, 6] },
  { id: 'golden-days', name: 'Golden Days', description: 'A little light for wherever you’re headed.', trackIds: [2, 4, 5] },
]

function Icon({ name, size = 20, filled = false }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: filled ? 'currentColor' : 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  const paths = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-7h6v7" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    library: <><path d="M4 5v14M9 5v14M14 5v14" /><path d="M19 5v14" /></>,
    heart: <path d="M20.8 8.8c0 5-8.8 10.2-8.8 10.2S3.2 13.8 3.2 8.8A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8.8 2.2Z" />,
    play: <path d="m8 5 12 7-12 7z" />,
    pause: <><path d="M8 5h3v14H8z" /><path d="M15 5h3v14h-3z" /></>,
    next: <><path d="m5 5 10 7-10 7z" /><path d="M19 5v14" /></>,
    previous: <><path d="m19 5-10 7 10 7z" /><path d="M5 5v14" /></>,
    volume: <><path d="M4 10v4h4l5 4V6l-5 4z" /><path d="M17 9a5 5 0 0 1 0 6M19.5 6.5a9 9 0 0 1 0 11" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    shuffle: <><path d="m4 7 2-2 12 12 2-2M18 5h2v2M4 17l2 2 4-4M18 19h2v-2" /></>,
    repeat: <><path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" /></>,
    headphones: <><path d="M3 13v-2a9 9 0 0 1 18 0v2" /><path d="M3 13h4v7H5a2 2 0 0 1-2-2zM17 13h4v5a2 2 0 0 1-2 2h-2z" /></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  }

  return <svg {...common}>{paths[name]}</svg>
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00'
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

function App() {
  const [currentTrack, setCurrentTrack] = useState(tracks[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(72)
  const [likedTracks, setLikedTracks] = useState(() => new Set([2]))
  const [activeNav, setActiveNav] = useState('Home')
  const [activeCategory, setActiveCategory] = useState('Trending Songs')
  const [activeLanguage, setActiveLanguage] = useState('All languages')
  const [activeCountry, setActiveCountry] = useState('US')
  const [activeGenre, setActiveGenre] = useState('All genres')
  const [providerTracks, setProviderTracks] = useState([])
  const [knownTracks, setKnownTracks] = useState(() => new Map(tracks.map((track) => [track.id, track])))
  const [catalogueLoading, setCatalogueLoading] = useState(false)
  const [catalogueError, setCatalogueError] = useState('')
  const [catalogueRetry, setCatalogueRetry] = useState(0)
  const [resultLimit, setResultLimit] = useState(25)
  const [hasMoreResults, setHasMoreResults] = useState(false)
  const [playlists, setPlaylists] = useState(starterPlaylists)
  const [activePlaylistId, setActivePlaylistId] = useState(null)
  const [recentTrackIds, setRecentTrackIds] = useState([3, 1, 5])
  const [showPlaylistForm, setShowPlaylistForm] = useState(false)
  const [playlistName, setPlaylistName] = useState('')
  const [query, setQuery] = useState('')
  const [playbackNotice, setPlaybackNotice] = useState('')
  const audioRef = useRef(null)
  const searchRef = useRef(null)
  const playlistInputRef = useRef(null)
  const searchKeyRef = useRef('')

  const activePlaylist = playlists.find((playlist) => playlist.id === activePlaylistId)

  useEffect(() => {
    if (showPlaylistForm) playlistInputRef.current?.focus()
  }, [showPlaylistForm])

  useEffect(() => {
    const controller = new AbortController()
    const searchTerm = query.trim() || activeCategory.replace(' Songs', ' music')
    const country = activeCountry
    const searchKey = JSON.stringify([
      query.trim(),
      activeLanguage,
      activeGenre,
      activeCategory,
      activeNav,
      activePlaylist?.id ?? '',
    ])

    const timeout = window.setTimeout(async () => {
      if (activePlaylist || (activeNav === 'Your Library' && !query.trim())) {
        searchKeyRef.current = ''
        setProviderTracks([])
        setCatalogueLoading(false)
        setCatalogueError('')
        return
      }

      const appendResults = searchKeyRef.current === searchKey
      searchKeyRef.current = searchKey
      if (!appendResults) {
        setProviderTracks([])
        setHasMoreResults(false)
      }
      setCatalogueError('')
      setCatalogueLoading(true)
      try {
        let results
        if (providerApiBase) {
          const params = new URLSearchParams({
            q: query.trim(),
            language: activeLanguage === 'All languages' ? '' : activeLanguage,
            genre: activeGenre === 'All genres' ? '' : activeGenre,
            category: activeCategory,
            limit: String(resultLimit),
          })
          const response = await fetch(
            `${providerApiBase}/api/music/search?${params.toString()}`,
            { signal: controller.signal },
          )
          if (!response.ok) {
            throw new Error(`Music catalogue request failed (${response.status}).`)
          }
          const result = await response.json()
          if (!result || !Array.isArray(result.tracks)) {
            throw new Error('The music catalogue returned an unexpected response.')
          }
          setHasMoreResults(
            result.hasMore === true || result.tracks.length >= resultLimit,
          )
          results = result.tracks
            .slice(0, resultLimit)
            .map((track, index) => normalizeProviderTrack(track, index, activeCategory))
            .filter(Boolean)
        } else {
          const result = await searchAppleCatalogue(
            {
              term: searchTerm,
              media: 'music',
              entity: 'song',
              country,
              limit: String(resultLimit),
            },
            controller.signal,
          )
          setHasMoreResults(result.results.length >= resultLimit)
          results = result.results
            .map((track, index) =>
              normalizeAppleTrack(track, index, activeLanguage, country, activeCategory),
            )
            .filter(Boolean)
        }
        if (activeGenre !== 'All genres') {
          results = results.filter((track) => track.genre === activeGenre)
        }
        setProviderTracks((previous) => {
          if (!appendResults) return results
          const existingIds = new Set(previous.map((track) => track.id))
          return [...previous, ...results.filter((track) => !existingIds.has(track.id))]
        })
        setKnownTracks((previous) => {
          const next = new Map(previous)
          for (const track of results) next.set(track.id, track)
          return next
        })
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Could not search the music catalogue:', error)
          setCatalogueError(error.message || 'We couldn’t reach the music catalogue. Please try again.')
          setHasMoreResults(false)
        }
      } finally {
        if (!controller.signal.aborted) setCatalogueLoading(false)
      }
    }, query.trim() ? 300 : 0)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [query, activeLanguage, activeCountry, activeGenre, activeCategory, activeNav, activePlaylist, catalogueRetry, resultLimit])

  useEffect(() => {
    if (audioRef.current) audioRef.current.currentTime = 0
  }, [currentTrack])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume / 100
    if (isPlaying) {
      audio.play().catch((error) => {
        console.error('Could not play the demo track:', error)
        setPlaybackNotice(`Audio could not be played for “${currentTrack.title}”. Please try another track.`)
        setIsPlaying(false)
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, currentTrack, volume])

  const allTracks = [...new Map(
    [...knownTracks.values(), ...providerTracks].map((track) => [track.id, track]),
  ).values()]
  const currentCatalogue = [...providerTracks, ...tracks]
  const availableGenres = [...new Set([...genres, ...providerTracks.map((track) => track.genre)])]
  const visibleTracks = (activePlaylist
    ? allTracks.filter((track) => activePlaylist.trackIds.includes(track.id))
    : query.trim()
      ? currentCatalogue
    : activeNav === 'Your Library'
      ? allTracks.filter((track) => likedTracks.has(track.id))
        : currentCatalogue.filter((track) => track.categories.includes(activeCategory))
  )
    .filter((track) => activeLanguage === 'All languages' || track.language === activeLanguage)
    .filter((track) => activeGenre === 'All genres' || track.genre === activeGenre)
    .filter((track) =>
      `${track.title} ${track.artist} ${track.album} ${track.language} ${track.genre}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    )
  const recentlyPlayed = recentTrackIds
    .map((trackId) => allTracks.find((track) => track.id === trackId))
    .filter(Boolean)

  function selectTrack(track) {
    if (!track.audio) {
      setPlaybackNotice(`Playback is unavailable for “${track.title}”. The provider did not supply an authorized audio preview.`)
      return
    }
    setPlaybackNotice('')
    if (audioRef.current) audioRef.current.currentTime = 0
    setCurrentTrack(track)
    setProgress(0)
    setDuration(0)
    setIsPlaying(true)
    setRecentTrackIds((previous) => [track.id, ...previous.filter((id) => id !== track.id)].slice(0, 6))
  }

  function stepTrack(direction) {
    const playableTracks = allTracks.filter((track) => track.audio)
    const index = playableTracks.findIndex((track) => track.id === currentTrack.id)
    for (let offset = 1; offset <= playableTracks.length; offset += 1) {
      const nextIndex = (index + direction * offset + playableTracks.length * 2) % playableTracks.length
      if (playableTracks[nextIndex]?.audio) {
        selectTrack(playableTracks[nextIndex])
        return
      }
    }
  }

  function toggleLike(trackId) {
    setLikedTracks((previous) => {
      const next = new Set(previous)
      if (next.has(trackId)) next.delete(trackId)
      else next.add(trackId)
      return next
    })
  }

  function handleNavigation(name) {
    setActiveNav(name)
    setActivePlaylistId(null)
    setActiveCategory('Trending Songs')
    if (name === 'Search') {
      searchRef.current?.focus()
    } else {
      setQuery('')
    }
  }

  function openPlaylist(playlistId) {
    setActiveNav('Your Library')
    setActivePlaylistId(playlistId)
    setQuery('')
  }

  function chooseCategory(category) {
    setActiveNav('Home')
    setActivePlaylistId(null)
    setActiveCategory(category)
    setQuery('')
    setResultLimit(25)
  }

  function changeLanguage(language) {
    setActiveLanguage(language)
    if (languageCountries[language]) {
  setActiveCountry(languageCountries[language])
}
setResultLimit(25)
  }

  function changeCountry(event) {
    setActiveCountry(event.target.value)
    setActiveLanguage('All languages')
    setResultLimit(25)
  }

  function changeGenre(genre) {
    setActiveGenre(genre)
    setResultLimit(25)
  }

  function changeSearch(event) {
    setQuery(event.target.value)
    setResultLimit(25)
  }

  function createPlaylist(event) {
    event.preventDefault()
    const name = playlistName.trim()
    if (!name) {
      playlistInputRef.current?.focus()
      return
    }
    const playlist = {
      id: `playlist-${Date.now()}`,
      name,
      description: 'Your own collection, your own soundtrack.',
      trackIds: [],
    }
    setPlaylists((previous) => [...previous, playlist])
    setPlaylistName('')
    setShowPlaylistForm(false)
    openPlaylist(playlist.id)
  }

  function addTrackToPlaylist(playlistId, trackId) {
    setPlaylists((previous) =>
      previous.map((playlist) =>
        playlist.id === playlistId && !playlist.trackIds.includes(trackId)
          ? { ...playlist, trackIds: [...playlist.trackIds, trackId] }
          : playlist,
      ),
    )
  }

  function handleSeek(event) {
    const nextTime = Number(event.target.value)
    setProgress(nextTime)
    if (audioRef.current) audioRef.current.currentTime = nextTime
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={() => handleNavigation('Home')}>
          <span className="brand-mark"><span /><span /><span /><span /></span>
          <span>tune<span className="brand-wave">wave</span></span>
        </a>

        <nav className="primary-nav" aria-label="Main navigation">
          {[
            ['Home', 'home'],
            ['Search', 'search'],
            ['Your Library', 'library'],
          ].map(([label, icon]) => (
            <button
              className={`nav-link ${activeNav === label ? 'active' : ''}`}
              key={label}
              onClick={() => handleNavigation(label)}
            >
              <Icon name={icon} size={21} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-divider" />
        <div className="sidebar-caption">YOUR COLLECTION</div>
        <button className="collection-link" onClick={() => handleNavigation('Your Library')}>
          <span className="collection-art"><Icon name="heart" size={18} filled /></span>
          <span>Liked Songs</span>
          <span className="collection-count">{likedTracks.size}</span>
        </button>
        <div className="playlist-nav-heading">
          <span>PLAYLISTS</span>
          <button
            className="playlist-create-icon"
            onClick={() => {
              setShowPlaylistForm(true)
            }}
            aria-label="Create playlist"
            title="Create playlist"
          >
            <Icon name="plus" size={17} />
          </button>
        </div>
        <div className="sidebar-playlists">
          {playlists.map((playlist) => (
            <button
              className={`sidebar-playlist ${activePlaylistId === playlist.id ? 'active' : ''}`}
              key={playlist.id}
              onClick={() => openPlaylist(playlist.id)}
            >
              <span className="sidebar-playlist-art"><img src={allTracks.find((track) => playlist.trackIds.includes(track.id))?.cover ?? tracks[0].cover} alt="" /></span>
              <span>{playlist.name}</span>
            </button>
          ))}
        </div>
        <div className="sidebar-note">
          <div className="note-icon"><Icon name="headphones" size={20} /></div>
          <p>Your next favorite song is just around the corner.</p>
          <button onClick={() => handleNavigation('Search')}>Find your sound <span>↗</span></button>
        </div>
        <div className="sidebar-footer"><span className="online-dot" /> All sounds good</div>
      </aside>

      <header className="mobile-header">
        <a className="brand" href="#home" onClick={() => handleNavigation('Home')}>
          <span className="brand-mark"><span /><span /><span /><span /></span>
          <span>tune<span className="brand-wave">wave</span></span>
        </a>
        <span className="mobile-avatar">T</span>
      </header>

      <main className="main-content" id="home">
        <div className="topbar">
          <div className="history-buttons" aria-hidden="true">
            <button className="round-button"><span>‹</span></button>
            <button className="round-button"><span>›</span></button>
          </div>
          <label className={`search-box ${activeNav === 'Search' ? 'search-focused' : ''}`}>
            <Icon name="search" size={19} />
            <input
              ref={searchRef}
              type="search"
              placeholder="What do you want to hear?"
              value={query}
              onFocus={() => {
                setActiveNav('Search')
                setActivePlaylistId(null)
              }}
              onChange={changeSearch}
              aria-label="Search songs, artists, and albums"
            />
            {query && <button className="clear-search" onClick={() => setQuery('')} aria-label="Clear search">×</button>}
          </label>
          <button className="upgrade-button">Explore Premium <Icon name="arrow" size={14} /></button>
          <button className="profile-button" aria-label="Your profile">T</button>
        </div>

        <div className="content-inner">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> YOUR DAILY SOUNDTRACK</div>
              <h1>{activePlaylist ? activePlaylist.name : activeNav === 'Your Library' ? 'Your collection' : query ? 'Search results' : 'Find your frequency.'}</h1>
              <p className="welcome-copy">
                {activePlaylist
                  ? activePlaylist.description
                  : activeNav === 'Your Library'
                  ? 'The tracks you’ve saved, all in one place.'
                  : query
                    ? `A little something for “${query}”.`
                    : 'Fresh finds, familiar favorites, and everything in between.'}
              </p>
            </div>
            <div className="listening-pill"><span className="pulse-dot" /> MADE FOR YOUR MOMENT</div>
          </section>

          <section className="music-section">
            {!activePlaylist && activeNav !== 'Your Library' && (
              <div className="catalogue-filters">
                <div className="category-tabs" role="group" aria-label="Music categories">
                  {categories.map((category) => (
                    <button
                      className={`category-tab ${activeCategory === category ? 'active' : ''}`}
                      key={category}
                      onClick={() => chooseCategory(category)}
                      aria-pressed={activeCategory === category}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <div className="language-filters" role="group" aria-label="Filter songs by language">
                  <span>LANGUAGE</span>
                  {languages.map((language) => (
                    <button
                      className={`language-filter ${activeLanguage === language ? 'active' : ''}`}
                      key={language}
                      onClick={() => changeLanguage(language)}
                      aria-pressed={activeLanguage === language}
                    >
                      {language}
                    </button>
                  ))}
                </div>
                <div className="language-filters genre-filters" role="group" aria-label="Filter songs by genre">
                  <span>GENRE</span>
                  {availableGenres.map((genre) => (
                    <button
                      className={`language-filter ${activeGenre === genre ? 'active' : ''}`}
                      key={genre}
                      onClick={() => changeGenre(genre)}
                      aria-pressed={activeGenre === genre}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
                <p className="storefront-note">
                  Language filters select an Apple storefront. Apple doesn’t provide verified track-language metadata; search in the language’s own script for more precise matches.
                </p>
              </div>
            )}
            {catalogueLoading && (
              <div className="catalogue-status loading-status" role="status" aria-live="polite">
                <span className="loading-spinner" /> Searching the music catalogue…
              </div>
            )}
            {catalogueError && (
              <div className="catalogue-status error-status" role="alert">
                <span>{catalogueError}</span>
                <button onClick={() => setCatalogueRetry((attempt) => attempt + 1)}>Try again</button>
              </div>
            )}
            {query.trim() && !providerApiBase && (
              <div className="catalogue-status provider-hint" role="status">
                Searching Apple’s live music catalogue. Previews are short promotional clips; use the Apple Music badge to open the full listing.
              </div>
            )}
            <div className="section-heading">
              <div>
                <div className="section-kicker">{activePlaylist ? 'YOUR PLAYLIST' : activeNav === 'Your Library' ? 'THE GOOD STUFF' : query ? 'SEARCHING ALL SONGS' : 'CURATED FOR YOUR MOOD'}</div>
                <h2>{activePlaylist ? 'Playlist tracks' : activeNav === 'Your Library' ? 'Liked songs' : query ? 'Matching tracks' : activeCategory} <span className="heading-star">✳</span></h2>
              </div>
              <span className="track-total">{visibleTracks.length} TRACKS</span>
            </div>

            {visibleTracks.length ? (
              <div className="track-grid">
                {visibleTracks.map((track, index) => (
                  <article className={`track-card ${currentTrack.id === track.id ? 'playing-card' : ''}`} key={track.id}>
                    <button className="cover-button" onClick={() => selectTrack(track)} aria-label={track.audio ? `Play ${track.title}` : `Check audio availability for ${track.title}`}>
                      <img src={track.cover} alt={`${track.album} cover art`} />
                      <span className="cover-index">{String(index + 1).padStart(2, '0')}</span>
                      <span className={`cover-play ${!track.audio ? 'cover-unavailable' : ''}`}><Icon name={track.audio ? 'play' : 'close'} size={20} filled={Boolean(track.audio)} /></span>
                      <span className="cover-tint" style={{ '--cover-color': track.color }} />
                    </button>
                    <div className="track-info">
                      <div className="track-copy">
                        <button className="track-title" onClick={() => selectTrack(track)}>{track.title}</button>
                        <span>{track.artist}</span>
                      </div>
                      <button
                        className={`like-button ${likedTracks.has(track.id) ? 'liked' : ''}`}
                        onClick={() => toggleLike(track.id)}
                        aria-label={likedTracks.has(track.id) ? `Unlike ${track.title}` : `Like ${track.title}`}
                        aria-pressed={likedTracks.has(track.id)}
                      >
                        <Icon name="heart" size={18} filled={likedTracks.has(track.id)} />
                      </button>
                      {activePlaylist && (
                        <button
                          className="like-button playlist-remove"
                          onClick={() => setPlaylists((previous) => previous.map((playlist) =>
                            playlist.id === activePlaylist.id
                              ? { ...playlist, trackIds: playlist.trackIds.filter((id) => id !== track.id) }
                              : playlist,
                          ))}
                          aria-label={`Remove ${track.title} from ${activePlaylist.name}`}
                          title="Remove from playlist"
                        >
                          <Icon name="close" size={16} />
                        </button>
                      )}
                    </div>
                    <div className="track-meta"><span>{track.album}</span></div>
                    <div className="track-labels">
                      <span>{track.language} · {track.genre}</span>
                      <span className={track.audio ? 'audio-label available' : 'audio-label unavailable'}>{track.audio ? track.audioSource ?? sampleAudioSource : 'PREVIEW UNAVAILABLE'}</span>
                    </div>
                        {track.storeUrl && (
                          <a
                            className="apple-store-badge"
                            href={track.storeUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open ${track.title} in Apple Music`}
                          >
                            <img src={appleBadgeUrl} alt="Listen on Apple Music" loading="lazy" />
                          </a>
                        )}
                      </article>
                ))}
              </div>
            ) : catalogueLoading ? (
              <div className="empty-state loading-empty" role="status" aria-live="polite">
                <span className="loading-spinner" />
                <strong>Finding your next track…</strong>
                <span>Searching the connected music catalogue.</span>
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon"><Icon name={activePlaylist ? 'library' : activeNav === 'Your Library' ? 'heart' : 'search'} size={22} /></span>
                <strong>{activePlaylist ? 'This playlist is ready for a first track.' : activeNav === 'Your Library' ? 'Your collection is waiting.' : 'No tracks found just yet.'}</strong>
                <span>{activePlaylist ? 'Pick something from the suggestions below.' : activeNav === 'Your Library' ? 'Tap a heart to save songs you love.' : query.trim() && providerApiBase ? 'Try another title, artist, album, or filter.' : 'Try another title, artist, album, or language.'}</span>
              </div>
            )}
            {!activePlaylist && hasMoreResults && resultLimit < 200 && (
              <button
                className="load-more-button"
                onClick={() => setResultLimit((limit) => Math.min(limit + 25, 200))}
                disabled={catalogueLoading}
              >
                {catalogueLoading ? <><span className="loading-spinner" /> Loading more</> : 'Load more results'}
              </button>
            )}
            {activePlaylist && (
              <div className="playlist-add-section">
                <div className="playlist-add-heading">
                  <div><div className="section-kicker">MAKE IT YOURS</div><h3>Add to this playlist</h3></div>
                  <span>{allTracks.filter((track) => !activePlaylist.trackIds.includes(track.id)).length} SUGGESTIONS</span>
                </div>
                <div className="playlist-suggestions">
                  {allTracks.filter((track) => !activePlaylist.trackIds.includes(track.id)).map((track) => (
                    <div className="suggestion-row" key={track.id}>
                      <img src={track.cover} alt="" />
                      <div className="suggestion-copy"><strong>{track.title}</strong><span>{track.artist}</span></div>
                      <button className="suggestion-add" onClick={() => addTrackToPlaylist(activePlaylist.id, track.id)} aria-label={`Add ${track.title} to ${activePlaylist.name}`}><Icon name="plus" size={17} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {!activePlaylist && activeNav !== 'Your Library' && !query && (
            <section className="music-section artist-section">
              <div className="section-heading">
                <div>
                  <div className="section-kicker">THE VOICES BEHIND THE VIBE</div>
                  <h2>Popular artists <span className="heading-star">✳</span></h2>
                </div>
                <button className="text-link" onClick={() => handleNavigation('Search')}>Discover more <Icon name="arrow" size={14} /></button>
              </div>
              <div className="artist-grid">
                {artists.map((artist, index) => (
                  <button
                    className="artist-card"
                    key={artist.name}
                    onClick={() => {
                      setQuery(artist.name)
                      setActiveNav('Search')
                    }}
                  >
                    <span className="artist-image-wrap">
                      <img src={artist.image} alt="" />
                      <span className="artist-number">0{index + 1}</span>
                    </span>
                    <span className="artist-name">{artist.name}</span>
                    <span className="artist-genre">{artist.genre}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
          {!activePlaylist && activeNav !== 'Your Library' && !query && (
            <section className="music-section">
              <div className="section-heading">
                <div><div className="section-kicker">PICK UP WHERE YOU LEFT OFF</div><h2>Recently played <span className="heading-star">✳</span></h2></div>
              </div>
              <div className="recent-grid">
                {recentlyPlayed.slice(0, 4).map((track) => (
                  <button className="recent-card" key={track.id} onClick={() => selectTrack(track)}>
                    <img src={track.cover} alt="" />
                    <span className="recent-copy"><strong>{track.title}</strong><span>{track.artist}</span></span>
                    <span className="recent-play"><Icon name="play" size={15} filled /></span>
                  </button>
                ))}
              </div>
            </section>
          )}
          {!activePlaylist && activeNav !== 'Your Library' && !query && (
            <section className="music-section playlist-section">
              <div className="section-heading">
                <div><div className="section-kicker">A COLLECTION FOR EVERY MOOD</div><h2>Your playlists <span className="heading-star">✳</span></h2></div>
                <button className="text-link" onClick={() => setShowPlaylistForm(true)}><Icon name="plus" size={15} /> New playlist</button>
              </div>
              <div className="playlist-grid">
                {playlists.map((playlist) => {
                  const coverTrack = tracks.find((track) => playlist.trackIds.includes(track.id)) ?? tracks[0]
                  return (
                    <button className="playlist-card" key={playlist.id} onClick={() => openPlaylist(playlist.id)}>
                      <span className="playlist-cover"><img src={coverTrack.cover} alt="" /><span className="playlist-cover-play"><Icon name="play" size={18} filled /></span></span>
                      <span className="playlist-card-copy"><strong>{playlist.name}</strong><span>{playlist.trackIds.length} {playlist.trackIds.length === 1 ? 'track' : 'tracks'} · {playlist.description}</span></span>
                    </button>
                  )
                })}
                <button className="playlist-new-card" onClick={() => setShowPlaylistForm(true)}><span className="playlist-new-icon"><Icon name="plus" size={22} /></span><strong>Create a playlist</strong><span>Put your mood on repeat.</span></button>
              </div>
            </section>
          )}
          <footer className="page-footer"><span>GOOD MUSIC. GOOD MOOD.</span><span><a href="https://www.soundhelix.com/audio-examples" target="_blank" rel="noreferrer">AUDIO SAMPLES: SOUNDHELIX</a> <span className="footer-dot">·</span> TUNEWAVE</span></footer>
        </div>
      </main>

      <section className="player" aria-label="Music player">
        <audio
          ref={audioRef}
          src={currentTrack.audio}
          preload="metadata"
          onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onEnded={() => stepTrack(1)}
          onError={() => {
            setIsPlaying(false)
            setPlaybackNotice(`Audio could not be loaded for “${currentTrack.title}”. Try another track or check your connection.`)
          }}
        />
        <div className="now-playing">
          <img className="player-cover" src={currentTrack.cover} alt="" />
          <div className="now-playing-copy"><strong>{currentTrack.title}</strong><span>{currentTrack.artist}</span></div>
          <button
            className={`player-like ${likedTracks.has(currentTrack.id) ? 'liked' : ''}`}
            onClick={() => toggleLike(currentTrack.id)}
            aria-label={likedTracks.has(currentTrack.id) ? 'Unlike current song' : 'Like current song'}
            aria-pressed={likedTracks.has(currentTrack.id)}
          >
            <Icon name="heart" size={18} filled={likedTracks.has(currentTrack.id)} />
          </button>
        </div>

        <div className="playback">
          <div className="playback-buttons">
            <button className="subtle-control shuffle-control" aria-label="Shuffle"><Icon name="shuffle" size={17} /></button>
            <button className="transport-control" onClick={() => stepTrack(-1)} aria-label="Previous track"><Icon name="previous" size={18} filled /></button>
            <button className="play-toggle" onClick={() => setIsPlaying((playing) => !playing)} aria-label={isPlaying ? 'Pause' : 'Play'}>
              <Icon name={isPlaying ? 'pause' : 'play'} size={19} filled />
            </button>
            <button className="transport-control" onClick={() => stepTrack(1)} aria-label="Next track"><Icon name="next" size={18} filled /></button>
            <button className="subtle-control repeat-control" aria-label="Repeat"><Icon name="repeat" size={17} /></button>
          </div>
          <div className="progress-row">
            <span className="time-label">{formatTime(progress)}</span>
            <input
              className="range-input progress-input"
              type="range"
              min="0"
              max={duration || 100}
              value={Math.min(progress, duration || 100)}
              onChange={handleSeek}
              aria-label="Song progress"
              style={{ '--range-progress': `${duration ? (progress / duration) * 100 : 0}%` }}
            />
            <span className="time-label">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="player-tools">
          <button className="subtle-control queue-control" aria-label="More options"><Icon name="more" size={19} /></button>
          <div className="volume-control"><Icon name="volume" size={19} /><input
            className="range-input volume-input"
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            aria-label="Volume"
            style={{ '--range-progress': `${volume}%` }}
          /></div>
        </div>
      </section>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {[
          ['Home', 'home'],
          ['Search', 'search'],
          ['Your Library', 'library'],
        ].map(([label, icon]) => (
          <button className={activeNav === label ? 'active' : ''} key={label} onClick={() => handleNavigation(label)}>
            <Icon name={icon} size={20} /><span>{label === 'Your Library' ? 'Library' : label}</span>
          </button>
        ))}
      </nav>
      {playbackNotice && (
        <div className="playback-notice" role="status">
          <span>{playbackNotice}</span>
          <button onClick={() => setPlaybackNotice('')} aria-label="Dismiss message"><Icon name="close" size={16} /></button>
        </div>
      )}
      {showPlaylistForm && (
        <div className="modal-backdrop" onClick={() => setShowPlaylistForm(false)}>
          <form className="playlist-modal" onSubmit={createPlaylist} onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setShowPlaylistForm(false)} aria-label="Close"><Icon name="close" size={19} /></button>
            <span className="modal-kicker">MAKE IT YOURS</span>
            <h2>Create a playlist</h2>
            <p>Give your next soundtrack a name. You can add songs right after.</p>
            <label className="playlist-name-label" htmlFor="playlist-name">Playlist name</label>
            <input
              ref={playlistInputRef}
              id="playlist-name"
              className="playlist-name-input"
              value={playlistName}
              onChange={(event) => setPlaylistName(event.target.value)}
              placeholder="e.g. Sunday morning"
              maxLength={40}
              required
            />
            <div className="modal-actions">
              <button className="modal-cancel" type="button" onClick={() => setShowPlaylistForm(false)}>Cancel</button>
              <button className="modal-submit" type="submit">Create playlist</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default App
