import { functions } from '~/lib/appwrite-client'
import { ExecutionMethod } from 'react-native-appwrite'

export async function removeFollow(followerId: string) {
  const data = await functions.createExecution(
    'user-endpoints',
    '',
    false,
    `/user/follow?followerId=${followerId}`,
    ExecutionMethod.DELETE
  )

  return JSON.parse(data.responseBody)
}
