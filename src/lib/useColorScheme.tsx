import { useCallback, useEffect, useState } from "react";
import { Uniwind, useUniwind } from "uniwind";
import { setAndroidNavigationBar } from "./android-navigation-bar";

type Theme = "light" | "dark" | "system";

export function useColorScheme() {
	const [isLoading, setIsLoading] = useState(false);
	const { theme, hasAdaptiveThemes } = useUniwind();

	// Initialize theme from storage
	useEffect(() => {
		const initializeTheme = async () => {
			const activeTheme = hasAdaptiveThemes ? "system" : (theme as Theme);
			Uniwind.setTheme(activeTheme);
			await setAndroidNavigationBar(activeTheme as "light" | "dark");
		};
		void initializeTheme();
	}, [hasAdaptiveThemes, theme]);

	const setColorScheme = useCallback(
		async (newTheme: "light" | "dark") => {
			if (isLoading) return;

			setIsLoading(true);
			try {
				// Run all async operations in parallel
				Uniwind.setTheme(newTheme);
				await setAndroidNavigationBar(newTheme);
			} finally {
				setIsLoading(false);
			}
		},
		[isLoading],
	);

	return {
		colorScheme: theme ?? "dark",
		isDarkColorScheme: theme === "dark",
		setColorScheme,
		isLoading,
	};
}
