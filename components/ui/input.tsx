import * as React from "react"
import { TextInput } from "react-native"

import { cn } from "~/lib/utils"

const Input = React.forwardRef<
  React.ComponentRef<typeof TextInput>,
  React.ComponentPropsWithoutRef<typeof TextInput>
>(({ className, placeholderClassName, ...props }, ref) => {
  return (
    <TextInput
      ref={ref}
      className={cn(
        "native:h-12 native:text-lg native:leading-[1.25] h-10 rounded-md border border-input bg-background px-3 text-base text-foreground file:border-0 file:bg-transparent file:font-medium placeholder:text-muted-foreground web:flex web:w-full web:py-2 web:ring-offset-background web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 lg:text-sm",
        props.editable === false && "opacity-50 web:cursor-not-allowed",
        className
      )}
      placeholderClassName={cn("text-muted-foreground", placeholderClassName)}
      {...props}
    />
  )
})

Input.displayName = "Input"

export { Input }
