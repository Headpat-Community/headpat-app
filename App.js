import * as React from 'react';
import { Button, View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/components/rootNavigation';

function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button
        onPress={() => navigation.navigate('Notifications')}
        title='Go to notifications'
      />
    </View>
  );
}

const Drawer = createDrawerNavigator();

export default function App() {
  return <RootNavigator />;
}
