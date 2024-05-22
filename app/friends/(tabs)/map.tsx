import React, { useCallback, useEffect, useRef, useState } from 'react'
import MapView, {
  Marker,
  Polygon,
  Circle,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from 'react-native-maps'
import {
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { FilterIcon, LocateIcon } from 'lucide-react-native'
import * as Location from 'expo-location'
import { Image } from 'expo-image'
import {
  EventsType,
  FriendsType,
  LocationDocumentsType,
  LocationType,
  UserDataDocumentsType,
} from '~/lib/types/collections'
import { database } from '~/lib/appwrite-client'
import { Query } from 'react-native-appwrite'
import { toast } from '~/lib/toast'
import { useFocusEffect } from '@react-navigation/core'
import { Text } from '~/components/ui/text'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import * as Sentry from '@sentry/react-native'
import { formatDate } from '~/components/calculateTimeLeft'

export default function FriendLocationsPage() {
  const mapRef = useRef(null)
  const [userLocation, setUserLocation] = useState(null)

  const [events, setEvents] = useState<EventsType>(null)
  const [friendsLocations, setFriendsLocations] = useState(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [currentEvent, setCurrentEvent] = useState(null)

  const fetchEvents = async () => {
    try {
      const currentDate = new Date()

      const data: EventsType = await database.listDocuments('hp_db', 'events', [
        Query.orderAsc('date'),
        Query.greaterThanEqual('dateUntil', currentDate.toISOString()),
        Query.or([
          Query.equal('locationZoneMethod', 'circle'),
          Query.equal('locationZoneMethod', 'polygon'),
        ]),
      ])

      setEvents(data)
    } catch (error) {
      toast('Failed to fetch events. Please try again later.')
    }
  }

  const fetchUserLocations = async () => {
    try {
      const data: LocationType = await database.listDocuments(
        'hp_db',
        'locations'
      )

      const promises = data.documents.map(async (doc) => {
        const userData: UserDataDocumentsType = await database.getDocument(
          'hp_db',
          'userdata',
          doc.$id
        )
        return { ...doc, userData }
      })

      const results = await Promise.all(promises)
      setFriendsLocations(results)
    } catch (error) {
      toast('Failed to fetch events. Please try again later.')
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchUserLocations().then()
    fetchEvents().then()
    setRefreshing(false)
  }

  useFocusEffect(
    useCallback(() => {
      onRefresh()
      return () => {} // Optional cleanup function
    }, [])
  )

  /*
  const users = [
    {
      name: 'Faye',
      coordinate: { latitude: 52.53674137410944, longitude: 6.854766681796735 },
      avatar:
        'https://api.headpat.de/v1/storage/buckets/avatars/files/661f306803b13ecb728c/view?project=6557c1a8b6c2739b3ecf',
    },
    // Add more users as needed
  ]
   */

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
    startWatching().then()
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

  const getUserAvatar = (avatarId: string) => {
    if (!avatarId) return
    return `https://api.headpat.de/v1/storage/buckets/avatars/files/${avatarId}/preview?project=6557c1a8b6c2739b3ecf&width=100&height=100`
  }

  return (
    <View style={styles.container}>
      <Dialog>
        <DialogContent>
          <DialogTitle>{currentEvent?.title}</DialogTitle>
          <Text>{currentEvent?.description}</Text>
          <DialogFooter>
            <Text>Until: {formatDate(new Date(currentEvent?.dateUntil))}</Text>
            <Text>Start: {formatDate(new Date(currentEvent?.date))}</Text>
          </DialogFooter>
        </DialogContent>

        <MapView
          ref={mapRef}
          style={styles.map}
          provider={
            Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
          }
          showsUserLocation={true}
        >
          {events?.documents.map((event, index) => {
            if (event?.locationZoneMethod === 'polygon') {
              const coords = event?.coordinates.map((coord) => {
                const [latitude, longitude] = coord.split(',').map(Number)
                return { latitude, longitude }
              })
              return (
                <DialogTrigger asChild>
                  <Polygon
                    key={index}
                    coordinates={coords}
                    tappable={true}
                    onPress={() => {
                      setCurrentEvent(event)
                    }}
                    fillColor="rgba(100, 200, 200, 0.5)" // optional, fill color of the polygon
                    strokeColor="rgba(255,0,0,0.5)" // optional, border color of the polygon
                  />
                </DialogTrigger>
              )
            } else if (event?.locationZoneMethod === 'circle') {
              // Assuming the first coordinate is the center of the circle
              const [centerLatitude, centerLongitude] = event?.coordinates[0]
                .split(',')
                .map(Number)
              return (
                <DialogTrigger asChild>
                  <Circle
                    key={index}
                    center={{
                      latitude: centerLatitude,
                      longitude: centerLongitude,
                    }}
                    radius={event?.circleRadius} // specify the radius here
                    fillColor="rgba(100, 200, 200, 0.5)" // optional, fill color of the circle
                    strokeColor="rgba(255,0,0,0.5)" // optional, border color of the circle
                  />
                </DialogTrigger>
              )
            }
          })}
          {friendsLocations?.map((user, index) => {
            return (
              <Marker
                key={index}
                coordinate={{
                  latitude: user.lat,
                  longitude: user.long,
                }}
                title={user?.userData?.displayName}
                description={'No peeking!'}
              >
                <TouchableOpacity>
                  <Image
                    source={{ uri: getUserAvatar(user?.userData?.avatarId) }}
                    style={{ width: 40, height: 40, borderRadius: 25 }}
                  />
                </TouchableOpacity>
              </Marker>
            )
          })}
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
        {userLocation && (
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
        )}
      </Dialog>
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
    bottom: 20,
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
})
