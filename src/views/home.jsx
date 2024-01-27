import React from 'react';
import { View, ScrollView, StyleSheet, Image, Dimensions } from 'react-native';
//import { Header } from '../components/header';
import { Skeleton, Text } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';

const Homepage = () => {
  const windowWidth = Dimensions.get('window').width;

  return (
    <>
      {/*<Header title='Skeleton' view='skeleton' />*/}
      <ScrollView>
        <View style={styles.container}>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Image
              source={require('../images/Headpat_3_Years_celebration.png')}
              style={{
                width: windowWidth * 0.9, // 90% of screen width
                height: windowWidth * 0.9 * (448 / 1280), // maintain aspect ratio
              }}
              resizeMode='contain'
            />
          </View>
          <Text>Wave (With Linear Gradient)</Text>
          <View style={{ marginVertical: 8 }}>
            <Skeleton
              animation='wave'
              height={200}
              LinearGradientComponent={LinearGradient}
            />
          </View>
          <Text>Pulse Animation</Text>
          <View style={{ marginVertical: 8 }}>
            <Skeleton height={200} animation='pulse' />
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Homepage;
