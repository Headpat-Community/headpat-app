import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import MapView, {
  Marker,
  Polygon,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from 'react-native-maps'
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import { FilterIcon, LocateIcon, SettingsIcon } from 'lucide-react-native'
import * as Location from 'expo-location'
import {
  Events,
  Location as LocationType,
  UserData,
} from '~/lib/types/collections'
import { databases } from '~/lib/appwrite-client'
import { Query } from 'react-native-appwrite'
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
import { formatDateLocale } from '~/components/calculateTimeLeft'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { useUser } from '~/components/contexts/UserContext'
import HTMLView from 'react-native-htmlview'
import { useColorScheme } from '~/lib/useColorScheme'
import FiltersModal from '~/components/locations/FiltersModal'
import SettingsModal from '~/components/locations/SettingsModal'
import { LocationFrontPermissionModal } from '~/components/locations/LocationPermissionModal'
import sanitizeHtml from 'sanitize-html'
import { generatePolygonCoords } from '~/components/locations/generatePolygonCoords'
import { useAlertModal } from '~/components/contexts/AlertModalProvider'
import { i18n } from '~/components/system/i18n'

export default function MutualLocationsPage() {
  const { current } = useUser()
  const { showAlert } = useAlertModal()
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'

  const mapRef = useRef(null)
  const [userLocation, setUserLocation] = useState(null)
  const [userStatus, setUserStatus] =
    useState<LocationType.LocationDocumentsType>(null)
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false)
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false)
  const [events, setEvents] = useState<Events.EventsType>(null)
  const [friendsLocations, setFriendsLocations] = useState<
    LocationType.LocationDocumentsType[]
  >([])
  const [currentEvent, setCurrentEvent] = useState(null)
  const [filters, setFilters] = useState({ showEvents: true, showUsers: true })

  const fetchEvents = useCallback(async () => {
    try {
      const currentDate = new Date()
      const data: Events.EventsType = await databases.listDocuments(
        'hp_db',
        'events',
        [
          Query.limit(1000),
          Query.orderAsc('date'),
          Query.greaterThanEqual('dateUntil', currentDate.toISOString()),
          Query.or([
            Query.equal('locationZoneMethod', 'circle'),
            Query.equal('locationZoneMethod', 'polygon'),
          ]),
        ]
      )
      setEvents(data)
    } catch (error) {
      showAlert('FAILED', i18n.t('location.map.failedToFetchEvents'))
      Sentry.captureException(error)
    }
  }, [])

  const fetchUserLocations = useCallback(async () => {
    try {
      const data: LocationType.LocationType = await databases.listDocuments(
        'hp_db',
        'locations',
        [Query.limit(1000)]
      )
      const promises = data.documents.map(async (doc) => {
        if (current?.$id === doc.$id) {
          setUserStatus(doc)
        }
        const userData: UserData.UserDataDocumentsType =
          await databases.getDocument('hp_db', 'userdata', doc.$id)
        return { ...doc, userData }
      })
      const results = await Promise.all(promises)
      setFriendsLocations(results)
    } catch (error) {
      showAlert('FAILED', i18n.t('location.map.failedToFetchLocations'))
      Sentry.captureException(error)
    }
  }, [current])

  const onRefresh = useCallback(() => {
    fetchUserLocations().then(() => fetchEvents().then())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const intervalId = setInterval(onRefresh, 10000)
    return () => clearInterval(intervalId)
  }, [onRefresh])

  useEffect(() => {
    let watcher = null
    const startWatching = async () => {
      let { status } = await Location.getForegroundPermissionsAsync()
      if (status !== 'granted') {
        //setModalOpen(true)
        return
      } else {
        watcher = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 10000,
            distanceInterval: 10,
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

  const handleLocationButtonPress = useCallback(() => {
    if (userLocation) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      })
    }
  }, [userLocation])

  const getUserAvatar = useCallback((avatarId: string) => {
    return `https://api.headpat.place/v1/storage/buckets/avatars/files/${avatarId}/preview?project=hp-main&width=100&height=100`
  }, [])

  useFocusEffect(
    useCallback(() => {
      onRefresh()
      return () => {
        setUserStatus(null)
      }
    }, [current, onRefresh])
  )

  const sanitizedDescription = useMemo(
    () => sanitizeHtml(currentEvent?.description),
    [currentEvent?.description]
  )

  return (
    <View style={styles.container}>
      <LocationFrontPermissionModal
        openModal={modalOpen}
        setOpenModal={setModalOpen}
      />
      <FiltersModal
        openModal={filtersOpen}
        setOpenModal={setFiltersOpen}
        filters={filters}
        setFilters={setFilters}
      />
      <SettingsModal
        openModal={settingsOpen}
        setOpenModal={setSettingsOpen}
        userStatus={userStatus}
        setUserStatus={setUserStatus}
        current={current}
      />

      <Dialog>
        <DialogContent className={'sm:w-[1500px]'}>
          <DialogTitle>{currentEvent?.title}</DialogTitle>
          <HTMLView
            value={sanitizedDescription}
            stylesheet={{
              p: { color: theme },
              a: { color: 'hsl(208, 100%, 50%)' },
            }}
            textComponentProps={{ style: { color: theme } }}
          />
          <DialogFooter>
            <View>
              <Text>
                Until: {formatDateLocale(new Date(currentEvent?.dateUntil))}
              </Text>
              <Text>
                Start: {formatDateLocale(new Date(currentEvent?.date))}
              </Text>
            </View>
          </DialogFooter>
        </DialogContent>

        <MapView
          ref={mapRef}
          style={styles.map}
          provider={
            Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
          }
          showsUserLocation={Platform.OS === 'android' ? true : !userStatus}
        >
          {filters.showUsers &&
            friendsLocations?.map((user, index: number) => {
              const latitude = user?.lat
              const longitude = user?.long
              if (latitude && longitude) {
                return (
                  <Marker
                    key={index}
                    coordinate={{ latitude, longitude }}
                    title={user?.userData?.displayName || 'Unknown'}
                    description={user?.status || user?.userData?.status || ''}
                  >
                    <TouchableOpacity>
                      <Avatar
                        alt={user?.userData?.displayName || 'Unknown'}
                        className={'rounded-xl'}
                        style={{
                          borderWidth: 2,
                          borderColor: user?.statusColor,
                        }}
                      >
                        <AvatarImage
                          source={{
                            uri: getUserAvatar(user?.userData?.avatarId),
                          }}
                        />
                        <AvatarFallback className={'rounded-xl'}>
                          <Text>
                            {user?.userData?.displayName
                              ? user?.userData?.displayName.charAt(0)
                              : 'U'}
                          </Text>
                        </AvatarFallback>
                      </Avatar>
                    </TouchableOpacity>
                  </Marker>
                )
              }
              return null
            })}

          {filters.showEvents &&
            events?.documents.map((event, index) => {
              if (event?.locationZoneMethod === 'polygon') {
                const coords = event?.coordinates.map((coord) => {
                  const [latitude, longitude] = coord.split(',').map(Number)
                  return { latitude, longitude }
                })
                if (coords?.length)
                  return (
                    <DialogTrigger key={index} asChild>
                      <Polygon
                        key={index}
                        coordinates={coords}
                        tappable={true}
                        onPress={() => setCurrentEvent(event)}
                        fillColor="rgba(100, 200, 200, 0.5)"
                        strokeColor="rgba(255,0,0,0.5)"
                      />
                    </DialogTrigger>
                  )
              } else if (event?.locationZoneMethod === 'circle') {
                const [centerLatitude, centerLongitude] = event?.coordinates[0]
                  .split(',')
                  .map(Number)
                const polygonCoords = generatePolygonCoords(
                  centerLatitude,
                  centerLongitude,
                  event?.circleRadius
                )
                if (polygonCoords.length)
                  return (
                    <DialogTrigger key={index} asChild>
                      <Polygon
                        key={index}
                        coordinates={polygonCoords}
                        tappable={true}
                        onPress={() => setCurrentEvent(event)}
                        fillColor="rgba(100, 200, 200, 0.5)"
                        strokeColor="rgba(255,0,0,0.5)"
                      />
                    </DialogTrigger>
                  )
              }
            })}
        </MapView>
        <View style={styles.filterButton}>
          <TouchableOpacity
            className={
              'justify-center items-center bg-white h-14 w-14 rounded-full shadow'
            }
            onPress={() => setFiltersOpen(true)}
          >
            <FilterIcon size={24} color={'black'} />
          </TouchableOpacity>
        </View>
        {userStatus && (
          <View style={styles.settingsButton}>
            <TouchableOpacity
              className={
                'justify-center items-center bg-white h-14 w-14 rounded-full shadow'
              }
              onPress={() => setSettingsOpen(true)}
            >
              <SettingsIcon size={24} color={'black'} />
            </TouchableOpacity>
          </View>
        )}
        {userLocation && Platform.OS === 'ios' && (
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  locationButton: {
    position: 'absolute',
    bottom: 20,
    right: 10,
    borderRadius: 50,
    overflow: 'hidden',
  },
  filterButton: {
    position: 'absolute',
    top: 60,
    right: 10,
    borderRadius: 50,
    overflow: 'hidden',
  },
  settingsButton: {
    position: 'absolute',
    top: 120,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: { borderRadius: 20, padding: 10, elevation: 2 },
  buttonClose: { backgroundColor: '#2196F3' },
  textStyle: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  modalText: { marginBottom: 15, textAlign: 'center' },
})
