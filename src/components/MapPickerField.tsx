'use client'

import dynamic from 'next/dynamic'
import { useField } from '@payloadcms/ui'
import type { TextFieldClientProps } from 'payload'

const MapPickerInner = dynamic(() => import('./MapPickerInner'), { ssr: false })

export function MapPickerField(props: TextFieldClientProps) {
  const { path } = props

  // Derive sibling paths from the current field path (e.g. "location.address")
  const basePath = path.replace(/\.address$/, '')

  const { value: address, setValue: setAddress } = useField<string>({ path })
  const { value: lat, setValue: setLat } = useField<number>({ path: `${basePath}.lat` })
  const { value: lng, setValue: setLng } = useField<number>({ path: `${basePath}.lng` })

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: 600,
          fontSize: '0.875rem',
        }}
      >
        Τοποθεσία στον Χάρτη
      </label>
      <MapPickerInner
        lat={lat ?? 37.9838}
        lng={lng ?? 23.7275}
        address={address ?? ''}
        onChange={(newLat, newLng, newAddress) => {
          setLat(newLat)
          setLng(newLng)
          setAddress(newAddress)
        }}
      />
    </div>
  )
}
