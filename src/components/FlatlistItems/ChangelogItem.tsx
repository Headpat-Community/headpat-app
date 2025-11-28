import React from "react"
import { Pressable, View } from "react-native"
import type { ChangelogDocumentsType } from "~/lib/types/collections"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { H4 } from "~/components/ui/typography"
import {
  Bug,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Wrench,
} from "lucide-react-native"
import { useColorScheme } from "~/lib/useColorScheme"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"
import { Badge } from "~/components/ui/badge"
import { Text } from "~/components/ui/text"
import HTMLView from "react-native-htmlview"
import sanitize from "sanitize-html"
import { Separator } from "~/components/ui/separator"

const ChangelogItem = React.memo(
  ({
    changelog,
    openVersions,
    toggleVersion,
  }: {
    changelog: ChangelogDocumentsType
    openVersions: string[]
    toggleVersion: (id: string) => void
  }) => {
    const { isDarkColorScheme } = useColorScheme()
    const theme = isDarkColorScheme ? "white" : "black"

    const ChangeIcon = ({
      type,
    }: {
      type: "feature" | "improvement" | "bugfix"
    }) => {
      switch (type) {
        case "feature":
          return <Sparkles className="h-4 w-4" color={"rgb(59 130 246)"} />
        case "improvement":
          return <Wrench className="h-4 w-4" color={"rgb(34 197 94)"} />
        case "bugfix":
          return <Bug className="h-4 w-4" color={"rgb(239 68 68)"} />
        default:
          return null
      }
    }

    return (
      <View className="mx-4 my-2">
        <Card key={changelog.$id}>
          <CardHeader>
            <Collapsible open={openVersions.includes(changelog.$id)}>
              <CollapsibleTrigger asChild>
                <Pressable
                  className="w-full text-left"
                  onPress={() => toggleVersion(changelog.$id)}
                >
                  <View className="flex-row items-center justify-between">
                    <View>
                      <CardTitle className="flex items-center text-2xl">
                        <View className="flex-row items-center">
                          <Badge
                            variant="outline"
                            className={`mr-2 ${
                              changelog.draft ? "border-red-500" : ""
                            }`}
                          >
                            <Text>
                              {changelog.draft
                                ? "Draft"
                                : `v${changelog.version}`}
                            </Text>
                          </Badge>
                          <Text className={"font-bold"}>{changelog.title}</Text>
                        </View>
                      </CardTitle>
                      <CardDescription>
                        <Text>
                          {new Date(changelog.date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </Text>
                      </CardDescription>
                    </View>
                    {openVersions.includes(changelog.$id) ? (
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
          <Collapsible open={openVersions.includes(changelog.$id)}>
            <CollapsibleContent>
              <CardContent>
                <HTMLView
                  value={sanitize(changelog.description)}
                  stylesheet={{
                    p: { color: theme },
                    a: { color: "hsl(208, 100%, 50%)" },
                  }}
                  textComponentProps={{ style: { color: theme } }}
                />
                <View className="space-y-4">
                  {(() => {
                    const platform = changelog.type === "web" ? "Web" : "App"
                    const bugfixes = changelog[`bugfixes${platform}`]
                    const features = changelog[`features${platform}`]
                    const improvements = changelog[`improvements${platform}`]

                    return (
                      (bugfixes.length > 0 ||
                        features.length > 0 ||
                        improvements.length > 0) && (
                        <View key={platform} className="mt-1">
                          <Separator className={"my-4"} />
                          <View className="gap-2">
                            {bugfixes.length > 0 && <H4>Bugfixes</H4>}
                            {bugfixes.map((change: string, index: number) => (
                              <View
                                key={index}
                                className="mr-2 flex-row items-start gap-2"
                              >
                                <ChangeIcon type="bugfix" />
                                <HTMLView
                                  value={sanitize(change)}
                                  style={{
                                    marginTop: 2,
                                  }}
                                  stylesheet={{
                                    p: { color: theme },
                                    a: { color: "hsl(208, 100%, 50%)" },
                                  }}
                                  textComponentProps={{
                                    style: { color: theme },
                                  }}
                                />
                              </View>
                            ))}
                            {features.length > 0 && <H4>Features</H4>}
                            {features.map((change: string, index: number) => (
                              <View
                                key={index}
                                className="mr-2 flex-row items-start gap-2"
                              >
                                <ChangeIcon type="feature" />
                                <HTMLView
                                  value={sanitize(change)}
                                  style={{
                                    marginTop: 2,
                                  }}
                                  stylesheet={{
                                    p: { color: theme },
                                    a: { color: "hsl(208, 100%, 50%)" },
                                  }}
                                  textComponentProps={{
                                    style: { color: theme },
                                  }}
                                />
                              </View>
                            ))}
                            {improvements.length > 0 && <H4>Improvements</H4>}
                            {improvements.map(
                              (change: string, index: number) => (
                                <View
                                  key={index}
                                  className="mr-2 flex-row items-start gap-2"
                                >
                                  <ChangeIcon type="improvement" />
                                  <HTMLView
                                    value={sanitize(change)}
                                    style={{
                                      marginTop: 2,
                                    }}
                                    stylesheet={{
                                      p: { color: theme },
                                      a: { color: "hsl(208, 100%, 50%)" },
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
                  })()}
                </View>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </View>
    )
  }
)

export default ChangelogItem
