import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerNavigator from './drawerNavigator';
import Homepage from '../views/home';
import Skeleton from '../views/skeleton';

const Drawer = createDrawerNavigator();

function RootNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen name='Home' component={Homepage} />
        <Drawer.Screen name='Skeleton' component={Skeleton} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
