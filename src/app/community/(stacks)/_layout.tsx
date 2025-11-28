import { Stack } from "expo-router";

function _layout() {
	return (
		<Stack
			screenOptions={{ headerShown: false }}
			initialRouteName="[communityId]/index"
		>
			<Stack.Screen name="[communityId]/index" />
			<Stack.Screen name="[communityId]/relationships/followers/index" />
			<Stack.Screen name="[communityId]/admin" />
		</Stack>
	);
}

export default _layout;
