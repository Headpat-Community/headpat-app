import { useFocusEffect } from "@react-navigation/core";
import * as Sentry from "@sentry/react-native";
import { makeRedirectUri } from "expo-auth-session";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { View } from "react-native";
import { OAuthProvider } from "react-native-appwrite";
import { ScrollView } from "react-native-gesture-handler";
import { z } from "zod";
import { useAlertModal } from "~/components/contexts/AlertModalProvider";
import { useUser } from "~/components/contexts/UserContext";
import AppleIcon from "~/components/icons/AppleIcon";
import DiscordIcon from "~/components/icons/DiscordIcon";
import GithubIcon from "~/components/icons/GithubIcon";
import GoogleIcon from "~/components/icons/GoogleIcon";
import MicrosoftIcon from "~/components/icons/MicrosoftIcon";
import SpotifyIcon from "~/components/icons/SpotifyIcon";
import TwitchIcon from "~/components/icons/TwitchIcon";
import { SocialLoginGrid } from "~/components/SocialLoginGrid";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { Muted } from "~/components/ui/typography";
import { account } from "~/lib/appwrite-client";

const loginSchema = z.object({
	email: z.string().min(1, "E-Mail is required").email("Invalid email format"),
	password: z.string().min(8, "Password should be at least 8 characters"),
});

export default function LoginScreen() {
	const { current, login, loginOAuth } = useUser();
	const { showAlert } = useAlertModal();

	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");

	useFocusEffect(
		React.useCallback(() => {
			if (current) {
				router.back();
			}
		}, [current]),
	);

	const handleEmailLogin = async () => {
		try {
			const validatedData = loginSchema.parse({
				email,
				password,
			});
			await login(validatedData.email, validatedData.password);
		} catch (error) {
			if (error instanceof z.ZodError) {
				showAlert("FAILED", error.message);
			} else if ((error as any).type === "user_invalid_credentials") {
				showAlert("FAILED", "E-Mail or Password incorrect.");
			} else if ((error as any).type === "user_blocked") {
				showAlert("FAILED", "User is blocked.");
			} else {
				showAlert("FAILED", "E-Mail or Password incorrect.");
			}
		}
	};

	// Create deep link that works across Expo environments
	// Ensure localhost is used for the hostname to validation error for success/failure URLs
	const deeplink = new URL(makeRedirectUri({ preferLocalhost: true }));
	const scheme = `${deeplink.protocol}//`;

	WebBrowser.maybeCompleteAuthSession();
	const handleOAuth2Login = async (provider: OAuthProvider) => {
		try {
			const data = account.createOAuth2Token({
				provider,
				success: `${deeplink}`,
				failure: `${deeplink}`,
			});
			const res = await WebBrowser.openAuthSessionAsync(String(data), scheme);

			if (res.type === "success") {
				const url = new URL(res.url);
				const secret = url.searchParams.get("secret");
				const userId = url.searchParams.get("userId");

				if (secret && userId) {
					await loginOAuth(userId, secret);
				} else {
					showAlert("FAILED", "An error occurred.");
				}

				router.replace("/");
			}
		} catch (error) {
			showAlert("FAILED", "An error occurred.");
			Sentry.captureException(error);
		}
	};

	return (
		<ScrollView>
			<View className="flex-1 items-center justify-center">
				<View className="native:pb-24 max-w-md gap-4 p-4">
					<View className="gap-1">
						<Muted className="text-center text-base">
							Enter you data below to login your account
						</Muted>
						<Muted className="text-center text-base">No account yet?</Muted>
						<Button
							variant={"outline"}
							onPress={() => router.replace("/register")}
						>
							<Text>Register</Text>
						</Button>
					</View>
					<Input
						textContentType={"emailAddress"}
						placeholder={"Email"}
						onChangeText={setEmail}
					/>
					<Input
						textContentType={"password"}
						placeholder={"Password"}
						secureTextEntry={true}
						onChangeText={setPassword}
					/>

					<Button onPress={() => void handleEmailLogin()}>
						<Text>Login</Text>
					</Button>

					<SocialLoginGrid
						onLogin={(provider) => void handleOAuth2Login(provider)}
						buttons={[
							{
								provider: OAuthProvider.Discord,
								color: "#5865F2",
								Icon: DiscordIcon,
								title: "Discord",
							},
							{
								provider: OAuthProvider.Oidc,
								color: "#005953",
								Image: require("~/assets/logos/eurofurence.webp"),
								title: "Eurofurence",
							},
							{
								provider: OAuthProvider.Github,
								color: "#24292F",
								Icon: GithubIcon,
								title: "GitHub",
							},
							{
								provider: OAuthProvider.Apple,
								color: "#000000",
								Icon: AppleIcon,
								title: "Apple",
							},
							{
								provider: OAuthProvider.Google,
								color: "#131314",
								Icon: GoogleIcon,
								title: "Google",
							},
							{
								provider: OAuthProvider.Spotify,
								color: "#1DB954",
								Icon: SpotifyIcon,
								title: "Spotify",
							},
							{
								provider: OAuthProvider.Microsoft,
								color: "#01A6F0",
								Icon: MicrosoftIcon,
								title: "Microsoft",
							},
							{
								provider: OAuthProvider.Twitch,
								color: "#6441A5",
								Icon: TwitchIcon,
								title: "Twitch",
							},
						]}
					/>
				</View>
			</View>
		</ScrollView>
	);
}
