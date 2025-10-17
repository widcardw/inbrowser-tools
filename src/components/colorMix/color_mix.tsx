import { createSignal, createMemo, type Component } from 'solid-js'

const ColorMixer: Component = () => {
  const [startColor, setStartColor] = createSignal('#ff0000')
  const [endColor, setEndColor] = createSignal('#0000ff')
  const [alpha, setAlpha] = createSignal(0.5)

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const interpolate = (start: number, end: number, t: number) => {
    return Math.round(start + (end - start) * t)
  }

  const mixedColor = createMemo(() => {
    const startRgb = hexToRgb(startColor())
    const endRgb = hexToRgb(endColor())
    
    if (!startRgb || !endRgb) return '#000000'
    
    const r = interpolate(startRgb.r, endRgb.r, alpha())
    const g = interpolate(startRgb.g, endRgb.g, alpha())
    const b = interpolate(startRgb.b, endRgb.b, alpha())
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  })

  return (
    <div class="container">
      <div class="input-section">
        <label class="block text-sm font-medium mb-2">Start Color</label>
        <div class="flex items-center space-x-2">
          <input
            type="color"
            value={startColor()}
            onInput={(e) => setStartColor(e.currentTarget.value)}
            class="w-16 h-10 border-2 border-secondary rounded cursor-pointer"
            style="background-color: transparent;"
          />
          <input
            type="text"
            value={startColor()}
            onInput={(e) => setStartColor(e.currentTarget.value)}
            class="text-input"
            placeholder="#ff0000"
          />
        </div>
      </div>

      <div class="input-section">
        <label class="block text-sm font-medium mb-2">End Color</label>
        <div class="flex items-center space-x-2">
          <input
            type="color"
            value={endColor()}
            onInput={(e) => setEndColor(e.currentTarget.value)}
            class="w-16 h-10 border-2 border-secondary rounded cursor-pointer"
            style="background-color: transparent;"
          />
          <input
            type="text"
            value={endColor()}
            onInput={(e) => setEndColor(e.currentTarget.value)}
            class="text-input"
            placeholder="#0000ff"
          />
        </div>
      </div>

      <div class="input-section">
        <label class="block text-sm font-medium mb-2">
          Alpha: {alpha().toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={alpha()}
          onInput={(e) => setAlpha(parseFloat(e.currentTarget.value))}
          class="w-full h-2 bg-secondary rounded-lgcursor-pointer"
        />
      </div>

      <div class="output-section">
        <label class="block text-sm font-medium mb-2">Mixed Color</label>
        <div class="flex items-center space-x-2">
          <div
            class="w-16 h-10 border-2 border-secondary rounded cursor-pointer"
            style={{ 'background-color': mixedColor() }}
          />
          <input
            type="text"
            value={mixedColor()}
            readOnly
            class="text-input"
            style="background-color: hsla(var(--secondary), 0.1);"
          />
        </div>
      </div>
    </div>
  )
}

export default ColorMixer
