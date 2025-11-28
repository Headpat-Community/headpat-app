import { useFocusEffect } from "@react-navigation/core";
import { captureException } from "@sentry/react-native";
import { FlashList } from "@shopify/flash-list";
import {
	type InfiniteData,
	useInfiniteQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";
import { RefreshControl, View } from "react-native";
import { Query } from "react-native-appwrite";
import { ScrollView } from "react-native-gesture-handler";
import { useAlertModal } from "~/components/contexts/AlertModalProvider";
import AnnouncementItem from "~/components/FlatlistItems/AnnouncementItem";
import { i18n } from "~/components/system/i18n";
import { Text } from "~/components/ui/text";
import { H1 } from "~/components/ui/typography";
import SlowInternet from "~/components/views/SlowInternet";
import { databases } from "~/lib/appwrite-client";
import type {
	AnnouncementDataType,
	AnnouncementDocumentsType,
} from "~/lib/types/collections";

const PAGE_SIZE = 50;

interface AnnouncementPage {
	total: number;
	rows: AnnouncementDocumentsType[];
}

export default function AnnouncementsPage() {
	const { showAlert } = useAlertModal();
	const queryClient = useQueryClient();

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isRefetching } =
		useInfiniteQuery<
			AnnouncementPage,
			Error,
			InfiniteData<AnnouncementPage>,
			string[],
			number
		>({
			queryKey: ["announcements"],
			queryFn: async ({ pageParam = 0 }) => {
				try {
					const currentDate = new Date();
					const queries = [
						Query.orderAsc("validUntil"),
						Query.greaterThanEqual("validUntil", currentDate.toISOString()),
						Query.limit(PAGE_SIZE),
						Query.offset(pageParam),
					];

					const data: AnnouncementDataType = await databases.listRows({
						databaseId: "hp_db",
						tableId: "announcements",
						queries: queries,
					});

					return {
						total: data.total,
						rows: data.rows,
					};
				} catch (error) {
					console.error("Error fetching announcements:", error);
					showAlert(
						"FAILED",
						"Failed to fetch announcements. Please try again later.",
					);
					captureException(error);
					return {
						total: 0,
						rows: [],
					};
				}
			},
			getNextPageParam: (lastPage, allPages) => {
				return lastPage.rows.length === PAGE_SIZE
					? allPages.length * PAGE_SIZE
					: undefined;
			},
			initialPageParam: 0,
			staleTime: 1000 * 60 * 5, // 5 minutes
		});

	const onRefresh = useCallback(() => {
		void queryClient.invalidateQueries({ queryKey: ["announcements"] });
	}, [queryClient]);

	useFocusEffect(
		useCallback(() => {
			onRefresh();
		}, [onRefresh]),
	);

	const renderItem = useCallback(
		({ item }: { item: AnnouncementDocumentsType }) => (
			<AnnouncementItem announcement={item} />
		),
		[],
	);

	const keyExtractor = useCallback(
		(item: AnnouncementDocumentsType) => item.$id,
		[],
	);

	const announcements = data?.pages[0];
	const allDocuments = data?.pages.flatMap((page) => page.rows) ?? [];

	if (isRefetching && !announcements) {
		return <SlowInternet />;
	}

	if ((!isRefetching && announcements?.total === 0) || !announcements) {
		return (
			<ScrollView
				refreshControl={
					<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
				}
				contentInsetAdjustmentBehavior={"automatic"}
			>
				<View className={"flex h-full flex-1 items-center justify-center"}>
					<View className={"gap-6 p-4 text-center"}>
						<H1 className={"text-2xl font-semibold"}>Empty here..</H1>
						<Text className={"text-muted-foreground"}>
							Sorry, there are no announcements available at the moment.
						</Text>
					</View>
				</View>
			</ScrollView>
		);
	}

	return (
		<View style={{ flex: 1 }}>
			<FlashList
				data={!isRefetching ? allDocuments : []}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				onRefresh={onRefresh}
				refreshing={isRefetching}
				contentContainerStyle={{ padding: 8 }}
				onEndReached={() => {
					if (hasNextPage && !isFetchingNextPage) {
						void fetchNextPage();
					}
				}}
				onEndReachedThreshold={0.5}
				contentInsetAdjustmentBehavior={"automatic"}
				ListFooterComponent={
					isFetchingNextPage ? <Text>{i18n.t("main.loading")}</Text> : null
				}
			/>
		</View>
	);
}
