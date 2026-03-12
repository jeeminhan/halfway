// src/components/HistoryMap.jsx
import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { getLatLng, midpoint } from '../utils/geo'

function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 4)
    } else {
      const lats = points.map(p => p.lat)
      const lngs = points.map(p => p.lng)
      map.fitBounds([
        [Math.min(...lats) - 5, Math.min(...lngs) - 5],
        [Math.max(...lats) + 5, Math.max(...lngs) + 5],
      ], { padding: [20, 20] })
    }
  }, [points.length]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

export default function HistoryMap({ items, activeId, onSelect, heightClass = 'h-[22rem]' }) {
  const [activeQuestion, setActiveQuestion] = useState(null)

  const pins = items.map(item => {
    const ll1 = getLatLng(item.person1?.country, item.person1?.city)
    const ll2 = getLatLng(item.person2?.country, item.person2?.city)
    if (!ll1 || !ll2) return null
    return { item, ll1, ll2, mid: midpoint(ll1, ll2) }
  }).filter(Boolean)

  const allPoints = pins.flatMap(p => [p.ll1, p.ll2])

  return (
    <div className={`${heightClass} w-full rounded-3xl overflow-hidden border border-sand/30`}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ width: '100%', height: '100%', background: '#F5EFE0' }}
        zoomControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          url={`https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg${import.meta.env.VITE_STADIA_MAPS_API_KEY ? `?api_key=${import.meta.env.VITE_STADIA_MAPS_API_KEY}` : ''}`}
        />
        {allPoints.length > 0 && <FitBounds points={allPoints} />}
        {pins.map(({ item, ll1, ll2, mid }) => (
          <React.Fragment key={item.id}>
            <Polyline
              positions={[[ll1.lat, ll1.lng], [ll2.lat, ll2.lng]]}
              pathOptions={{ color: activeId === item.id ? '#9B7653' : '#C4622D', weight: activeId === item.id ? 2.3 : 1.6, opacity: 0.55, dashArray: '4 4' }}
              eventHandlers={{ click: () => onSelect?.(item.id) }}
            />
            <CircleMarker
              center={[ll1.lat, ll1.lng]}
              radius={activeId === item.id ? 7 : 5}
              pathOptions={{ fillColor: '#C4622D', fillOpacity: 0.8, color: '#C4622D', weight: activeId === item.id ? 2 : 1 }}
              eventHandlers={{ click: () => onSelect?.(item.id) }}
            />
            <CircleMarker
              center={[ll2.lat, ll2.lng]}
              radius={activeId === item.id ? 7 : 5}
              pathOptions={{ fillColor: '#7A9E7E', fillOpacity: 0.8, color: '#7A9E7E', weight: activeId === item.id ? 2 : 1 }}
              eventHandlers={{ click: () => onSelect?.(item.id) }}
            />
            <CircleMarker
              center={[mid.lat, mid.lng]}
              radius={activeId === item.id ? 9 : 7}
              pathOptions={{ fillColor: '#D4A96A', fillOpacity: 0.9, color: '#9B7653', weight: 1.5 }}
              eventHandlers={{
                click: () => {
                  onSelect?.(item.id)
                  setActiveQuestion(activeQuestion === item.id ? null : item.id)
                },
              }}
            >
              {activeQuestion === item.id && (
                <Popup>
                  <div className="max-w-[220px] text-center p-1">
                    <p className="text-[10px] uppercase tracking-widest text-sand font-semibold mb-1">Shared thread</p>
                    {item.topic?.name && (
                      <p className="text-[10px] uppercase tracking-[0.2em] text-brown-deep/45 mb-2">
                        {item.topic.icon ? `${item.topic.icon} ` : ''}{item.topic.name}
                      </p>
                    )}
                    <p className="font-serif italic text-brown-deep text-xs leading-relaxed">
                      "{item.keepsake?.thread || item.halfwayQuestion}"
                    </p>
                    {item.createdAt && (
                      <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-brown-deep/35">
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </Popup>
              )}
            </CircleMarker>
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  )
}
