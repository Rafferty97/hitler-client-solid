export function RedCross() {
  // Adjustable constants
  const SIZE = 200 // Overall size of the cross
  const STROKE_THICKNESS = 30 // Thickness of the cross strokes
  const COLOR = '#a33' // Color of the cross

  // Calculate positions for X shape
  const strokeOffset = STROKE_THICKNESS / 2

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ display: 'block' }}>
      {/* Diagonal stroke (top-left to bottom-right) */}
      <line
        x1={strokeOffset}
        y1={strokeOffset}
        x2={SIZE - strokeOffset}
        y2={SIZE - strokeOffset}
        stroke={COLOR}
        stroke-width={STROKE_THICKNESS}
        stroke-linecap="butt"
      />

      {/* Diagonal stroke (top-right to bottom-left) */}
      <line
        x1={SIZE - strokeOffset}
        y1={strokeOffset}
        x2={strokeOffset}
        y2={SIZE - strokeOffset}
        stroke={COLOR}
        stroke-width={STROKE_THICKNESS}
        stroke-linecap="butt"
      />
    </svg>
  )
}
