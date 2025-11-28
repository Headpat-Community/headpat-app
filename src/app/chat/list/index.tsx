import { useFocusEffect } from "@react-navigation/core";
import { captureException } from "@sentry/react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useMemo } from "react";
import { FlatList, View } from "react-native";
import { Query } from "react-native-appwrite";
import { useUser } from "~/components/contexts/UserContext";
import FeatureAccess from "~/components/FeatureAccess";
import ConversationItem from "~/components/FlatlistItems/ConversationItem";
import ConversationSearchItem from "~/components/FlatlistItems/ConversationSearchItem";
import { i18n } from "~/components/system/i18n";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { databases } from "~/lib/appwrite-client";
import { useDebounce } from "~/lib/hooks/useDebounce";
import { useRealtimeChat } from "~/lib/hooks/useRealtimeChat";
import type {
	CommunityDocumentsType,
	MessageConversationsDocumentsType,
	UserDataDocumentsType,
} from "~/lib/types/collections";

export default function ConversationsView() {
	const [refreshing, setRefreshing] = React.useState(false);
	const [searchTerm, setSearchTerm] = React.useState("");
	const debouncedSearchTerm = useDebounce(searchTerm, 500);
	const { conversations, fetchInitialData } = useRealtimeChat();
	const { current } = useUser();
	const queryClient = useQueryClient();

	// Memoize the conversation IDs to prevent unnecessary re-renders
	const conversationIds = useMemo(
		() => conversations.map((c) => c.$id),
		[conversations],
	);

	const { data: displayData, isLoading } = useQuery({
		queryKey: ["conversation-display-data", conversationIds],
		queryFn: async () => {
			const newDisplayUsers: Record<string, any> = {};
			const promises = conversations.map(async (conversation) => {
				if (conversation.communityId) {
					const communityData = await queryClient.fetchQuery({
						queryKey: ["community", conversation.communityId],
						queryFn: async () => {
							const response = await databases.getRow({
								databaseId: "hp_db",
								tableId: "community",
								rowId: conversation.communityId,
							});
							return response as unknown as CommunityDocumentsType;
						},
						staleTime: 1000 * 60 * 5, // 5 minutes
					});
					newDisplayUsers[conversation.$id] = {
						isCommunity: true,
						...communityData,
					};
					const otherParticipantId = conversation.participants.find(
						(participant: string) => participant !== current?.$id,
					);
					if (otherParticipantId) {
						const userData = await queryClient.fetchQuery({
							queryKey: ["user", otherParticipantId],
							queryFn: async () => {
								const response = await databases.getRow({
									databaseId: "hp_db",
									tableId: "userdata",
									rowId: otherParticipantId,
								});
								return response as unknown as UserDataDocumentsType;
							},
							staleTime: 1000 * 60 * 5, // 5 minutes
						});
						newDisplayUsers[conversation.$id] = userData;
					}
				}
			});

			await Promise.all(promises);
			return newDisplayUsers;
		},
		enabled: conversations.length > 0,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	const { data: searchResults, isLoading: isSearching } = useQuery({
		queryKey: ["user-search", debouncedSearchTerm],
		queryFn: async () => {
			if (!debouncedSearchTerm) return [];
			try {
				const results = await databases.listRows({
					databaseId: "hp_db",
					tableId: "userdata",
					queries: [Query.contains("profileUrl", debouncedSearchTerm)],
				});
				const userDataResults = await Promise.all(
					results.rows.map(async (user) => {
						return await databases.getRow({
							databaseId: "hp_db",
							tableId: "userdata",
							rowId: user.$id,
						});
					}),
				);
				return userDataResults as unknown as UserDataDocumentsType[];
			} catch (error) {
				captureException(error);
				console.error("Error searching users", error);
				throw error;
			}
		},
		enabled: !!debouncedSearchTerm,
	});

	const refreshData = useCallback(async () => {
		try {
			setRefreshing(true);
			await fetchInitialData();
			await queryClient.invalidateQueries({
				queryKey: ["conversation-display-data"],
			});
		} finally {
			setRefreshing(false);
		}
	}, [fetchInitialData, queryClient]);

	const onRefresh = useCallback(() => {
		void refreshData();
	}, [refreshData]);

	// Reset search and refresh data when screen comes into focus
	useFocusEffect(
		useCallback(() => {
			setSearchTerm("");
			void refreshData();
		}, [refreshData]),
	);

	const renderConversationItem = useCallback(
		({ item }: { item: MessageConversationsDocumentsType }) => (
			<ConversationItem
				item={item}
				displayData={displayData?.[item.$id]}
				isLoading={isLoading}
			/>
		),
		[displayData, isLoading],
	);

	const renderSearchItem = useCallback(
		({ item }: { item: UserDataDocumentsType }) => (
			<ConversationSearchItem item={item} />
		),
		[],
	);

	return (
		<FeatureAccess featureName={"messaging"}>
			<Input
				value={searchTerm}
				onChangeText={setSearchTerm}
				placeholder="Search users..."
				className={"rounded-none"}
			/>
			{searchTerm ? (
				<View>
					{isSearching ? (
						<View>
							<Text>{i18n.t("main.loading")}</Text>
						</View>
					) : (
						<FlatList
							data={searchResults}
							keyExtractor={(item) => item.$id}
							renderItem={renderSearchItem}
						/>
					)}
				</View>
			) : (
				<FlatList
					data={conversations}
					keyExtractor={(item) => item.$id}
					renderItem={renderConversationItem}
					onRefresh={onRefresh}
					refreshing={refreshing}
					numColumns={1}
					contentContainerStyle={{ justifyContent: "space-between" }}
				/>
			)}
		</FeatureAccess>
	);
}
