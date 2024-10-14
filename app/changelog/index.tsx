import React, { useEffect, useState } from 'react'

import sanitize from 'sanitize-html'
import {
  Bug,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Wrench,
} from 'lucide-react-native'
import { Changelog } from '~/lib/types/collections'
import { Pressable, RefreshControl, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible'
import { Separator } from '~/components/ui/separator'
import { Badge } from '~/components/ui/badge'
import { Text } from '~/components/ui/text'
import { H1, H2, H4 } from '~/components/ui/typography'
import { useColorScheme } from '~/lib/useColorScheme'
import { database } from '~/lib/appwrite-client'
import * as Sentry from '@sentry/react-native'
import HTMLView from 'react-native-htmlview'
import { Query } from 'react-native-appwrite'

const ChangeIcon = ({
  type,
}: {
  type: 'feature' | 'improvement' | 'bugfix'
}) => {
  switch (type) {
    case 'feature':
      return <Sparkles className="h-4 w-4" color={'rgb(59 130 246)'} />
    case 'improvement':
      return <Wrench className="h-4 w-4" color={'rgb(34 197 94)'} />
    case 'bugfix':
      return <Bug className="h-4 w-4" color={'rgb(239 68 68)'} />
    default:
      return null
  }
}

export default function ListComponent() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const [openVersions, setOpenVersions] = useState<string[]>([])
  const [changelogData, setChangelogData] =
    useState<Changelog.ChangelogDocumentsType[]>()
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      const changelogData: Changelog.ChangelogType =
        await database.listDocuments('hp_db', 'changelog', [
          Query.orderDesc('version'),
        ])

      setChangelogData(changelogData.documents)
    } catch (error) {
      Sentry.captureException(error)
    } finally {
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchData().then()
  }

  useEffect(() => {
    setRefreshing(true)
    fetchData().then()
  }, [])

  const toggleVersion = (version: string) => {
    setOpenVersions((prev) =>
      prev.includes(version)
        ? prev.filter((v) => v !== version)
        : [...prev, version]
    )
  }

  if (refreshing && (!changelogData || changelogData.length === 0)) {
    return (
      <View className={'flex flex-1 justify-center items-center h-full'}>
        <View className={'p-4 gap-6 text-center'}>
          <H1 className={'text-2xl font-semibold'}>Loading...</H1>
          <Text className={'text-muted-foreground'}>
            Please wait while we fetch the latest updates.
          </Text>
        </View>
      </View>
    )
  }

  if (!refreshing && (!changelogData || changelogData.length === 0)) {
    return (
      <View className={'flex flex-1 justify-center items-center h-full'}>
        <View className={'p-4 gap-6 text-center'}>
          <H1 className={'text-2xl font-semibold'}>Oh no!</H1>
          <Text className={'text-muted-foreground'}>
            Sorry, there are no updates available at the moment.
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View className="h-full">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="gap-6 mt-6 mx-4 mb-6">
          {changelogData.map((release) => (
            <Card key={release.$id}>
              <CardHeader>
                <Collapsible open={openVersions.includes(release.$id)}>
                  <CollapsibleTrigger asChild>
                    <Pressable
                      className="w-full text-left"
                      onPress={() => toggleVersion(release.$id)}
                    >
                      <View className="flex-row justify-between items-center">
                        <View>
                          <CardTitle className="flex items-center text-2xl">
                            <View className="flex-row items-center">
                              <Badge
                                variant="outline"
                                className={`mr-2 ${
                                  release.draft ? 'border-red-500' : ''
                                }`}
                              >
                                <Text>
                                  {release.draft
                                    ? 'Draft'
                                    : `v${release.version}`}
                                </Text>
                              </Badge>
                              <Text className={'font-bold'}>
                                {release.title}
                              </Text>
                            </View>
                          </CardTitle>
                          <CardDescription>
                            <Text>
                              {new Date(release.date).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                }
                              )}
                            </Text>
                          </CardDescription>
                        </View>
                        {openVersions.includes(release.$id) ? (
                          <ChevronUp className="h-4 w-4" color={theme} />
                        ) : (
                          <ChevronDown className="h-4 w-4" color={theme} />
                        )}
                        <Text className="sr-only">Toggle changes</Text>
                      </View>
                    </Pressable>
                  </CollapsibleTrigger>
                </Collapsible>
              </CardHeader>
              <Collapsible open={openVersions.includes(release.$id)}>
                <CollapsibleContent>
                  <CardContent>
                    <HTMLView
                      value={sanitize(release.description)}
                      stylesheet={{
                        p: { color: theme },
                        a: { color: 'hsl(208, 100%, 50%)' },
                      }}
                      textComponentProps={{ style: { color: theme } }}
                    />
                    <View className="space-y-4">
                      {['Web', 'App'].map((platform) => {
                        const bugfixes = release[`bugfixes${platform}`]
                        const features = release[`features${platform}`]
                        const improvements = release[`improvements${platform}`]

                        return (
                          (bugfixes.length > 0 ||
                            features.length > 0 ||
                            improvements.length > 0) && (
                            <View key={platform} className={'mt-6'}>
                              <H2>{platform}</H2>
                              <Separator className={'my-2'} />
                              <View className="gap-2">
                                {bugfixes.length > 0 && <H4>Bugfixes</H4>}
                                {bugfixes.map(
                                  (change: string, index: number) => (
                                    <View
                                      key={index}
                                      className="flex-row items-start gap-2 mr-2"
                                    >
                                      <ChangeIcon type="bugfix" />
                                      <HTMLView
                                        value={sanitize(change)}
                                        style={{
                                          marginTop: 2,
                                        }}
                                        stylesheet={{
                                          p: { color: theme },
                                          a: { color: 'hsl(208, 100%, 50%)' },
                                        }}
                                        textComponentProps={{
                                          style: { color: theme },
                                        }}
                                      />
                                    </View>
                                  )
                                )}
                                {features.length > 0 && <H4>Features</H4>}
                                {features.map(
                                  (change: string, index: number) => (
                                    <View
                                      key={index}
                                      className="flex-row items-start gap-2 mr-2"
                                    >
                                      <ChangeIcon type="feature" />
                                      <HTMLView
                                        value={sanitize(change)}
                                        style={{
                                          marginTop: 2,
                                        }}
                                        stylesheet={{
                                          p: { color: theme },
                                          a: { color: 'hsl(208, 100%, 50%)' },
                                        }}
                                        textComponentProps={{
                                          style: { color: theme },
                                        }}
                                      />
                                    </View>
                                  )
                                )}
                                {improvements.length > 0 && (
                                  <H4>Improvements</H4>
                                )}
                                {improvements.map(
                                  (change: string, index: number) => (
                                    <View
                                      key={index}
                                      className="flex-row items-start gap-2 mr-2"
                                    >
                                      <ChangeIcon type="improvement" />
                                      <HTMLView
                                        value={sanitize(change)}
                                        style={{
                                          marginTop: 2,
                                        }}
                                        stylesheet={{
                                          p: { color: theme },
                                          a: { color: 'hsl(208, 100%, 50%)' },
                                        }}
                                        textComponentProps={{
                                          style: { color: theme },
                                        }}
                                      />
                                    </View>
                                  )
                                )}
                              </View>
                            </View>
                          )
                        )
                      })}
                    </View>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
