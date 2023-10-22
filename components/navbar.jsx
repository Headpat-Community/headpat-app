import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const BottomNavBar = () => {
    return (
        <View className="flex-row justify-between p-4 bg-gray-800">
            <TouchableOpacity className="flex-1 justify-center items-center">
                <Text className="text-white">Home</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 justify-center items-center">
                <Text className="text-white">Search</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 justify-center items-center">
                <Text className="text-white">Profile</Text>
            </TouchableOpacity>
            <StatusBar style="auto" />
        </View>
    );
};

export default BottomNavBar;