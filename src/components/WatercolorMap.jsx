import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap, CircleMarker, Polyline } from 'react-leaflet'
import * as topojson from 'topojson-client'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getLatLng, midpoint } from '../utils/geo'

function FlyToCountry({ selectedFeature }) {
  const map = useMap()

  useEffect(() => {
    if (!selectedFeature) return
    const layer = L.geoJSON(selectedFeature)
    const bounds = layer.getBounds()
    if (bounds.isValid()) {
      map.flyToBounds(bounds, { padding: [40, 40], duration: 1.2 })
    }
  }, [selectedFeature, map])

  return null
}

function FitTwo({ pos1, pos2 }) {
  const map = useMap()
  useEffect(() => {
    if (!pos1 || !pos2) return
    map.fitBounds([
      [Math.min(pos1.lat, pos2.lat) - 5, Math.min(pos1.lng, pos2.lng) - 10],
      [Math.max(pos1.lat, pos2.lat) + 5, Math.max(pos1.lng, pos2.lng) + 10],
    ], { duration: 1 })
  }, [pos1?.lat, pos1?.lng, pos2?.lat, pos2?.lng]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

export default function WatercolorMap({ onCountryClick, selectedCountry, markers = [], secondaryCountry, secondaryCity }) {
  const [geoData, setGeoData] = useState(null)
  const [selectedFeature, setSelectedFeature] = useState(null)

  useEffect(() => {
    let isMounted = true

    import('world-atlas/countries-110m.json').then((module) => {
      const data = module.default
      const countries = topojson.feature(data, data.objects.countries)

      fetch('https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/slim-3/slim-3.json')
        .then(r => r.json())
        .then((isoData) => {
          if (!isMounted) return
          const lookup = {}
          isoData.forEach((c) => {
            lookup[parseInt(c['country-code'], 10)] = c.name
          })
          countries.features.forEach((f) => {
            f.properties.name = lookup[f.id] || `Country ${f.id}`
          })
          setGeoData(countries)
        })
        .catch(() => {
          if (!isMounted) return
          setGeoData(countries)
        })
    })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!geoData || !selectedCountry) {
      setSelectedFeature(null)
      return
    }
    const match = geoData.features.find(f => f.properties?.name === selectedCountry)
    setSelectedFeature(match || null)
  }, [geoData, selectedCountry])

  const markerCountries = useMemo(() => {
    const countries = new Set()
    markers.forEach((marker) => {
      if (marker?.country) countries.add(marker.country)
    })
    return countries
  }, [markers])

  const markerSignature = useMemo(
    () => Array.from(markerCountries).sort().join('|'),
    [markerCountries],
  )

  const getStyle = (feature) => {
    const name = feature.properties?.name
    const isSelected = Boolean(selectedCountry) && name === selectedCountry
    const isMarked = !selectedCountry && markerCountries.has(name)

    return {
      fillColor: isSelected ? '#C4622D' : isMarked ? '#D4A96A' : 'transparent',
      fillOpacity: isSelected ? 0.35 : isMarked ? 0.2 : 0,
      color: isSelected ? '#C4622D' : '#9B7653',
      weight: isSelected ? 2 : isMarked ? 1 : 0.5,
      opacity: isSelected ? 0.8 : isMarked ? 0.6 : 0.3,
    }
  }

  const onEachFeature = (feature, layer) => {
    layer.on('click', () => {
      const name = feature.properties?.name
      if (name && name !== `Country ${feature.id}`) {
        setSelectedFeature(feature)
        if (onCountryClick) onCountryClick(name)
      }
    })

    layer.on('mouseover', () => {
      if (feature.properties?.name !== selectedCountry) {
        layer.setStyle({
          fillColor: '#D4A96A',
          fillOpacity: 0.2,
          weight: 1,
          color: '#9B7653',
          opacity: 0.5,
        })
      }
    })

    layer.on('mouseout', () => {
      layer.setStyle(getStyle(feature))
    })
  }

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={1.5}
      maxZoom={8}
      style={{ width: '100%', height: '100%', background: '#F5EFE0' }}
      zoomControl={false}
      worldCopyJump
    >
      <TileLayer
        url={`https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg${import.meta.env.VITE_STADIA_MAPS_API_KEY ? `?api_key=${import.meta.env.VITE_STADIA_MAPS_API_KEY}` : ''}`}
        attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {geoData && (
        <GeoJSON
          key={`${selectedCountry ?? 'none'}:${markerSignature}`}
          data={geoData}
          style={getStyle}
          onEachFeature={onEachFeature}
        />
      )}
      {selectedFeature && <FlyToCountry selectedFeature={selectedFeature} />}
      {(() => {
        if (!selectedCountry || !secondaryCountry) return null
        const pos1 = getLatLng(secondaryCountry, secondaryCity)
        const pos2 = getLatLng(selectedCountry)
        if (!pos1 || !pos2) return null
        const mid = midpoint(pos1, pos2)
        return (
          <>
            <FitTwo pos1={pos1} pos2={pos2} />
            <Polyline
              positions={[[pos1.lat, pos1.lng], [pos2.lat, pos2.lng]]}
              pathOptions={{ color: '#C4622D', weight: 1.5, opacity: 0.35, dashArray: '5 5' }}
            />
            <CircleMarker center={[pos1.lat, pos1.lng]} radius={6}
              pathOptions={{ fillColor: '#C4622D', fillOpacity: 0.85, color: '#fff', weight: 1.5 }} />
            <CircleMarker center={[pos2.lat, pos2.lng]} radius={6}
              pathOptions={{ fillColor: '#7A9E7E', fillOpacity: 0.85, color: '#fff', weight: 1.5 }} />
            <CircleMarker center={[mid.lat, mid.lng]} radius={5}
              pathOptions={{ fillColor: '#D4A96A', fillOpacity: 1, color: '#9B7653', weight: 1.5 }} />
          </>
        )
      })()}
    </MapContainer>
  )
}
