import { captureException } from "@sentry/react-native"
import { ExecutionMethod } from "react-native-appwrite"
import { functions } from "~/lib/appwrite-client"

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
    captureException(e)
    console.error(e)
  }
}
