import { useFocusEffect } from "@react-navigation/core";
import * as Sentry from "@sentry/react-native";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { ScrollView, Text, View } from "react-native";
import { ExecutionMethod } from "react-native-appwrite";
import { useAlertModal } from "~/components/contexts/AlertModalProvider";
import { useUser } from "~/components/contexts/UserContext";
import NotificationItem from "~/components/FlatlistItems/NotificationItem";
import { i18n } from "~/components/system/i18n";
import { Skeleton } from "~/components/ui/skeleton";
import { functions } from "~/lib/appwrite-client";
import type { NotificationsDocumentsType } from "~/lib/types/collections";

export default function NotificationsPage() {
	const { showAlert } = useAlertModal();
	const { current } = useUser();
	const queryClient = useQueryClient();

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isRefetching } =
		useInfiniteQuery<NotificationsDocumentsType[]>({
			queryKey: ["notifications", current?.$id],
			queryFn: async ({ pageParam = 0 }) => {
				try {
					const data = await functions.createExecution({
						functionId: "user-endpoints",
						async: false,
						xpath: `/user/notifications?offset=${Number(pageParam)}&limit=20`,
						method: ExecutionMethod.GET,
					});
					const response: NotificationsDocumentsType[] = JSON.parse(
						data.responseBody,
					);

					return response;
				} catch (error) {
					console.error(error);
					showAlert(
						"FAILED",
						"Failed to fetch notifications. Please try again later.",
					);
					Sentry.captureException(error);
					return [];
				}
			},
			getNextPageParam: (lastPage, allPages) => {
				return lastPage.length === 20 ? allPages.length * 20 : undefined;
			},
			initialPageParam: 0,
			staleTime: 1000 * 60 * 5, // 5 minutes
			enabled: !!current?.$id,
		});

	const onRefresh = useCallback(() => {
		void queryClient.invalidateQueries({
			queryKey: ["notifications", current?.$id],
		});
	}, [queryClient, current?.$id]);

	useFocusEffect(
		React.useCallback(() => {
			if (!current) {
				router.push("/login");
			}
		}, [current]),
	);

	const renderItem = useCallback(
		({ item }: { item: NotificationsDocumentsType }) => (
			<NotificationItem notification={item} />
		),
		[],
	);

	const notifications = data?.pages.flat() ?? [];

	if (!notifications.length && !isRefetching)
		return (
			<ScrollView>
				<View style={{ flexDirection: "row", flexWrap: "wrap" }}>
					{Array.from({ length: 8 }).map((_, index) => (
						<View
							className={"m-4 flex w-full flex-row items-center px-4"}
							key={`skeleton-${index.toString()}`}
						>
							<Skeleton className="h-[100px] w-[100px] rounded-3xl" />
							<View className={"ml-6 flex flex-col gap-3"}>
								<Skeleton className="h-[20px] w-[150px] rounded" />
								<Skeleton className="h-[20px] w-[100px] rounded" />
								<View className={"flex flex-row items-center gap-4"}>
									<View className={"flex flex-row items-center gap-2"}>
										<Skeleton className="h-[20px] w-[20px] rounded-full" />
										<Skeleton className="h-[20px] w-[50px] rounded" />
									</View>
								</View>
							</View>
						</View>
					))}
				</View>
			</ScrollView>
		);

	return (
		<FlashList
			data={notifications}
			keyExtractor={(item) => item.$id}
			renderItem={renderItem}
			onRefresh={onRefresh}
			refreshing={isRefetching}
			numColumns={1}
			onEndReached={() => {
				if (hasNextPage && !isFetchingNextPage) {
					void fetchNextPage();
				}
			}}
			onEndReachedThreshold={0.5}
			contentContainerClassName="mt-2 pb-8"
			ListFooterComponent={
				isFetchingNextPage && hasNextPage ? (
					<Text>{i18n.t("main.loading")}</Text>
				) : null
			}
		/>
	);
}
