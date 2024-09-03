import { functions } from '~/lib/appwrite-client'
import { ExecutionMethod } from 'react-native-appwrite'

export async function reportGalleryImage(body: any) {
  try {
    const data = await functions.createExecution(
      'user-endpoints',
      JSON.stringify(body),
      false,
      `/user/moderation/report/gallery`,
      ExecutionMethod.POST
    )
    return JSON.parse(data.responseBody)
  } catch (e) {
    console.error(e)
  }
}
