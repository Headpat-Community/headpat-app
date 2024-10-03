import { functions } from '~/lib/appwrite-client'
import { ExecutionMethod } from 'react-native-appwrite'

export async function reportCommunity(body: any) {
  try {
    const data = await functions.createExecution(
      'moderation-endpoints',
      JSON.stringify(body),
      false,
      `/moderation/report/community`,
      ExecutionMethod.POST
    )
    return JSON.parse(data.responseBody)
  } catch (e) {
    console.error(e)
  }
}
