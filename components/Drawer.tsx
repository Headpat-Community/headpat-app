import {
  createDrawerNavigator,
  DrawerNavigationOptions,
} from '@react-navigation/drawer'

import { withLayoutContext } from 'expo-router'
import { EventMapBase, NavigationState } from '@react-navigation/native'

const { Navigator } = createDrawerNavigator()

export const Drawer = withLayoutContext<
  DrawerNavigationOptions,
  typeof Navigator,
  NavigationState, // Replace with the actual type
  EventMapBase // Replace with the actual type
>(Navigator)
