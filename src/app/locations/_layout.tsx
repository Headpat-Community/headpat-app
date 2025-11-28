import { Tabs } from "expo-router";
import {
	CalendarRangeIcon,
	MapIcon,
	PersonStandingIcon,
} from "lucide-react-native";
import { useUser } from "~/components/contexts/UserContext";
import FeatureAccess from "~/components/FeatureAccess";
import { i18n } from "~/components/system/i18n";

export default function TabsLayout() {
	const { current } = useUser();
	return (
		<FeatureAccess featureName={"locationSharing"}>
			<Tabs backBehavior={"initialRoute"}>
				<Tabs.Screen
					name="index"
					options={{
						title: i18n.t("screens.map"),
						tabBarIcon({ color, size }) {
							return <MapIcon color={color} size={size} />;
						},
						headerShown: false,
					}}
				/>
				<Tabs.Screen
					name="share"
					options={{
						title: i18n.t("screens.shareMyLocation"),
						tabBarIcon({ color, size }) {
							return <PersonStandingIcon color={color} size={size} />;
						},
						href: current?.$id ? `/locations/share/` : null,
						headerShown: false,
					}}
				/>
				<Tabs.Screen
					name="nearbyEvents"
					options={{
						title: i18n.t("location.nearbyEvents.title"),
						tabBarIcon({ color, size }) {
							return <CalendarRangeIcon color={color} size={size} />;
						},
						href: "/locations/nearbyEvents",
						headerShown: false,
					}}
				/>
				<Tabs.Screen
					name="addSharing"
					options={{
						href: null,
						headerShown: false,
					}}
				/>
			</Tabs>
		</FeatureAccess>
	);
}
