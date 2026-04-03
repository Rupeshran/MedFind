import { useState, useCallback, useRef } from 'react'
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { MapPin, Navigation, Star, Shield, Clock, Phone } from 'lucide-react'

const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '16px' }
const defaultCenter = { lat: 19.076, lng: 72.8777 } // Mumbai

const mapStyles = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
]

export default function PharmacyMapView({ pharmacies = [], selectedId, onSelect, height = '400px', showUserLocation = true }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  })

  const [activeMarker, setActiveMarker] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const mapRef = useRef(null)

  const onMapLoad = useCallback((map) => {
    mapRef.current = map
    // Fit to markers
    if (pharmacies.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      pharmacies.forEach(p => {
        if (p.coords) bounds.extend({ lat: p.coords[1], lng: p.coords[0] })
      })
      if (userLocation) bounds.extend(userLocation)
      map.fitBounds(bounds, { padding: 60 })
    }
  }, [pharmacies, userLocation])

  const locateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setUserLocation(loc)
          mapRef.current?.panTo(loc)
          mapRef.current?.setZoom(14)
        },
        () => console.warn('Geolocation denied')
      )
    }
  }

  const isOpen = (pharmacy) => {
    if (pharmacy.isOpen24Hours) return true
    if (!pharmacy.timings) return false
    const now = new Date()
    const [oh, om] = (pharmacy.timings.open || '09:00').split(':').map(Number)
    const [ch, cm] = (pharmacy.timings.close || '21:00').split(':').map(Number)
    const cur = now.getHours() * 60 + now.getMinutes()
    return cur >= oh * 60 + om && cur <= ch * 60 + cm
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center bg-slate-100 rounded-2xl p-8 text-center" style={{ height }}>
        <div>
          <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-500 text-sm font-medium">Map unavailable</p>
          <p className="text-slate-400 text-xs mt-1">Add a valid Google Maps API key to enable maps</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center bg-slate-100 rounded-2xl animate-pulse" style={{ height }}>
        <p className="text-slate-400 text-sm">Loading map...</p>
      </div>
    )
  }

  const center = pharmacies.length > 0 && pharmacies[0].coords
    ? { lat: pharmacies[0].coords[1], lng: pharmacies[0].coords[0] }
    : userLocation || defaultCenter

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200" style={{ height }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        onLoad={onMapLoad}
        options={{ styles: mapStyles, disableDefaultUI: false, zoomControl: true, streetViewControl: false, mapTypeControl: false, fullscreenControl: true }}
      >
        {/* Pharmacy markers */}
        {pharmacies.map((p, i) => {
          if (!p.coords) return null
          const pos = { lat: p.coords[1], lng: p.coords[0] }
          return (
            <Marker
              key={p._id || i}
              position={pos}
              onClick={() => { setActiveMarker(p._id || i); onSelect?.(p) }}
              icon={selectedId === (p._id || i) ? undefined : undefined}
            />
          )
        })}

        {/* User location */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{ path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#4F46E5', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 }}
          />
        )}

        {/* Info window */}
        {activeMarker !== null && (() => {
          const p = pharmacies.find(ph => (ph._id || pharmacies.indexOf(ph)) === activeMarker)
          if (!p || !p.coords) return null
          const open = isOpen(p)
          return (
            <InfoWindow
              position={{ lat: p.coords[1], lng: p.coords[0] }}
              onCloseClick={() => setActiveMarker(null)}
            >
              <div className="p-1 min-w-[200px]">
                <div className="flex items-center gap-1.5 mb-1">
                  <h4 className="font-bold text-slate-800 text-sm">{p.name}</h4>
                  {p.isVerified && <Shield className="w-3 h-3 text-emerald-500" />}
                </div>
                <p className="text-xs text-slate-500 mb-1">{p.address?.street}, {p.address?.city}</p>
                <div className="flex items-center gap-3 text-xs mb-1">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400" /> {p.rating || 'N/A'}
                  </span>
                  <span className={`font-medium ${open ? 'text-green-600' : 'text-red-500'}`}>{open ? 'Open' : 'Closed'}</span>
                </div>
                {p.phone && <p className="text-xs text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" />{p.phone}</p>}
                {p.price !== undefined && (
                  <p className="text-sm font-bold text-indigo-600 mt-1">₹{p.price}</p>
                )}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${p.coords[1]},${p.coords[0]}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-indigo-600 font-medium hover:underline"
                >
                  <Navigation className="w-3 h-3" /> Get Directions
                </a>
              </div>
            </InfoWindow>
          )
        })()}
      </GoogleMap>

      {/* Locate me button */}
      {showUserLocation && (
        <button
          onClick={locateUser}
          className="absolute bottom-4 right-4 bg-white shadow-lg rounded-xl p-2.5 hover:bg-slate-50 transition-colors border border-slate-200"
          title="My location"
        >
          <Navigation className="w-4 h-4 text-indigo-600" />
        </button>
      )}
    </div>
  )
}
