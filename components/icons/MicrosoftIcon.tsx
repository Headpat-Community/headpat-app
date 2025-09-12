import * as React from "react"

import { Ref } from "react"
import Svg, { Path } from "react-native-svg"
import { IconType } from "~/lib/types/IconTypes"

type SiMicrosoftProps = React.ComponentPropsWithoutRef<"svg"> & {
  /**
   * The title provides an accessible short text description to the SVG
   */
  title?: string
  /**
   * Hex color or color name or "default" to use the default hex for each icon
   */
  color?: string
  /**
   * The size of the Icon.
   */
  size?: string | number
}

const defaultColor = "#5865F2"

const MicrosoftIcon: IconType = React.forwardRef<
  SVGSVGElement,
  SiMicrosoftProps
>(function SiMicrosoft({ color = "currentColor", size = 24 }, ref: Ref<any>) {
  if (color === "default") {
    color = defaultColor
  }

  return (
    <Svg width={size} height={size} fill={color} viewBox="0 0 24 24" ref={ref}>
      <Path d="M0 0v11.408h11.408V0zm12.594 0v11.408H24V0zM0 12.594V24h11.408V12.594zm12.594 0V24H24V12.594z" />
    </Svg>
  )
})

export { MicrosoftIcon as default, defaultColor }
