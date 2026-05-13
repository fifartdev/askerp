'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

// Fix default marker icons broken by webpack
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

type Props = {
  lat: number
  lng: number
  address: string
  onChange: (lat: number, lng: number, address: string) => void
}

function DraggableMarker({ lat, lng, onChange }: Omit<Props, 'address'>) {
  const markerRef = useRef<L.Marker>(null)

  useMapEvents({})

  async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { 'Accept-Language': 'el' } },
      )
      const json = await res.json()
      return json.display_name ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    } catch {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }

  return (
    <Marker
      draggable
      position={[lat, lng]}
      ref={markerRef}
      eventHandlers={{
        dragend: async () => {
          const marker = markerRef.current
          if (!marker) return
          const pos = marker.getLatLng()
          const addr = await reverseGeocode(pos.lat, pos.lng)
          onChange(pos.lat, pos.lng, addr)
        },
      }}
    />
  )
}

export default function MapPickerInner({ lat, lng, address, onChange }: Props) {
  const defaultLat = lat || 37.9838
  const defaultLng = lng || 23.7275

  return (
    <div className="flex flex-col gap-2">
      <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={[defaultLat, defaultLng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <DraggableMarker lat={defaultLat} lng={defaultLng} onChange={onChange} />
        </MapContainer>
      </div>
      {address && (
        <p className="text-xs text-gray-500 truncate" title={address}>
          📍 {address}
        </p>
      )}
      <p className="text-xs text-gray-400">Σύρετε την καρφίτσα για να επιλέξετε τοποθεσία.</p>
    </div>
  )
}
