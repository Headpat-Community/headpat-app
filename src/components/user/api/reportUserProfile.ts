import { functions } from "~/lib/appwrite-client"
import { ExecutionMethod } from "react-native-appwrite"

export async function reportUserProfile(body: any) {
  try {
    const data = await functions.createExecution({
      functionId: "moderation-endpoints",
      body: JSON.stringify(body),
      async: false,
      xpath: `/moderation/report/profile`,
      method: ExecutionMethod.POST,
    })
    return JSON.parse(data.responseBody)
  } catch (e) {
    console.error(e)
  }
}
