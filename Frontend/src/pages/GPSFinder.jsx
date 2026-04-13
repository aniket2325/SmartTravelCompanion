import { useEffect, useState } from 'react'
import { Map, Search, Navigation, Star, Clock, Phone, ExternalLink, Filter, Loader2, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { placesAPI } from '../services/api'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import PageWrapper from '../components/Layout/PageWrapper'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

function MapUpdater({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, map.getZoom() || 14)
  }, [center, map])
  return null
}

const CATEGORIES = [
  { id: 'restaurant', label: 'Restaurants', icon: '🍽️' },
  { id: 'atm',        label: 'ATMs',        icon: '🏧' },
  { id: 'hospital',   label: 'Hospitals',   icon: '🏥' },
  { id: 'hotel',      label: 'Hotels',      icon: '🏨' },
  { id: 'tourist',    label: 'Attractions', icon: '🎯' },
  { id: 'pharmacy',   label: 'Pharmacy',    icon: '💊' },
  { id: 'transport',  label: 'Transport',   icon: '🚌' },
  { id: 'shopping',   label: 'Shopping',    icon: '🛍️' },
]

export default function GPSFinder() {
  const [category, setCategory] = useState('restaurant')
  const [search, setSearch]     = useState('')
  const [sortByDist, setSortByDist] = useState(false)
  const [locating, setLocating] = useState(false)
  const [location, setLocation] = useState(null)
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(false)

  const calculateDist = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
  }

  const getLocation = () => {
    setLocating(true)
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
        toast.success('Accurate location found!')
      },
      (error) => {
        console.error("Location error:", error)
        setLocation({ lat: '28.6139', lng: '77.2090' })
        setLocating(false)
        toast.error('Location denied or failed. Using default.', { icon: '📍' })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const fetchPlaces = async (coords) => {
    if (!coords?.lat || !coords?.lng) return
    setLoading(true)
    try {
      const res = await placesAPI.getNearby({ lat: coords.lat, lng: coords.lng, type: category })
      setPlaces(res.data?.data || [])
    } catch (err) {
      toast.error(err?.message || 'Failed to load nearby places')
      setPlaces([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (location) fetchPlaces(location) }, [location, category])

  const filteredPlaces = places.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  const displayPlaces = filteredPlaces.map((place) => {
    let distanceRaw = 0
    let distanceStr = 'N/A'
    if (location && place.location?.lat && place.location?.lng) {
      distanceRaw = calculateDist(location.lat, location.lng, place.location.lat, place.location.lng)
      distanceStr = distanceRaw < 1 ? `${(distanceRaw * 1000).toFixed(0)} m` : `${distanceRaw.toFixed(1)} km`
    }
    return {
      ...place,
      type: place.type || place.types?.[0] || 'Place',
      distanceRaw, distance: distanceStr,
      openLabel: place.open === true ? 'Open' : place.open === false ? 'Closed' : 'Unknown',
      openClass: place.open === true ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : place.open === false ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-100 text-slate-500 border-slate-200',
    }
  })

  if (sortByDist) displayPlaces.sort((a, b) => a.distanceRaw - b.distanceRaw)

  return (
    <PageWrapper icon={Map} title="GPS Nearby Finder" subtitle={location ? `📍 ${location.lat.toString().substring(0,6)}, ${location.lng.toString().substring(0,6)}` : 'Location not set'} iconColor="text-blue-500" iconBg="bg-blue-100">
      
      <div className="flex justify-end mb-2 -mt-10 relative z-30 pointer-events-auto">
         <button onClick={getLocation} disabled={locating} className="btn-outline h-9 px-4 text-xs font-bold bg-white/40 backdrop-blur-sm shadow-sm border-blue-200 text-blue-600 hover:bg-blue-50">
            {locating ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Navigation size={14} className="mr-1.5" />}
            {locating ? 'Locating…' : 'Find Me'}
          </button>
      </div>

      <div className="max-w-4xl space-y-5">
        <div className="glass-card rounded-[18px] p-5 shadow-sm">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input className="input-field pl-12 h-12 bg-slate-50 text-base" placeholder="Search nearby places…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 mt-4 scrollbar-hide pt-1">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCategory(c.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border flex-shrink-0 transition-all duration-200 shadow-sm',
                  category === c.id ? 'bg-blue-50 border-blue-200 text-blue-600 ring-2 ring-blue-500/20' : 'bg-white/40 backdrop-blur-sm border-white/30 text-slate-600 hover:bg-white/60'
                )}
              >
                <span className="text-base">{c.icon}</span> {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 shadow-inner h-[350px] flex flex-col items-center justify-center gap-3 relative overflow-hidden rounded-2xl z-0">
          {location ? (
            <MapContainer center={[location.lat, location.lng]} zoom={14} style={{ height: '100%', width: '100%', zIndex: 1 }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
              <MapUpdater center={[location.lat, location.lng]} />
              <Marker position={[location.lat, location.lng]}><Popup>You are here</Popup></Marker>
              {displayPlaces.map((place, i) => {
                if (!place.location?.lat || !place.location?.lng) return null
                return (
                  <Marker key={i} position={[place.location.lat, place.location.lng]}>
                    <Popup>
                      <div className="text-slate-800 p-1">
                        <strong className="block text-sm mb-1">{place.name}</strong>
                        <span className="text-xs text-slate-500 capitalize">{place.type}</span>
                        <p className="text-xs mt-1.5 leading-snug text-slate-600">{place.address}</p>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
            </MapContainer>
          ) : (
            <>
              <div className="absolute inset-0 bg-white/30 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm animate-bounce-soft">
                  <MapPin size={28} className="text-blue-500" />
                </div>
                <p className="text-slate-800 text-lg font-extrabold mb-1">Interactive Map Ready</p>
                <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-6">OpenStreetMap & Leaflet integration complete. Enable location to view nearby amenities.</p>
                <button onClick={getLocation} disabled={locating} className="btn-primary shadow-blue-500/20 px-6 py-3 h-auto">
                    {locating ? 'Locating…' : 'Find My Location'}
                </button>
              </div>
            </>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 mt-8 px-1">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{displayPlaces.length} places found nearby</p>
            <button onClick={() => setSortByDist(!sortByDist)} className={clsx("flex items-center gap-1.5 text-xs font-bold transition-colors px-3 py-1.5 rounded-lg border", sortByDist ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50")}>
              <Filter size={13}/> Sort by distance
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="glass-card rounded-[18px] p-8 text-center shadow-sm">
                <Loader2 size={24} className="animate-spin text-blue-500 mx-auto" />
                <p className="text-slate-500 text-sm font-semibold mt-3">Loading nearby places…</p>
              </div>
            ) : displayPlaces.length === 0 ? (
              <div className="glass-card rounded-[18px] p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Search size={24} className="text-slate-300" />
                </div>
                <p className="text-slate-600 font-bold text-base mb-1">No places found</p>
                <p className="text-slate-500 text-sm">Try searching for something else or increasing the radius.</p>
              </div>
            ) : places.map((place, i) => (
              <div key={i} className="glass-card rounded-[18px] p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 group shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <p className="font-extrabold text-base text-slate-800">{place.name}</p>
                      <span className={clsx('text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wide', place.openClass)}>
                        {place.openLabel}
                      </span>
                    </div>
                    <p className="text-blue-600 text-xs font-semibold mb-2 capitalize">{place.type}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                      <span className="flex items-start gap-1.5 leading-snug"><MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0"/>{place.address}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                      <Star size={14} className="text-amber-500 fill-amber-500" />
                      <span className="text-sm font-bold text-amber-700">{place.rating}</span>
                    </div>
                    <span className="text-slate-500 text-[10px] font-black tracking-widest uppercase bg-slate-100 px-2 py-1 rounded border border-slate-200">{place.distance}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                  <button onClick={() => { if (place.phone) window.location.href = `tel:${place.phone}`; else toast.error(`No phone number available for ${place.name}`); }}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200"
                  ><Phone size={14}/> Call</button>
                  <button onClick={() => { if (location?.lat && place.location?.lat) { window.open(`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${location.lat}%2C${location.lng}%3B${place.location.lat}%2C${place.location.lng}`, '_blank'); } else { toast.error('Location not available'); } }}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200"
                  ><Navigation size={14}/> Directions</button>
                  <button onClick={() => window.open(`https://www.openstreetmap.org/node/${place.placeId}`, '_blank')}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 ml-auto"
                  ><ExternalLink size={14}/> Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
