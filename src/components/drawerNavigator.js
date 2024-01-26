import React from 'react';
import { View, Image } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { Text, Divider, Switch, useTheme } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';

function CustomContentComponent(props) {
  const { updateTheme, theme } = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        height: '100%',
        backgroundColor: theme?.colors?.grey5,
      }}
      edges={['right', 'left', 'bottom']}
    >
      <View
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          source={require('../images/logo.png')}
          style={{ width: '70%', height: 100, tintColor: '#397af8' }}
          resizeMode='contain'
        />
      </View>

      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          paddingLeft: 25,
          paddingBottom: 5,
        }}
      >
        <Text
          style={{
            marginTop: 3,
          }}
        >
          Dark Mode
        </Text>

        <Switch
          style={{
            position: 'absolute',
            right: 5,
          }}
          value={theme.mode === 'dark'}
          onValueChange={() => {
            updateTheme((myTheme) => ({
              mode: myTheme.mode === 'dark' ? 'light' : 'dark',
            }));
          }}
        />
      </View>
      <Divider style={{ marginTop: 15 }} />
      <View style={{ marginLeft: 10, width: '100%' }}>
        <DrawerItemList {...props} />
      </View>
    </SafeAreaView>
  );
}

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <CustomContentComponent {...props} />
    </DrawerContentScrollView>
  );
}

export default CustomDrawerContent;
