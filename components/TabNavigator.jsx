import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Ionicons from "react-native-vector-icons/Ionicons";
import { View, Text } from "react-native";
import * as React from "react";

import Gallery from "./gallery";

function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Home Screen</Text>
    </View>
  );
}

function TestScreen() {
  return (
    <View>
      <Gallery />
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarLabel: ({ focused, color, size }) => {
            let labelName;

            if (route.name === "Home") {
              labelName = focused ? "Home" : "Home";
            } else if (route.name === "Test") {
              labelName = focused ? "Test" : "Test";
            } else if (route.name === "Account") {
              labelName = focused ? "Account" : "Account";
            }

            // You can return any component that you like here!
            return <Text style={{ color: color }}>{labelName}</Text>;
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Home") {
              iconName = focused
                ? "ios-information-circle"
                : "ios-information-circle-outline";
            } else if (route.name === "Test") {
              iconName = focused ? "ios-list" : "ios-list-outline";
            }

            // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "tomato",
          tabBarInactiveTintColor: "gray",
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Home View" }}
        />
        <Tab.Screen
          name="Test"
          component={TestScreen}
          options={{ title: "Test View" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
