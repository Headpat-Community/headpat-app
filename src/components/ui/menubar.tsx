import { Check, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react-native'
import * as React from 'react'
import { Platform, Text, View } from 'react-native'
import * as MenubarPrimitive from '~/components/primitives/menubar'
import { TextClassContext } from '~/components/ui/text'
import { cn } from '~/lib/utils'

const MenubarMenu = MenubarPrimitive.Menu

const MenubarGroup = MenubarPrimitive.Group

const MenubarPortal = MenubarPrimitive.Portal

const MenubarSub = MenubarPrimitive.Sub

const MenubarRadioGroup = MenubarPrimitive.RadioGroup

const Menubar = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      'native:h-12 flex h-10 flex-row items-center space-x-1 rounded-md border border-border bg-background p-1',
      className,
    )}
    {...props}
  />
))
Menubar.displayName = MenubarPrimitive.Root.displayName

const MenubarTrigger = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const { value } = MenubarPrimitive.useRootContext()
  const { value: itemValue } = MenubarPrimitive.useMenuContext()

  return (
    <MenubarPrimitive.Trigger
      ref={ref}
      className={cn(
        'native:h-10 native:px-5 native:py-0 flex flex-row items-center rounded-sm px-3 py-1.5 text-sm font-medium active:bg-accent web:cursor-default web:select-none web:outline-none web:focus:bg-accent web:focus:text-accent-foreground',
        value === itemValue && 'bg-accent text-accent-foreground',
        className,
      )}
      {...props}
    />
  )
})
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

const MenubarSubTrigger = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean
  } & { children: React.ReactNode }
>(({ className, inset, children, ...props }, ref) => {
  const { open } = MenubarPrimitive.useSubContext()
  const Icon = Platform.OS === 'web' ? ChevronRight : open ? ChevronUp : ChevronDown
  return (
    <TextClassContext.Provider
      value={cn(
        'native:text-lg select-none text-sm text-primary',
        open && 'native:text-accent-foreground',
      )}
    >
      <MenubarPrimitive.SubTrigger
        ref={ref}
        className={cn(
          'native:py-2 flex flex-row items-center gap-2 rounded-sm px-2 py-1.5 active:bg-accent web:cursor-default web:select-none web:outline-none web:hover:bg-accent web:focus:bg-accent',
          open && 'bg-accent',
          inset && 'pl-8',
          className,
        )}
        {...props}
      >
        {children}
        <Icon size={18} className="ml-auto text-foreground" />
      </MenubarPrimitive.SubTrigger>
    </TextClassContext.Provider>
  )
})
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName

const MenubarSubContent = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => {
  const { open } = MenubarPrimitive.useSubContext()
  return (
    <MenubarPrimitive.SubContent
      ref={ref}
      className={cn(
        'z-50 mt-1 min-w-32 overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md shadow-foreground/5 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        open
          ? 'web:animate-in web:fade-in-0 web:zoom-in-95'
          : 'web:animate-out web:fade-out-0 web:zoom-out',
        className,
      )}
      {...props}
    />
  )
})
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName

const MenubarContent = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(({ className, ...props }, ref) => {
  const { value } = MenubarPrimitive.useRootContext()
  const { value: itemValue } = MenubarPrimitive.useMenuContext()
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        className={cn(
          'z-50 min-w-32 overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md shadow-foreground/5',
          value === itemValue
            ? 'web:animate-in web:fade-in-0 web:zoom-in-95'
            : 'web:animate-out web:fade-out-0 web:zoom-out-95',
          className,
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
})
MenubarContent.displayName = MenubarPrimitive.Content.displayName

const MenubarItem = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <TextClassContext.Provider value="select-none text-sm native:text-lg text-popover-foreground web:group-focus:text-accent-foreground">
    <MenubarPrimitive.Item
      ref={ref}
      className={cn(
        'native:py-2 group relative flex flex-row items-center gap-2 rounded-sm px-2 py-1.5 active:bg-accent web:cursor-default web:outline-none web:hover:bg-accent web:focus:bg-accent',
        inset && 'pl-8',
        props.disabled && 'opacity-50 web:pointer-events-none',
        className,
      )}
      {...props}
    />
  </TextClassContext.Provider>
))
MenubarItem.displayName = MenubarPrimitive.Item.displayName

const MenubarCheckboxItem = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem> & {
    children: React.ReactNode
  }
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'web:group native:py-2 relative flex flex-row items-center rounded-sm py-1.5 pl-8 pr-2 active:bg-accent web:cursor-default web:outline-none web:focus:bg-accent',
      props.disabled && 'opacity-50 web:pointer-events-none',
      className,
    )}
    checked={checked}
    {...props}
  >
    <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check size={14} strokeWidth={3} className="text-foreground" />
      </MenubarPrimitive.ItemIndicator>
    </View>
    {children}
  </MenubarPrimitive.CheckboxItem>
))
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName

const MenubarRadioItem = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem> & { children: React.ReactNode }
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      'web:group native:py-2 relative flex flex-row items-center rounded-sm py-1.5 pl-8 pr-2 active:bg-accent web:cursor-default web:outline-none web:focus:bg-accent',
      props.disabled && 'opacity-50 web:pointer-events-none',
      className,
    )}
    {...props}
  >
    <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <View className="h-2 w-2 rounded-full bg-foreground" />
      </MenubarPrimitive.ItemIndicator>
    </View>
    {children}
  </MenubarPrimitive.RadioItem>
))
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName

const MenubarLabel = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(
      'native:text-base px-2 py-1.5 text-sm font-semibold text-foreground web:cursor-default',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
))
MenubarLabel.displayName = MenubarPrimitive.Label.displayName

const MenubarSeparator = React.forwardRef<
  React.ComponentRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-border', className)}
    {...props}
  />
))
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName

const MenubarShortcut = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof Text>) => {
  return (
    <Text
      className={cn(
        'native:text-sm ml-auto text-xs tracking-widest text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}
MenubarShortcut.displayName = 'MenubarShortcut'

export {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
}
