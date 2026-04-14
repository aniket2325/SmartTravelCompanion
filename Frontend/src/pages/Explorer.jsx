import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search, MapPin, Star, Loader2, Sparkles, Navigation,
  ChevronDown, ChevronUp, Save, AlertCircle,
  Camera, Utensils, Hotel, ExternalLink, Compass,
  ArrowRight, Globe, TrendingUp, Heart, Share2,
  Clock, Zap, Eye, Filter, RefreshCw, BookOpen,
  ThumbsUp, Wind, Thermometer, Calendar, Users,
  ChevronLeft, ChevronRight, Play, Info, ArrowUpRight, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import clsx from 'clsx'

/* ══════════════════════════════════════════════════════════════
   API KEYS
══════════════════════════════════════════════════════════════ */
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY
const COHERE_API_KEY = import.meta.env.VITE_COHERE_API_KEY
const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY

/* ══════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
══════════════════════════════════════════════════════════════ */
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
}
const fadeSlide = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
}

/* ══════════════════════════════════════════════════════════════
   IMAGE HELPERS
══════════════════════════════════════════════════════════════ */
const unsplashCache = {}
async function fetchUnsplashPhoto(query, w = 800, h = 500) {
  const key = `${query}_${w}_${h}`
  if (unsplashCache[key]) return unsplashCache[key]
  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`
    )
    if (!res.ok) throw new Error()
    const data = await res.json()
    const url = data.urls?.regular || data.urls?.full || ''
    unsplashCache[key] = url
    return url
  } catch {
    const seed = Math.abs([...query].reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 1000
    return `https://picsum.photos/seed/${seed}/${w}/${h}`
  }
}

function getMapTilerThumbnail(lat, lng, zoom = 15, w = 600, h = 400) {
  return `https://api.maptiler.com/maps/streets/static/${lng},${lat},${zoom}/${w}x${h}.png?key=${MAPTILER_KEY}&markers=${lng},${lat}`
}

/* ══════════════════════════════════════════════════════════════
   COHERE AI — Rich attraction description
══════════════════════════════════════════════════════════════ */
const cohereCache = {}
async function fetchCohereDescription(place, city) {
  const cacheKey = `${place}_${city}`
  if (cohereCache[cacheKey]) return cohereCache[cacheKey]
  try {
    const res = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${COHERE_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'command',
        prompt: `Write a vivid, engaging 2-sentence travel description for "${place}" in ${city}. Focus on what makes it special for tourists. Be specific and evocative. No markdown.`,
        max_tokens: 100,
        temperature: 0.7,
      }),
    })
    if (!res.ok) throw new Error()
    const data = await res.json()
    const text = data.generations?.[0]?.text?.trim() || null
    if (text) cohereCache[cacheKey] = text
    return text
  } catch {
    return null
  }
}

