import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate the distance between two geographic coordinates using the Haversine formula
 * @param lat1 - Latitude of the first point
 * @param lon1 - Longitude of the first point
 * @param lat2 - Latitude of the second point
 * @param lon2 - Longitude of the second point
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance
}

/**
 * Get the center coordinates of an event based on its location method
 * @param event - Event object with coordinates and location method
 * @returns Center coordinates {latitude, longitude} or null if virtual event
 */
export function getEventCenterCoordinates(event: {
  locationZoneMethod: 'polygon' | 'circle' | 'virtual'
  coordinates: string[]
}): { latitude: number; longitude: number } | null {
  if (event.locationZoneMethod === 'virtual') {
    return null
  }

  if (event.locationZoneMethod === 'circle') {
    // For circles, the first coordinate is the center
    const [latitude, longitude] = event.coordinates[0].split(',').map(Number)
    return { latitude, longitude }
  }

  // For polygons, calculate the centroid
  const coordinates = event.coordinates.map((coord) => {
    const [lat, lng] = coord.split(',').map(Number)
    return { latitude: lat, longitude: lng }
  })

  const centroid = coordinates.reduce(
    (acc, coord) => ({
      latitude: acc.latitude + coord.latitude,
      longitude: acc.longitude + coord.longitude,
    }),
    { latitude: 0, longitude: 0 },
  )

  return {
    latitude: centroid.latitude / coordinates.length,
    longitude: centroid.longitude / coordinates.length,
  }
}
