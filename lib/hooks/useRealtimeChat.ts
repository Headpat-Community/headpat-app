import { useEffect, useState } from "react"
import { Query, RealtimeResponseEvent } from "react-native-appwrite"
import { client, databases } from "~/lib/appwrite-client"
import {
  MessageConversationsDocumentsType,
  MessageConversationsType,
  MessagesDocumentsType,
} from "~/lib/types/collections"

export function useRealtimeChat() {
  const [conversations, setConversations] = useState<
    MessageConversationsDocumentsType[]
  >([])
  const [messages, setMessages] = useState<MessagesDocumentsType[]>([])

  useEffect(() => {
    const unsubscribe = client.subscribe(
      [
        "databases.hp_db.collections.messages-conversations.documents",
        "databases.hp_db.collections.messages.documents",
      ],
      (response: RealtimeResponseEvent<any>) => {
        const { events, payload } = response

        if (
          events.some((event) =>
            event.includes("messages-conversations.documents")
          )
        ) {
          handleConversationEvent(
            events,
            payload as MessageConversationsDocumentsType
          )
        }

        if (events.some((event) => event.includes("messages.documents"))) {
          handleMessageEvent(events, payload as MessagesDocumentsType)
        }
      }
    )

    // Fetch initial data
    void fetchInitialData().then()

    return () => {
      unsubscribe()
    }
  }, [])

  const handleConversationEvent = (
    events: string[],
    payload: MessageConversationsDocumentsType
  ) => {
    if (events.some((event) => event.endsWith(".create"))) {
      // Ensure userdata is present
      setConversations((prevConversations) => [...prevConversations, payload])
    } else if (events.some((event) => event.endsWith(".update"))) {
      // Ensure userdata is present
      setConversations((prevConversations) => {
        const index = prevConversations.findIndex(
          (conversation) => conversation.$id === payload.$id
        )
        if (index !== -1) {
          const newConversations = [...prevConversations]
          newConversations[index] = payload
          return newConversations
        }
        return prevConversations
      })
    } else if (events.some((event) => event.endsWith(".delete"))) {
      setConversations((prevConversations) =>
        prevConversations.filter(
          (conversation) => conversation.$id !== payload.$id
        )
      )
    }
  }

  const handleMessageEvent = (
    events: string[],
    payload: MessagesDocumentsType
  ) => {
    setMessages((prevMessages) => {
      let updatedMessages = [...prevMessages]

      if (events.some((event) => event.endsWith(".create"))) {
        updatedMessages.push(payload)
      } else if (events.some((event) => event.endsWith(".update"))) {
        const index = updatedMessages.findIndex(
          (message) => message.$id === payload.$id
        )
        if (index !== -1) {
          updatedMessages[index] = payload
        }
      } else if (events.some((event) => event.endsWith(".delete"))) {
        updatedMessages = updatedMessages.filter(
          (message) => message.$id !== payload.$id
        )
      }

      return updatedMessages
    })

    // Update the lastMessage and sort conversations
    setConversations((prevConversations) => {
      const updatedConversations = prevConversations.map((conversation) => {
        if (conversation.$id === payload.conversationId) {
          return {
            ...conversation,
            lastMessage: payload.body,
            $updatedAt: payload.$updatedAt, // Ensure $updatedAt is updated
          }
        }
        return conversation
      })

      // Sort conversations by the latest message timestamp
      return updatedConversations.sort(
        (a, b) =>
          new Date(b.$updatedAt).getTime() - new Date(a.$updatedAt).getTime()
      )
    })
  }

  const fetchInitialData = async () => {
    const initialConversations: MessageConversationsType =
      await databases.listRows({
        databaseId: "hp_db",
        tableId: "messages-conversations",
        queries: [Query.orderDesc("$updatedAt"), Query.limit(500)],
      })
    setConversations(initialConversations.rows)
  }

  return {
    conversations,
    messages,
    setConversations,
    setMessages,
    fetchInitialData,
  }
}
