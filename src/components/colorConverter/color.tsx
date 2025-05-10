import { createSignal, type JSX } from 'solid-js'
import './styles.css'
import ClipboardCopy from '~/components/copy/ClipboardCopy'

const ColorConverter: () => JSX.Element = () => {
  // 定义十六进制颜色值信号
  const [hexColor, setHexColor] = createSignal('#000000')
  // 定义十进制 RGB 数字信号
  const [rgbNumbers, setRgbNumbers] = createSignal('0, 0, 0')
  // 定义 HSL 颜色值信号
  const [hslColor, setHslColor] = createSignal('0, 0%, 0%')

  // 从 rgbNumbers 信号中解构出 r, g, b
  const [r, g, b] = rgbNumbers().split(',').map(Number)
  const [red, setRed] = createSignal(r)
  const [green, setGreen] = createSignal(g)
  const [blue, setBlue] = createSignal(b)

  // 十六进制转十进制 RGB
  const hexToRgb = (hex: string) => {
    hex = hex.replace(/^(#|0x)/, '')
    const bigint = Number.parseInt(hex, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    setRgbNumbers(`${r}, ${g}, ${b}`)
    setRed(r)
    setGreen(g)
    setBlue(b)
    rgbToHsl(`${r}, ${g}, ${b}`)
  }

  // 十进制 RGB 转十六进制
  const rgbToHex = (rgb: string) => {
    const [r, g, b] = rgb.split(',').map(Number)
    if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
      const hex = `#${[r, g, b]
        .map((x) => {
          if (x === undefined || x < 0 || x > 255) {
            return '00'
          }
          const hex = x.toString(16)
          return hex.padStart(2, '0')
        })
        .join('')}`
      setHexColor(hex)
      setRed(r)
      setGreen(g)
      setBlue(b)
      rgbToHsl(rgb)
    }
  }

  // 十进制 RGB 转 HSL
  const rgbToHsl = (rgb: string) => {
    const [r, g, b] = rgb.split(',').map((x) => Number(x) / 255)
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h = Math.round((h / 6) * 360)
      s = Math.round(s * 100)
    }
    const hsl = `${h}, ${s}%, ${Math.round(l * 100)}%`
    setHslColor(hsl)
  }

  // 滑动条更新 RGB 值
  const updateRgbFromSlider = () => {
    const r = red()
    const g = green()
    const b = blue()
    setRgbNumbers(`${r}, ${g}, ${b}`)
    rgbToHex(`${r}, ${g}, ${b}`)
  }

  // 颜色选择器更新值
  const updateFromColorPicker = (color: string) => {
    setHexColor(color)
    hexToRgb(color)
  }

  return (
    <div class="color-converter">
      <div class="conversion-row grid md:grid-cols-3 gap-4">
        <div class="input-group">
          <label for="hexInput">HEX</label>
          <div class="input-with-copy">
            <input
              type="text"
              id="hexInput"
              value={hexColor()}
              onInput={(e) => {
                setHexColor(e.currentTarget.value)
                hexToRgb(e.currentTarget.value)
              }}
            />
            <ClipboardCopy textToCopy={hexColor()}>Copy</ClipboardCopy>
          </div>
        </div>
        <div class="input-group">
          <label for="rgbInput">RGB</label>
          <div class="input-with-copy">
            <input
              type="text"
              id="rgbInput"
              value={rgbNumbers()}
              onInput={(e) => {
                setRgbNumbers(e.currentTarget.value)
                rgbToHex(e.currentTarget.value)
              }}
            />
            <ClipboardCopy textToCopy={rgbNumbers()}>Copy</ClipboardCopy>
          </div>
        </div>
        <div class="input-group">
          <label for="hslInput">HSL</label>
          <div class="input-with-copy">
            <input
              type="text"
              id="hslInput"
              value={hslColor()}
              readOnly
            />
            <ClipboardCopy textToCopy={hslColor()}>Copy</ClipboardCopy>
          </div>
        </div>
      </div>
      {/* 添加 R, G, B 滑动条 */}
      <div class="slider-group md:grid md:grid-cols-3 md:gap-4">
        <label>
          R: {red()}
          <input
            type="range"
            min="0"
            max="255"
            value={red()}
            onInput={(e) => {
              setRed(Number(e.currentTarget.value))
              updateRgbFromSlider()
            }}
          />
        </label>
        <label>
          G: {green()}
          <input
            type="range"
            min="0"
            max="255"
            value={green()}
            onInput={(e) => {
              setGreen(Number(e.currentTarget.value))
              updateRgbFromSlider()
            }}
          />
        </label>
        <label>
          B: {blue()}
          <input
            type="range"
            min="0"
            max="255"
            value={blue()}
            onInput={(e) => {
              setBlue(Number(e.currentTarget.value))
              updateRgbFromSlider()
            }}
          />
        </label>
      </div>
      {/* 颜色选择器 */}
      <input
        class="color-picker"
        type="color"
        value={hexColor()}
        onInput={(e) => {
          updateFromColorPicker(e.currentTarget.value)
        }}
      />
    </div>
  )
}

export default ColorConverter
