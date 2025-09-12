import { functions } from "~/lib/appwrite-client"
import { ExecutionMethod } from "react-native-appwrite"

export async function removeFollow(followerId: string) {
  const data = await functions.createExecution({
    functionId: "user-endpoints",
    async: false,
    xpath: `/user/follow?followerId=${followerId}`,
    method: ExecutionMethod.DELETE,
  })

  return JSON.parse(data.responseBody)
}
