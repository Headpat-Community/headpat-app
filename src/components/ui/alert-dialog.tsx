import * as React from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import * as AlertDialogPrimitive from '~/components/primitives/alert-dialog'
import { buttonTextVariants, buttonVariants } from '~/components/ui/button'
import { TextClassContext } from '~/components/ui/text'
import { cn } from '~/lib/utils'

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlayWeb = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  const { open } = AlertDialogPrimitive.useRootContext()
  return (
    <AlertDialogPrimitive.Overlay
      style={StyleSheet.absoluteFill}
      className={cn(
        'z-50 flex items-center justify-center bg-black/80 p-2',
        open ? 'web:animate-in web:fade-in-0' : 'web:animate-out web:fade-out-0',
        className,
      )}
      {...props}
      ref={ref}
    />
  )
})

AlertDialogOverlayWeb.displayName = 'AlertDialogOverlayWeb'

const AlertDialogOverlayNative = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, children, ...props }, ref) => {
  return (
    <AlertDialogPrimitive.Overlay
      style={StyleSheet.absoluteFill}
      className={cn('z-50 flex items-center justify-center bg-black/80 p-2', className)}
      {...props}
      ref={ref}
      asChild
    >
      <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(150)}>
        {children}
      </Animated.View>
    </AlertDialogPrimitive.Overlay>
  )
})

AlertDialogOverlayNative.displayName = 'AlertDialogOverlayNative'

const AlertDialogOverlay = Platform.select({
  web: AlertDialogOverlayWeb,
  default: AlertDialogOverlayNative,
})

const AlertDialogContent = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => {
  const { open } = AlertDialogPrimitive.useRootContext()

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay>
        <AlertDialogPrimitive.Content
          ref={ref}
          className={cn(
            'z-50 max-w-lg gap-4 rounded-lg border border-border bg-background p-6 shadow-lg shadow-foreground/10 web:duration-200 rounded-radius',
            open
              ? 'web:animate-in web:fade-in-0 web:zoom-in-95'
              : 'web:animate-out web:fade-out-0 web:zoom-out-95',
            className,
          )}
          {...props}
        />
      </AlertDialogOverlay>
    </AlertDialogPortal>
  )
})
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof View>) => (
  <View className={cn('flex flex-col gap-2', className)} {...props} />
)
AlertDialogHeader.displayName = 'AlertDialogHeader'

const AlertDialogFooter = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof View>) => (
  <View
    className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
    {...props}
  />
)
AlertDialogFooter.displayName = 'AlertDialogFooter'

const AlertDialogTitle = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn('native:text-xl text-lg font-semibold text-foreground', className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn('native:text-base text-sm text-muted-foreground', className)}
    {...props}
  />
))
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <TextClassContext.Provider value={buttonTextVariants({ className })}>
    <AlertDialogPrimitive.Action ref={ref} className={cn(buttonVariants(), className)} {...props} />
  </TextClassContext.Provider>
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <TextClassContext.Provider value={buttonTextVariants({ className, variant: 'outline' })}>
    <AlertDialogPrimitive.Cancel
      ref={ref}
      className={cn(buttonVariants({ variant: 'outline', className }))}
      {...props}
    />
  </TextClassContext.Provider>
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
