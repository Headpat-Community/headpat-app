import type { ForceMountable } from "~/components/primitives/types"

interface RootContext {
  type: "single" | "multiple"
  value: (string | undefined) | string[]
  onValueChange: (value: string | string[] | undefined) => void
  collapsible: boolean
  disabled?: boolean
}

interface SingleRootProps {
  type: "single"
  defaultValue?: string | undefined
  value?: string | undefined
  onValueChange?: (value: string | undefined) => void
}

interface MultipleRootProps {
  type: "multiple"
  defaultValue?: string[]
  value?: string[]
  onValueChange?: (value: string[]) => void
}

type AccordionRootProps = (SingleRootProps | MultipleRootProps) & {
  defaultValue?: string | string[]
  disabled?: boolean
  collapsible?: boolean
  /**
   * Platform: WEB ONLY
   */
  dir?: "ltr" | "rtl"
  /**
   * Platform: WEB ONLY
   */
  orientation?: "vertical" | "horizontal"
}

interface AccordionItemProps {
  value: string
  disabled?: boolean
}
type AccordionContentProps = ForceMountable

export type {
  AccordionContentProps,
  AccordionItemProps,
  AccordionRootProps,
  RootContext,
}
