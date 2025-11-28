import * as React from "react"
import { Platform, StyleSheet } from "react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { TextClassContext } from "~/components/ui/text"
import * as PopoverPrimitive from "~/components/primitives/popover"
import { cn } from "~/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Overlay
        style={Platform.OS !== "web" ? StyleSheet.absoluteFill : undefined}
      >
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut}>
          <TextClassContext.Provider value="text-popover-foreground">
            <PopoverPrimitive.Content
              ref={ref}
              align={align}
              sideOffset={sideOffset}
              className={cn(
                "z-50 w-72 rounded-md border border-border bg-popover p-4 shadow-md shadow-foreground/5 web:cursor-auto web:outline-none web:animate-in web:fade-in-0 web:zoom-in-95 web:data-[side=bottom]:slide-in-from-top-2 web:data-[side=left]:slide-in-from-right-2 web:data-[side=right]:slide-in-from-left-2 web:data-[side=top]:slide-in-from-bottom-2",
                className
              )}
              {...props}
            />
          </TextClassContext.Provider>
        </Animated.View>
      </PopoverPrimitive.Overlay>
    </PopoverPrimitive.Portal>
  )
})
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverContent, PopoverTrigger }
