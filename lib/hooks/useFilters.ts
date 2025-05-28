import AsyncStorage from '@react-native-async-storage/async-storage'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const FILTERS_KEY = '@headpat/filters'

interface Filters {
  showEvents: boolean
  showUsers: boolean
}

const defaultFilters: Filters = {
  showEvents: true,
  showUsers: true
}

export function useFilters() {
  const queryClient = useQueryClient()

  const { data: filters = defaultFilters } = useQuery({
    queryKey: ['filters'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(FILTERS_KEY)
      return stored ? JSON.parse(stored) : defaultFilters
    }
  })

  const updateMutation = useMutation({
    mutationFn: async (newFilters: Filters) => {
      await AsyncStorage.setItem(FILTERS_KEY, JSON.stringify(newFilters))
      return newFilters
    },
    onSuccess: (newFilters) => {
      queryClient.setQueryData(['filters'], newFilters)
    }
  })

  const setFilters = (newFilters: Filters | ((prev: Filters) => Filters)) => {
    const updatedFilters =
      typeof newFilters === 'function' ? newFilters(filters) : newFilters
    updateMutation.mutate(updatedFilters)
  }

  return {
    filters,
    setFilters
  }
}
