import { Alert, Platform, ToastAndroid } from "react-native";

export function toast(msg: string) {
	if (Platform.OS === "android") {
		ToastAndroid.show(msg, ToastAndroid.SHORT);
	} else {
		Alert.alert(msg);
	}
}
