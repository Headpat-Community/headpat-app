import { ExecutionMethod } from "react-native-appwrite"
import { functions } from "~/lib/appwrite-client"

export async function reportGalleryImage(body: any) {
  try {
    const data = await functions.createExecution({
      functionId: "moderation-endpoints",
      body: JSON.stringify(body),
      async: false,
      xpath: `/moderation/report/gallery`,
      method: ExecutionMethod.POST,
    })
    return JSON.parse(data.responseBody)
  } catch (e) {
    console.error(e)
  }
}
