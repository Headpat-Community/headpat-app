import React, { useEffect, useRef, useState } from 'react'
import MapView, {
  Marker,
  Polygon,
  Circle,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from 'react-native-maps'
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import { FilterIcon, LocateIcon } from 'lucide-react-native'
import * as Location from 'expo-location'
import { Image } from 'expo-image'

export default function FriendLocationsPage(...props) {
  console.log(props)
  const mapRef = useRef(null)
  const [userLocation, setUserLocation] = useState(null)

  const users = [
    {
      name: 'Faye',
      coordinate: { latitude: 52.53674137410944, longitude: 6.854766681796735 },
      avatar:
        'https://api.headpat.de/v1/storage/buckets/avatars/files/661f306803b13ecb728c/view?project=6557c1a8b6c2739b3ecf',
    },
    // Add more users as needed
  ]

  const polygonCoordinates = [
    { latitude: 27.78825, longitude: -122.4324 },
    { latitude: 27.78845, longitude: -140.4322 },
    { latitude: 60.78835, longitude: -140.4323 },
    { latitude: 60.78835, longitude: -122.4323 },
  ]

  const handleUserClick = (user) => {
    // Handle user click here
    console.log(`User ${user.name} was clicked`)
  }

  useEffect(() => {
    let watcher = null
    const startWatching = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status === 'granted') {
        watcher = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (location) => {
            setUserLocation(location.coords)
          }
        )
      }
    }
    startWatching()
    return () => {
      if (watcher) {
        watcher.remove()
      }
    }
  }, [])

  const handleLocationButtonPress = () => {
    if (userLocation) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      })
    }
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={
          Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
        }
        showsUserLocation={true}
      >
        <Polygon
          coordinates={polygonCoordinates}
          fillColor="rgba(100, 200, 200, 0.5)" // optional, fill color of the polygon
          strokeColor="rgba(255,0,0,0.5)" // optional, border color of the polygon
        />
        {users.map((user, index) => (
          <Marker
            key={index}
            coordinate={user.coordinate}
            title={user.name}
            description={'No peeking!'}
          >
            <TouchableOpacity onPress={() => handleUserClick(user)}>
              <Image
                source={{ uri: user.avatar }}
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />
            </TouchableOpacity>
          </Marker>
        ))}
      </MapView>
      <View style={styles.filterButton}>
        <TouchableOpacity
          className={
            'justify-center items-center bg-white h-14 w-14 rounded-full shadow'
          }
          onPress={() => console.log('Filter button pressed')}
        >
          <FilterIcon size={24} color={'black'} />
        </TouchableOpacity>
      </View>
      <View style={styles.locationButton}>
        <TouchableOpacity
          className={
            'justify-center items-center bg-white h-14 w-14 rounded-full shadow'
          }
          onPress={handleLocationButtonPress}
        >
          <LocateIcon size={24} color={'black'} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

// Examples:
/*
Users:

        {users.map((user, index) => (
          <Marker
            key={index}
            coordinate={user.coordinate}
            title={user.name}
            description={'No peeking!'}
          >
            <TouchableOpacity onPress={() => handleUserClick(user)}>
              <Image
                source={{ uri: user.avatar }}
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />
            </TouchableOpacity>
          </Marker>
        ))}
 */

/*
Circle markers:

        <Circle
          center={{ latitude: 37.78825, longitude: -122.4324 }}
          radius={10000} // specify the radius here
          fillColor="rgba(100, 200, 200, 0.5)" // optional, fill color of the circle
          strokeColor="rgba(255,0,0,0.5)" // optional, border color of the circle
        />
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  locationButton: {
    position: 'absolute',
    bottom: 40,
    right: 10,
    borderRadius: 50,
    overflow: 'hidden',
  },
  filterButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 50,
    overflow: 'hidden',
  },
})
