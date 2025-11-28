import { ExecutionMethod } from "react-native-appwrite";
import { functions } from "~/lib/appwrite-client";

export async function addFollow(followerId: string) {
	const data = await functions.createExecution({
		functionId: "community-endpoints",
		async: false,
		xpath: `/community/follow?communityId=${followerId}`,
		method: ExecutionMethod.POST,
	});

	return JSON.parse(data.responseBody);
}
