// src/utils/geo.js
import { Country, City } from 'country-state-city'

/**
 * Returns { lat, lng } for a given country name + optional city name.
 * Falls back to country centroid if city not found.
 * Returns null if country not found.
 */
export function getLatLng(countryName, cityName) {
  const allCountries = Country.getAllCountries()
  const countryObj = allCountries.find(c => c.name === countryName)
  if (!countryObj) return null

  if (cityName) {
    const cities = City.getCitiesOfCountry(countryObj.isoCode) || []
    const cityObj = cities.find(c => c.name.toLowerCase() === cityName.toLowerCase())
    if (cityObj?.latitude && cityObj?.longitude) {
      return { lat: parseFloat(cityObj.latitude), lng: parseFloat(cityObj.longitude) }
    }
  }

  if (countryObj.latitude && countryObj.longitude) {
    return { lat: parseFloat(countryObj.latitude), lng: parseFloat(countryObj.longitude) }
  }

  return null
}

/**
 * Returns the geographic midpoint between two { lat, lng } points.
 */
export function midpoint(a, b) {
  return {
    lat: (a.lat + b.lat) / 2,
    lng: (a.lng + b.lng) / 2,
  }
}