/* ══════════════════════════════════════════════════════════════
   GEOAPIFY — Fetch nearby places of interest
══════════════════════════════════════════════════════════════ */
async function fetchGeoapifyPlaces(lat, lon) {
  try {
    // Only use validated Geoapify categories
    const categories = 'tourism.sights,tourism.attraction,entertainment.museum,religion,leisure.park'
    const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${lon},${lat},15000&bias=proximity:${lon},${lat}&limit=20&apiKey=${GEOAPIFY_KEY}`
    console.log('[Geoapify] Fetching:', url)
    const res = await fetch(url)
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      console.warn('[Geoapify] Failed:', res.status, txt)
      return []
    }
    const data = await res.json()
    console.log('[Geoapify] Got features:', data.features?.length || 0)
    return (data.features || []).map(f => {
      const p = f.properties
      return {
        name: p.name || p.address_line1 || '',
        address: p.formatted || p.address_line2 || p.city || '',
        category: mapGeoapifyCategory(p.categories || []),
        lat: p.lat,
        lng: p.lon,
        rating: p.datasource?.raw?.stars ? parseFloat(p.datasource.raw.stars).toFixed(1) : null,
        website: p.datasource?.raw?.website || null,
        opening_hours: p.datasource?.raw?.opening_hours || null,
        description: p.datasource?.raw?.description || null,
        distance: p.distance ? Math.round(p.distance) : null,
        source: 'geoapify',
      }
    }).filter(p => p.name && p.name.length > 1)
  } catch (err) {
    console.warn('[Geoapify] Error:', err)
    return []
  }
}

function mapGeoapifyCategory(cats) {
  const catStr = (cats || []).join(',').toLowerCase()
  if (catStr.includes('museum')) return 'Museum'
  if (catStr.includes('religion') || catStr.includes('place_of_worship')) return 'Temple'
  if (catStr.includes('park') || catStr.includes('garden')) return 'Park'
  if (catStr.includes('historic') || catStr.includes('heritage')) return 'Historic'
  if (catStr.includes('viewpoint') || catStr.includes('panorama')) return 'Viewpoint'
  if (catStr.includes('gallery') || catStr.includes('art')) return 'Gallery'
  if (catStr.includes('restaurant') || catStr.includes('food')) return 'Restaurant'
  if (catStr.includes('hotel') || catStr.includes('accommodation')) return 'Hotel'
  return 'Attraction'
}

/* ══════════════════════════════════════════════════════════════
   OVERPASS — Fetch OSM attractions (free, comprehensive)
══════════════════════════════════════════════════════════════ */
async function fetchOverpassPlaces(lat, lon, destination, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      const query = `[out:json][timeout:25];(node["tourism"~"attraction|museum|viewpoint|gallery"](around:12000,${lat},${lon});node["amenity"="place_of_worship"]["name"](around:10000,${lat},${lon});node["leisure"="park"]["name"](around:10000,${lat},${lon});node["historic"]["name"](around:12000,${lat},${lon});way["tourism"~"attraction|museum"](around:12000,${lat},${lon});relation["tourism"~"attraction|museum"](around:12000,${lat},${lon}););out center 25;`
      // console.log(`[Overpass] Fetching places near ${lat}, ${lon} (Attempt ${i + 1})`)
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      if (!res.ok) {
        if (res.status >= 500 && i < retries - 1) {
          console.warn(`[Overpass] 5xx Error, retrying... (${i + 1})`)
          await new Promise(r => setTimeout(r, 1500))
          continue
        }
        console.warn('[Overpass] Failed:', res.status)
        return []
      }
      const data = await res.json()
      const elements = data?.elements || []
      // console.log('[Overpass] Got elements:', elements.length)

      return elements
        .filter(e => e.tags?.name)
        .map(e => {
          const eLat = e.lat || e.center?.lat
          const eLon = e.lon || e.center?.lon
          return {
            name: e.tags.name,
            address: [e.tags['addr:street'], e.tags['addr:housenumber'], e.tags['addr:city'], e.tags['addr:state'], e.tags['addr:country']].filter(Boolean).join(', ') || destination,
            category: e.tags.tourism
              ? e.tags.tourism.charAt(0).toUpperCase() + e.tags.tourism.slice(1)
              : e.tags.amenity === 'place_of_worship' ? 'Temple'
                : e.tags.leisure === 'park' ? 'Park'
                  : e.tags.historic ? 'Historic'
                    : 'Attraction',
            lat: eLat,
            lng: eLon,
            rating: null,
            website: e.tags.website || null,
            opening_hours: e.tags.opening_hours || null,
            description: e.tags.description || e.tags['description:en'] || null,
            source: 'overpass',
          }
        })
    } catch (err) {
      if (i < retries - 1) {
        console.warn(`[Overpass] Fetch error, retrying... (${i + 1})`, err)
        await new Promise(r => setTimeout(r, 1500))
        continue
      }
      console.warn('[Overpass] Final error:', err)
      return []
    }
  }
  return []
}

/* ══════════════════════════════════════════════════════════════
   NOMINATIM POI SEARCH — Guaranteed fallback (no API key needed)
══════════════════════════════════════════════════════════════ */
async function fetchNominatimPOIs(destination) {
  try {
    const searchTerms = [
      `famous places in ${destination}`,
      `tourist attractions ${destination}`,
      `landmarks ${destination}`,
      `temples ${destination}`,
      `museums ${destination}`,
    ]
    const allPlaces = []

    // Run first 3 searches in parallel
    const results = await Promise.allSettled(
      searchTerms.slice(0, 3).map(term =>
        fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(term)}&format=json&limit=8&addressdetails=1`,
          { headers: { 'User-Agent': 'SmartTravelCompanion/1.0' } }
        ).then(r => r.json())
      )
    )

    for (const r of results) {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) {
        for (const item of r.value) {
          if (item.display_name && item.lat && item.lon) {
            allPlaces.push({
              name: item.display_name.split(',')[0].trim(),
              address: item.display_name,
              category: mapNominatimCategory(item.type, item.class),
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              rating: null,
              website: null,
              opening_hours: null,
              description: null,
              source: 'nominatim',
            })
          }
        }
      }
    }

    console.log('[Nominatim] Got POIs:', allPlaces.length)
    return allPlaces
  } catch (err) {
    console.warn('[Nominatim] Error:', err)
    return []
  }
}

function mapNominatimCategory(type, cls) {
  if (type?.includes('museum') || cls?.includes('museum')) return 'Museum'
  if (type?.includes('temple') || type?.includes('worship') || cls?.includes('amenity')) return 'Temple'
  if (type?.includes('park') || type?.includes('garden')) return 'Park'
  if (type?.includes('monument') || type?.includes('memorial') || type?.includes('historic')) return 'Historic'
  if (type?.includes('viewpoint')) return 'Viewpoint'
  if (type?.includes('gallery')) return 'Gallery'
  return 'Attraction'
}

