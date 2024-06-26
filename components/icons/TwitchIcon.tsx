import * as React from 'react'

import { IconType } from '~/lib/types/IconTypes'
import Svg, { Path } from 'react-native-svg'
import { LegacyRef } from 'react'

type SiTwitchProps = React.ComponentPropsWithoutRef<'svg'> & {
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

const defaultColor = '#5865F2'

const TwitchIcon: IconType = React.forwardRef<SVGSVGElement, SiTwitchProps>(
  function TwitchIcon(
    { color = 'currentColor', size = 24 },
    ref: LegacyRef<any>
  ) {
    if (color === 'default') {
      color = defaultColor
    }

    return (
      <Svg
        width={size}
        height={size}
        fill={color}
        viewBox="0 0 24 24"
        ref={ref}
      >
        <Path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
      </Svg>
    )
  }
)

export { TwitchIcon as default, defaultColor }
