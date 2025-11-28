import { useFocusEffect } from "@react-navigation/core";
import { router, Stack } from "expo-router";
import React from "react";
import { useUser } from "~/components/contexts/UserContext";

const _layout = () => {
	const { current } = useUser();

	useFocusEffect(
		React.useCallback(() => {
			if (!current) {
				router.push("/login");
			}
		}, [current]),
	);

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="userprofile" />
			<Stack.Screen name="security/index" />
		</Stack>
	);
};

export default _layout;