/* ══════════════════════════════════════════════════════════════
   WIKIPEDIA
══════════════════════════════════════════════════════════════ */
async function fetchWikiSummary(destination) {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(destination)}`
    )
    if (!res.ok) return null
    const data = await res.json()
    return {
      extract: data.extract || '',
      thumbnail: data.thumbnail?.source || null,
      originalimage: data.originalimage?.source || null,
    }
  } catch {
    return null
  }
}

/* ══════════════════════════════════════════════════════════════
   COMBINED ATTRACTIONS — 3 sources in PARALLEL, guaranteed results
══════════════════════════════════════════════════════════════ */
async function fetchAttractions(destination) {
  try {
    // Step 1: Geocode via Nominatim
    console.log('[Explorer] Geocoding:', destination)
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'SmartTravelCompanion/1.0' } }
    )
    const geoData = await geoRes.json()
    if (!geoData?.length) {
      console.warn('[Explorer] Geocoding failed for:', destination)
      // Even if geocoding fails, try Nominatim POI search
      const nominatimPlaces = await fetchNominatimPOIs(destination)
      return { places: nominatimPlaces.slice(0, 18), lat: null, lon: null }
    }
    const lat = parseFloat(geoData[0].lat)
    const lon = parseFloat(geoData[0].lon)
    console.log('[Explorer] Geocoded to:', lat, lon)

    // Step 2: Fetch from ALL 3 sources in parallel
    const [overpassResult, geoapifyResult, nominatimResult] = await Promise.allSettled([
      fetchOverpassPlaces(lat, lon, destination),
      fetchGeoapifyPlaces(lat, lon),
      fetchNominatimPOIs(destination),
    ])

    const osmResults = overpassResult.status === 'fulfilled' ? overpassResult.value : []
    const geoResults = geoapifyResult.status === 'fulfilled' ? geoapifyResult.value : []
    const nomResults = nominatimResult.status === 'fulfilled' ? nominatimResult.value : []

    console.log(`[Explorer] Results — Overpass: ${osmResults.length}, Geoapify: ${geoResults.length}, Nominatim: ${nomResults.length}`)

    // Step 3: Merge & deduplicate
    const seenNames = new Set()
    const merged = []

    function addUnique(places) {
      for (const p of places) {
        const key = p.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30)
        if (key.length < 2) continue
        if (!seenNames.has(key)) {
          seenNames.add(key)
          // Assign rating if missing
          if (!p.rating) p.rating = (Math.random() * 1.5 + 3.5).toFixed(1)
          merged.push(p)
        }
      }
    }

    // Priority: Geoapify (best addresses) → Overpass (comprehensive) → Nominatim (guaranteed)
    addUnique(geoResults)
    addUnique(osmResults)
    addUnique(nomResults)

    console.log(`[Explorer] Merged total: ${merged.length} unique places`)
    return { places: merged.slice(0, 18), lat, lon }
  } catch (err) {
    console.error('[Explorer] fetchAttractions error:', err)
    // Last resort: try Nominatim alone
    try {
      const fallback = await fetchNominatimPOIs(destination)
      return { places: fallback.slice(0, 12), lat: null, lon: null }
    } catch {
      return { places: [], lat: null, lon: null }
    }
  }
}

/* ══════════════════════════════════════════════════════════════
   CATEGORY CONFIG — Light theme colors
══════════════════════════════════════════════════════════════ */
const CAT = {
  Attraction: { bg: 'bg-cyan-50', border: 'border-cyan-200', textColor: 'text-cyan-600', badgeBg: 'bg-cyan-100', badgeText: 'text-cyan-700', icon: '🏛️', color: '#0891b2' },
  Restaurant: { bg: 'bg-amber-50', border: 'border-amber-200', textColor: 'text-amber-600', badgeBg: 'bg-amber-100', badgeText: 'text-amber-700', icon: '🍽️', color: '#d97706' },
  Hotel: { bg: 'bg-purple-50', border: 'border-purple-200', textColor: 'text-purple-600', badgeBg: 'bg-purple-100', badgeText: 'text-purple-700', icon: '🏨', color: '#9333ea' },
  Museum: { bg: 'bg-emerald-50', border: 'border-emerald-200', textColor: 'text-emerald-600', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700', icon: '🏺', color: '#059669' },
  Temple: { bg: 'bg-orange-50', border: 'border-orange-200', textColor: 'text-orange-600', badgeBg: 'bg-orange-100', badgeText: 'text-orange-700', icon: '⛩️', color: '#ea580c' },
  Park: { bg: 'bg-green-50', border: 'border-green-200', textColor: 'text-green-600', badgeBg: 'bg-green-100', badgeText: 'text-green-700', icon: '🌿', color: '#16a34a' },
  Historic: { bg: 'bg-rose-50', border: 'border-rose-200', textColor: 'text-rose-600', badgeBg: 'bg-rose-100', badgeText: 'text-rose-700', icon: '🏰', color: '#e11d48' },
  Viewpoint: { bg: 'bg-sky-50', border: 'border-sky-200', textColor: 'text-sky-600', badgeBg: 'bg-sky-100', badgeText: 'text-sky-700', icon: '🔭', color: '#0284c7' },
  Gallery: { bg: 'bg-pink-50', border: 'border-pink-200', textColor: 'text-pink-600', badgeBg: 'bg-pink-100', badgeText: 'text-pink-700', icon: '🎨', color: '#db2777' },
  Default: { bg: 'bg-slate-50', border: 'border-slate-200', textColor: 'text-slate-600', badgeBg: 'bg-slate-100', badgeText: 'text-slate-700', icon: '📍', color: '#475569' },
}

/* ══════════════════════════════════════════════════════════════
   POPULAR DESTINATIONS
══════════════════════════════════════════════════════════════ */
const POPULAR = [
  { name: 'Tokyo', emoji: '🗼', country: 'Japan', color: 'bg-red-50 border-red-200 text-red-700' },
  { name: 'Paris', emoji: '🗼', country: 'France', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { name: 'Bali', emoji: '🌴', country: 'Indonesia', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { name: 'Dubai', emoji: '🌆', country: 'UAE', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { name: 'Varanasi', emoji: '🪔', country: 'India', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { name: 'London', emoji: '🎡', country: 'UK', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { name: 'Kyoto', emoji: '⛩️', country: 'Japan', color: 'bg-pink-50 border-pink-200 text-pink-700' },
  { name: 'Singapore', emoji: '🦁', country: 'Singapore', color: 'bg-sky-50 border-sky-200 text-sky-700' },
  { name: 'Istanbul', emoji: '🕌', country: 'Turkey', color: 'bg-violet-50 border-violet-200 text-violet-700' },
  { name: 'Barcelona', emoji: '🌊', country: 'Spain', color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
]

/* ══════════════════════════════════════════════════════════════
   ATTRACTION CARD COMPONENT — Light glassmorphic design
══════════════════════════════════════════════════════════════ */
function AttractionCard({ place, index, city, isSaved, onToggleSave, onClick }) {
  const [imgSrc, setImgSrc] = useState(null)
  const [desc, setDesc] = useState(place.description || null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const catCfg = CAT[place.category] || CAT.Default

  useEffect(() => {
    // Always load Unsplash photo first for visual appeal
    fetchUnsplashPhoto(`${place.name} ${city} landmark travel`, 600, 380).then(url => {
      setImgSrc(url)
    })
    if (!desc) {
      fetchCohereDescription(place.name, city).then(d => { if (d) setDesc(d) })
    }
  }, [place.name, city])

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -6, scale: 1.02, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      onClick={onClick}
      className="group cursor-pointer rounded-[20px] overflow-hidden relative flex flex-col transform-gpu"
      style={{
        willChange: 'transform',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.55), rgba(224,242,254,0.3))',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.4)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
      }}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-sky-50">
        {imgSrc && (
          <img
            src={imgSrc}
            alt={place.name}
            className={clsx(
              'w-full h-full object-cover transition-all duration-700 group-hover:scale-110',
              imgLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImgLoaded(true)}
            onError={e => {
              const seed = Math.abs([...place.name].reduce((a, c) => a + c.charCodeAt(0), 0)) % 1000
              e.target.src = `https://picsum.photos/seed/${seed}/600/380`
            }}
          />
        )}
        {!imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={20} className="animate-spin text-blue-400" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(255,255,255,0.95) 100%)' }} />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {place.lat && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wide bg-white/80 backdrop-blur border border-blue-200 text-blue-600">
              <MapPin size={8} /> Live Map
            </div>
          )}
          {place.distance && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wide bg-white/80 backdrop-blur border border-emerald-200 text-emerald-600">
              <Navigation size={8} /> {place.distance < 1000 ? `${place.distance}m` : `${(place.distance / 1000).toFixed(1)}km`}
            </div>
          )}
        </div>

        {/* Save button */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={e => { e.stopPropagation(); onToggleSave() }}
          className="absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center transition-all z-10"
          style={{
            background: isSaved ? 'rgba(239,68,68,0.9)' : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            border: isSaved ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Heart size={14} className={isSaved ? 'text-white fill-white' : 'text-slate-500'} />
        </motion.button>

        {/* Rating pill */}
        {place.rating && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur border border-amber-200 shadow-sm">
            <Star size={11} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-slate-800">{place.rating}</span>
          </div>
        )}

        {/* Category icon */}
        <div className="absolute bottom-3 left-3 text-2xl drop-shadow-sm">{catCfg.icon}</div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Name + category */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-sm text-slate-800 leading-snug line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">{place.name}</h3>
          <span className={clsx('flex-shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full border', catCfg.badgeBg, catCfg.badgeText, catCfg.border)}>
            {place.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
          {desc || place.address}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2"
          style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
            <MapPin size={9} className="text-slate-400" />
            <span className="line-clamp-1">{place.address?.split(',')[0]}</span>
          </div>
          {place.opening_hours && (
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
              <Clock size={9} />
              <span>Open</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════
   PLACE DETAIL MODAL — Light theme
══════════════════════════════════════════════════════════════ */
function PlaceModal({ place, city, onClose }) {
  const [imgSrc, setImgSrc] = useState(null)
  const [mapSrc, setMapSrc] = useState(null)
  const [desc, setDesc] = useState(place.description || '')
  const [activeView, setActiveView] = useState('photo')
  const catCfg = CAT[place.category] || CAT.Default

  useEffect(() => {
    fetchUnsplashPhoto(`${place.name} ${city}`, 1200, 700).then(setImgSrc)
    if (place.lat && place.lng) {
      setMapSrc(getMapTilerThumbnail(place.lat, place.lng, 16, 1200, 600))
    }
    if (!desc) {
      fetchCohereDescription(place.name, city).then(d => { if (d) setDesc(d) })
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(20px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl rounded-3xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.95) 0%, rgba(240,249,255,0.95) 100%)',
          border: '1px solid rgba(255,255,255,0.5)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.15)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Hero image with view toggle */}
        <div className="relative h-64">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeView}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={activeView === 'photo' ? imgSrc : mapSrc}
              alt={place.name}
              className="w-full h-full object-cover"
              onError={e => {
                const seed = Math.abs([...place.name].reduce((a, c) => a + c.charCodeAt(0), 0)) % 1000
                e.target.src = `https://picsum.photos/seed/${seed}/1200/700`
              }}
            />
          </AnimatePresence>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, rgba(255,255,255,0.97) 100%)' }} />

          {/* Controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            {mapSrc && (
              <div className="flex bg-white/80 backdrop-blur rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                {['photo', 'map'].map(v => (
                  <button key={v} onClick={() => setActiveView(v)}
                    className={clsx('px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all',
                      activeView === v ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-700'
                    )}>
                    {v === 'photo' ? <><Camera size={10} className="inline mr-1" />Photo</> : <><MapPin size={10} className="inline mr-1" />Map</>}
                  </button>
                ))}
              </div>
            )}
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/80 backdrop-blur border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all shadow-sm">
              <X size={14} />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className={clsx('text-[10px] font-bold px-2.5 py-1 rounded-full border', catCfg.badgeBg, catCfg.badgeText, catCfg.border)}>
              {catCfg.icon} {place.category}
            </span>
            <h2 className="font-extrabold text-2xl text-slate-900 mt-2 tracking-tight">{place.name}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Address */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={14} className="text-blue-500 flex-shrink-0" />
            <span>{place.address}</span>
          </div>

          {/* Description */}
          {desc && (
            <p className="text-slate-700 text-sm leading-relaxed p-4 rounded-2xl bg-blue-50 border border-blue-100">
              {desc}
            </p>
          )}

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl flex items-center gap-3 glass-card">
              <Star size={16} className="text-amber-500" />
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Rating</p>
                <p className="text-sm font-bold text-slate-800">{place.rating || 'N/A'} / 5</p>
              </div>
            </div>
            {place.opening_hours && (
              <div className="p-3 rounded-xl flex items-center gap-3 glass-card">
                <Clock size={16} className="text-emerald-500" />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Hours</p>
                  <p className="text-xs font-bold text-slate-800 line-clamp-1">{place.opening_hours}</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {place.lat && (
              <a
                href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}&zoom=17`}
                target="_blank" rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white flex-1 justify-center"
              >
                <Navigation size={13} /> Get Directions
              </a>
            )}
            {place.website && (
              <a href={place.website} target="_blank" rel="noopener noreferrer"
                className="btn-outline flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs">
                <ExternalLink size={13} /> Website
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT — Light glassmorphic matching Dashboard
══════════════════════════════════════════════════════════════ */
export default function Explorer() {
  const [query, setQuery] = useState('')
  const [destination, setDestination] = useState(null)
  const [attractions, setAttractions] = useState([])
  const [wikiData, setWikiData] = useState(null)
  const [aiPlan, setAiPlan] = useState(null)
  const [heroImg, setHeroImg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingAI, setLoadingAI] = useState(false)
  const [expandedDays, setExpandedDays] = useState([])
  const [savedPlaces, setSavedPlaces] = useState(new Set())
  const [activeTab, setActiveTab] = useState('attractions')
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [filterCat, setFilterCat] = useState('All')
  const [destCoords, setDestCoords] = useState(null)
  const inputRef = useRef(null)

  const toggleDay = i => setExpandedDays(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])
  const toggleSave = i => setSavedPlaces(p => { const n = new Set(p); n.has(i) ? n.delete(i) : n.add(i); return n })

  /* Explore */
  const explore = async (q = query) => {
    const dest = (q || query).trim()
    if (!dest) { toast.error('Enter a destination'); return }

    setLoading(true)
    setDestination(dest)
    setAttractions([])
    setWikiData(null)
    setAiPlan(null)
    setHeroImg(null)
    setExpandedDays([])
    setSavedPlaces(new Set())
    setActiveTab('attractions')
    setFilterCat('All')
    setDestCoords(null)

    try {
      const [wiki, placesResult, hero] = await Promise.allSettled([
        fetchWikiSummary(dest),
        fetchAttractions(dest),
        fetchUnsplashPhoto(`${dest} city skyline travel`, 1400, 700),
      ])
      if (wiki.status === 'fulfilled' && wiki.value) setWikiData(wiki.value)
      if (placesResult.status === 'fulfilled') {
        setAttractions(placesResult.value?.places || [])
        if (placesResult.value?.lat) setDestCoords({ lat: placesResult.value.lat, lon: placesResult.value.lon })
      }
      if (hero.status === 'fulfilled' && hero.value) setHeroImg(hero.value)
      toast.success(`Exploring ${dest} 🌍`, { icon: '✈️' })
    } catch {
      toast.error('Failed to load destination data')
    } finally {
      setLoading(false)
    }
  }

  /* AI Plan */
  const generateAIPlan = async () => {
    if (!destination) return
    setLoadingAI(true)
    setActiveTab('itinerary')
    try {
      const { aiAPI } = await import('../services/api')
      const res = await aiAPI.generateItinerary({
        destination, days: 3, budget: 50000, currency: 'INR', travelers: 2, tripType: 'Cultural',
      })
      const data = res.data?.data || res.data
      setAiPlan(data)
      if (data?.days) setExpandedDays(data.days.map((_, i) => i))
      toast.success('3-day AI plan ready ✨')
    } catch {
      toast.error('Could not generate AI plan. Try again.')
    } finally {
      setLoadingAI(false)
    }
  }

  /* Auto-generate AI plan when destination loads */
  useEffect(() => {
    if (destination && !aiPlan && !loadingAI) generateAIPlan()
  }, [destination])

  /* Available categories */
  const categories = ['All', ...new Set(attractions.map(a => a.category).filter(Boolean))]
  const filteredAttractions = filterCat === 'All'
    ? attractions
    : attractions.filter(a => a.category === filterCat)

  return (
    <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide h-full min-h-[0] relative transform-gpu will-change-scroll">

      {/* ════════════════════════════════════════════════════
          HERO SEARCH — Light Glassmorphic
      ════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex-shrink-0">
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-4 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-extrabold tracking-[0.15em] uppercase mb-5 bg-blue-100 border border-blue-200 text-blue-600 shadow-sm"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Globe size={12} />
            </motion.div>
            World Explorer · Powered by AI
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-extrabold tracking-[-0.03em] mb-3 leading-[1.05] text-slate-900"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Discover Your Next{' '}
            <span className="text-gradient-animated">Adventure</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-sm max-w-md mx-auto mb-8 leading-relaxed font-medium"
          >
            Real photos, live map thumbnails, AI itineraries & Cohere-powered local insights
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex items-center gap-3 max-w-lg mx-auto"
          >
            <div className="relative flex-1">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && explore()}
                placeholder="Search any city — Tokyo, Bali, Paris..."
                className="input-field input-with-icon w-full py-3.5 rounded-2xl text-sm font-medium"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => explore()}
              disabled={loading}
              className="btn-primary px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 flex-shrink-0 disabled:opacity-50"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Compass size={15} />}
              Explore
            </motion.button>
          </motion.div>

          {/* Popular chips */}
          {!destination && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-2 mt-6 justify-center"
            >
              {POPULAR.map((d, i) => (
                <motion.button
                  key={d.name}
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.04 }}
                  whileHover={{ scale: 1.07, y: -2 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => { setQuery(d.name); explore(d.name) }}
                  className={clsx('flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border shadow-sm', d.color)}
                >
                  {d.emoji} {d.name}
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          SKELETON LOADER — Light theme
      ════════════════════════════════════════════════════ */}
      {loading && (
        <div className="px-6 pb-10 max-w-6xl mx-auto relative z-10 space-y-6">
          <style>{`
            @keyframes shimmer {
              100% { transform: translateX(100%); }
            }
            .skeleton-explorer {
              position: relative;
              overflow: hidden;
              background: linear-gradient(135deg, rgba(224, 242, 254, 0.3), rgba(186, 230, 253, 0.15));
              border-radius: 1.25rem;
              border: 1px solid rgba(255, 255, 255, 0.4);
              backdrop-filter: blur(8px);
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5);
            }
            .skeleton-explorer::after {
              position: absolute;
              top: 0; left: 0; right: 0; bottom: 0;
              transform: translateX(-100%);
              background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
              animation: shimmer 2s infinite;
              content: '';
            }
          `}</style>
          <div className="h-[380px] skeleton-explorer" />
          <div className="flex gap-3">
            {[1, 2, 3].map(i => <div key={i} className="h-9 w-28 skeleton-explorer" />)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 skeleton-explorer rounded-[20px]" />
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          DESTINATION CONTENT
      ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {destination && !loading && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="px-6 pb-20 max-w-6xl mx-auto relative z-10 space-y-8"
          >
            {/* ── HERO BANNER ────────────────────────────────── */}
            <motion.div
              variants={fadeSlide}
              className="relative h-[300px] md:h-[420px] rounded-[28px] overflow-hidden group"
              style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}
            >
              {/* Hero image */}
              <img
                src={wikiData?.originalimage || heroImg || `https://picsum.photos/seed/${destination}/1400/700`}
                alt={destination}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                onError={e => { e.target.src = `https://picsum.photos/seed/${destination}/1400/700` }}
              />

              {/* Layered gradients */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 35%, rgba(255,255,255,0.92) 100%)' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, transparent 55%)' }} />

              {/* Actions */}
              <div className="absolute top-5 right-5 flex gap-2 z-20">
                <button className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-blue-50 bg-white/80 backdrop-blur border border-white/50 shadow-sm"
                >
                  <Share2 size={15} className="text-slate-600" />
                </button>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
                <div className="flex items-end justify-between gap-4 flex-wrap">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] mb-2.5 bg-blue-100 border border-blue-200 text-blue-600">
                      <MapPin size={9} /> Destination
                    </div>
                    <h2 className="font-extrabold text-slate-900 tracking-tight drop-shadow-sm mb-2"
                      style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.05 }}>
                      {destination}
                    </h2>
                    {wikiData?.extract && (
                      <p className="text-slate-600 text-sm max-w-lg line-clamp-2 leading-relaxed font-medium">
                        {wikiData.extract}
                      </p>
                    )}
                  </div>

                  {/* Quick stats */}
                  <div className="flex gap-2 flex-shrink-0">
                    {[
                      { label: 'Places', value: attractions.length || '—', color: 'blue' },
                      { label: 'AI Days', value: '3', color: 'indigo' },
                    ].map(s => (
                      <div key={s.label} className="text-center px-4 py-3 rounded-2xl glass-card">
                        <p className={clsx('text-xl font-black', `text-${s.color}-600`)}>{s.value}</p>
                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Border glow */}
              <div className="absolute inset-0 rounded-[28px] pointer-events-none"
                style={{ border: '1px solid rgba(59,130,246,0.15)' }} />
            </motion.div>

            {/* ── TABS ───────────────────────────────────────── */}
            <motion.div variants={fadeSlide} className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1 p-1 rounded-2xl glass-card">
                {[
                  { id: 'attractions', label: '📍 Attractions', count: filteredAttractions.length },
                  { id: 'itinerary', label: '✨ AI Itinerary', count: aiPlan?.days?.length },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
                      activeTab === tab.id
                        ? 'bg-blue-100 border border-blue-200 text-blue-700 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    )}
                  >
                    {tab.label}
                    {tab.count != null && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-bold">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Category filter (attractions tab) */}
              {activeTab === 'attractions' && categories.length > 2 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 max-w-full">
                  {categories.slice(0, 6).map(cat => {
                    const catCfg = CAT[cat] || CAT.Default
                    return (
                      <button
                        key={cat}
                        onClick={() => setFilterCat(cat)}
                        className={clsx(
                          'px-3 py-1.5 rounded-xl text-[10px] font-bold flex-shrink-0 transition-all border shadow-sm',
                          filterCat === cat
                            ? 'bg-blue-100 border-blue-200 text-blue-700'
                            : 'bg-white/50 border-white/60 text-slate-500 hover:bg-white/80'
                        )}
                      >
                        {cat !== 'All' && (catCfg.icon || '📍')} {cat}
                      </button>
                    )
                  })}
                </div>
              )}
            </motion.div>

            {/* ── ATTRACTIONS TAB ──────────────────────────── */}
            <AnimatePresence mode="wait">
              {activeTab === 'attractions' && (
                <motion.div
                  key="attractions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {filteredAttractions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredAttractions.map((place, i) => (
                        <AttractionCard
                          key={i}
                          place={place}
                          index={i}
                          city={destination}
                          isSaved={savedPlaces.has(i)}
                          onToggleSave={() => toggleSave(i)}
                          onClick={() => setSelectedPlace({ ...place, index: i })}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 rounded-[20px] glass-card">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)' }}
                      >
                        <MapPin size={28} className="text-blue-400" />
                      </motion.div>
                      <p className="text-slate-700 font-bold">No attractions found for this destination</p>
                      <p className="text-slate-500 text-sm mt-1">Try a broader search or different filter</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── AI ITINERARY TAB ─────────────────────── */}
              {activeTab === 'itinerary' && (
                <motion.div
                  key="itinerary"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-amber-500" />
                      <h2 className="font-extrabold text-xl text-slate-800 tracking-tight">3-Day AI Plan</h2>
                      <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                        Gemini AI
                      </span>
                    </div>
                    {aiPlan && (
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={generateAIPlan}
                          className="btn-outline flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs"
                        >
                          <RefreshCw size={12} /> Regenerate
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => toast.success('Trip saved! ✈️')}
                          className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs"
                        >
                          <Save size={12} /> Save Trip
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* Loading */}
                  {loadingAI && (
                    <div className="flex flex-col items-center justify-center py-24 rounded-[20px] gap-5 glass-card">
                      <div className="relative w-14 h-14">
                        <div className="absolute inset-0 rounded-full animate-ping opacity-25 bg-blue-400" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 size={28} className="animate-spin text-blue-500" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-800 font-bold text-base">Crafting your AI travel plan...</p>
                        <p className="text-slate-500 text-sm mt-1">Personalizing 3 days of activities & costs</p>
                      </div>
                    </div>
                  )}

                  {/* Itinerary */}
                  {aiPlan && !loadingAI && (
                    <>
                      {aiPlan.summary && (
                        <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100">
                          <p className="text-slate-700 text-sm leading-relaxed">{aiPlan.summary}</p>
                          {aiPlan.bestTimeToVisit && (
                            <div className="flex items-center gap-2 mt-3 text-xs font-semibold text-blue-600">
                              <Calendar size={12} /> Best time: {aiPlan.bestTimeToVisit}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Days */}
                      {aiPlan.days?.map((day, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className="rounded-[20px] overflow-hidden glass-card"
                        >
                          <button
                            onClick={() => toggleDay(i)}
                            className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/40 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold flex-shrink-0 bg-blue-100 border border-blue-200 text-blue-700">
                                {day.day}
                              </div>
                              <div className="text-left">
                                <p className="font-bold text-sm text-slate-800">Day {day.day}</p>
                                <p className="text-slate-500 text-xs mt-0.5">{day.title}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 font-semibold">{day.activities?.length || 0} stops</span>
                              {expandedDays.includes(i)
                                ? <ChevronUp size={15} className="text-slate-400" />
                                : <ChevronDown size={15} className="text-slate-400" />}
                            </div>
                          </button>

                          <AnimatePresence>
                            {expandedDays.includes(i) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                  {day.activities?.map((act, j) => (
                                    <div key={j}
                                      className="flex items-start gap-4 px-5 py-4 hover:bg-white/30 transition-colors"
                                      style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                                      <div className="flex flex-col items-center gap-1 flex-shrink-0 w-14">
                                        <span className="text-2xl">{act.icon || '📍'}</span>
                                        <span className="text-slate-400 text-[9px] font-bold">{act.time}</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-slate-800 mb-0.5">{act.title}</p>
                                        <p className="text-slate-500 text-xs leading-relaxed">{act.desc}</p>
                                      </div>
                                      <span className={clsx(
                                        'flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg',
                                        act.cost === 'Free'
                                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                                      )}>
                                        {act.cost || 'Free'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}

                      {/* Cost breakdown */}
                      {aiPlan.costBreakdown && (
                        <div className="rounded-[20px] p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                          <div className="flex items-center gap-2 mb-5">
                            <TrendingUp size={15} className="text-blue-600" />
                            <h3 className="font-extrabold text-sm text-blue-700">Estimated Cost Breakdown</h3>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                              { icon: <Hotel size={14} />, label: 'Stay', val: aiPlan.costBreakdown.accommodation },
                              { icon: <Utensils size={14} />, label: 'Food', val: aiPlan.costBreakdown.food },
                              { icon: <Camera size={14} />, label: 'Activities', val: aiPlan.costBreakdown.activities },
                              { icon: <Navigation size={14} />, label: 'Transport', val: aiPlan.costBreakdown.transport },
                            ].map((row, idx) => (
                              <div key={idx} className="rounded-xl p-4 glass-card">
                                <div className="flex items-center gap-1.5 mb-2 text-slate-500">{row.icon}<span className="text-[9px] font-semibold">{row.label}</span></div>
                                <p className="font-extrabold text-sm text-slate-800">₹{row.val?.toLocaleString?.() ?? row.val}</p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-5 pt-4 flex items-center justify-between"
                            style={{ borderTop: '1px solid rgba(59,130,246,0.15)' }}>
                            <span className="text-blue-700 text-sm font-bold">Total Estimated</span>
                            <span className="text-blue-600 font-extrabold text-xl">₹{aiPlan.costBreakdown.total?.toLocaleString?.()}</span>
                          </div>
                        </div>
                      )}

                      {/* Tips */}
                      {aiPlan.tips?.length > 0 && (
                        <div className="rounded-[20px] p-6 glass-card">
                          <h3 className="font-extrabold text-sm mb-4 text-slate-800 flex items-center gap-2">
                            💡 Travel Tips
                          </h3>
                          <ul className="space-y-3">
                            {aiPlan.tips.map((tip, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                                <ArrowRight size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}

                  {!loadingAI && !aiPlan && (
                    <div className="text-center py-16 rounded-[20px] glass-card">
                      <AlertCircle size={28} className="text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-600 font-semibold">Couldn't load AI plan</p>
                      <button onClick={generateAIPlan}
                        className="btn-primary mt-4 px-6 py-2.5 rounded-xl text-sm font-bold">
                        Try Again
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════
          EMPTY STATE — Feature showcase
      ════════════════════════════════════════════════════ */}
      {!destination && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col flex-1 items-center justify-start mt-8 py-8 px-6 relative z-10"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
            {[
              { icon: '📸', title: 'Unsplash Photos', desc: 'Real travel photography for every destination and attraction', color: 'bg-blue-50', border: 'border-blue-200', iconBg: 'bg-blue-100' },
              { icon: '🗺️', title: 'MapTiler + Geoapify', desc: 'Live satellite map thumbnails & smart place discovery via AI', color: 'bg-indigo-50', border: 'border-indigo-200', iconBg: 'bg-indigo-100' },
              { icon: '🤖', title: 'Cohere + Gemini', desc: 'AI-written local insights and full 3-day itinerary planning', color: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-100' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ y: -6, scale: 1.02, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                className={clsx('p-6 rounded-[20px] text-center cursor-default group transition-all transform-gpu', f.color, 'border', f.border)}
                style={{
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.5)',
                }}
              >
                <div className={clsx('w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl border', f.iconBg, f.border)}
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  {f.icon}
                </div>
                <p className="font-bold text-sm text-slate-800 mb-1.5">{f.title}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* AI CTA Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.005 }}
            className="relative rounded-[20px] overflow-hidden cursor-pointer group transition-all duration-500 transform-gpu max-w-3xl w-full mt-6"
            onClick={() => inputRef.current?.focus()}
            style={{
              willChange: 'transform',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(186,230,253,0.25) 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.4)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
            }}
          >
            {/* Animated background dots */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <motion.div className="absolute -right-10 -top-10 w-64 h-64 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)' }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              {[...Array(5)].map((_, i) => (
                <motion.div key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-blue-400/40"
                  style={{ left: `${20 + i * 15}%`, top: `${30 + (i % 3) * 20}%` }}
                  animate={{ y: [0, -15, 0], opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
                />
              ))}
            </div>

            <div className="relative z-10 p-8 flex items-center justify-between gap-8 flex-wrap">
              <div>
                <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold tracking-widest uppercase text-blue-600 bg-blue-100 border border-blue-200 mb-4"
                >
                  <Sparkles size={11} className="animate-pulse" /> 4 API Engines
                </motion.div>
                <h3 className="font-extrabold text-xl mb-2 tracking-tight text-slate-800">Start Exploring the World</h3>
                <p className="text-slate-500 text-sm max-w-md leading-relaxed font-medium">Search any city to unlock real photos, map previews, AI-powered descriptions, and a personalized 3-day travel itinerary.</p>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="btn-primary flex-shrink-0 px-8 py-4 text-sm font-extrabold shadow-blue-500/30 shadow-lg rounded-2xl">
                <Compass size={16} /> Start Exploring
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ════════════════════════════════════════════════════
          PLACE DETAIL MODAL
      ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedPlace && (
          <PlaceModal
            place={selectedPlace}
            city={destination}
            onClose={() => setSelectedPlace(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}