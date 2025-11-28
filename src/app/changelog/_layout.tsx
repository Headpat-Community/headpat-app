import { Tabs } from "expo-router";
import { MonitorIcon, SmartphoneIcon } from "lucide-react-native";

export default function TabsLayout() {
	return (
		<Tabs>
			<Tabs.Screen
				name="mobile"
				options={{
					title: "Mobile",
					tabBarIcon({ color, size }) {
						return <SmartphoneIcon color={color} size={size} />;
					},
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name="web"
				options={{
					title: "Web",
					tabBarIcon({ color, size }) {
						return <MonitorIcon color={color} size={size} />;
					},
					headerShown: false,
				}}
			/>
		</Tabs>
	);
}
