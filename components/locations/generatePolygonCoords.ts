/**
 * Generate polygon coordinates for a circle... don't ask why
 * Ok... I'll tell you. React Native Maps doesn't support clickable circles. So we're using polygons instead.
 * @since 0.7.0
 */
export const generatePolygonCoords = (
  centerLatitude: number,
  centerLongitude: number,
  radius: number,
  sides = 32
) => {
  const coords = []
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides
    const latitude = centerLatitude + (radius / 111320) * Math.cos(angle) // 111320 meters = 1 degree
    const longitude =
      centerLongitude +
      (radius / (111320 * Math.cos(centerLatitude * (Math.PI / 180)))) *
        Math.sin(angle)
    coords.push({ latitude, longitude })
  }
  return coords
}
