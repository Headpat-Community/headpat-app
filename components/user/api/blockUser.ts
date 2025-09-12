import { functions } from "~/lib/appwrite-client"
import { ExecutionMethod } from "react-native-appwrite"

export async function blockUser(body: any) {
  try {
    const data = await functions.createExecution({
      functionId: "user-endpoints",
      body: JSON.stringify(body),
      async: false,
      xpath: `/user/prefs`,
      method: ExecutionMethod.POST,
    })
    return JSON.parse(data.responseBody)
  } catch (e) {
    console.error(e)
  }
}
