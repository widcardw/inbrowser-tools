function calcFileSize(s: number | null | undefined) {
  if (s === undefined || s == null) return ''

  if (Number.isNaN(s) || !Number.isFinite(s)) return 'Cannot calc file size'

  if (s < 2048) return `${s} B`

  if (s < 2097152) return `${(s / 1024).toFixed(1)} KB`

  if (s < 2147483648) return `${(s / 1048576).toFixed(1)} MB`

  return `${(s / 1073741824).toFixed(1)} GB`
}

async function loadImage(
  file: File | null | undefined,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (file === null || file === undefined) return null
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = URL.createObjectURL(file)
  })
}

function adjustPixelBrightnessContrast(
  r: number,
  g: number,
  b: number,
  brightnessFactor: number,
  contrastFactor: number,
) {
  // 先应用亮度调整
  const brightR = r * brightnessFactor
  const brightG = g * brightnessFactor
  const brightB = b * brightnessFactor

  // 再应用对比度调整 (对比度公式: (pixel - 128) * contrast + 128)
  const adjustContrast = (v: number) =>
    Math.min(255, Math.max(0, (v - 128) * contrastFactor + 128))

  return [
    adjustContrast(brightR),
    adjustContrast(brightG),
    adjustContrast(brightB),
  ]
}

function calcFactors(
  originalBrightnessBoost: number,
  hiddenBrightnessReduce: number,
  originalContrastPercent: number,
  hiddenContrastPercent: number,
) {
  const originalBrightnessFactor = 1 + originalBrightnessBoost / 100
  const hiddenBrightnessFactor = 1 - hiddenBrightnessReduce / 100
  const originalContrastFactor = originalContrastPercent / 100
  const hiddenContrastFactor = hiddenContrastPercent / 100
  return [
    originalBrightnessFactor,
    hiddenBrightnessFactor,
    originalContrastFactor,
    hiddenContrastFactor,
  ]
}

function isUndefined(obj: any): obj is undefined {
  return obj === undefined || obj === null
}

function toTargetSize(
  width: number,
  height: number,
  targetWidth: number,
  targetHeight: number,
) {
  const targetAspect = targetWidth / targetHeight
  const aspect = width / height
  const sub = targetAspect - aspect
  if (Math.abs(sub) < 1e-4) {
    return [0, 0, targetWidth, targetHeight]
  }

  if (sub > 0) {
    // 隐藏图需要在左右计算 margin
    const h = targetHeight
    const w = (width * targetHeight) / height
    const x = (targetWidth - w) / 2
    const y = 0
    return [x, y, w, h]
  }

  // 隐藏图需要在上下计算 margin
  const w = targetWidth
  const h = (height * targetWidth) / width
  const x = 0
  const y = (targetHeight - h) / 2
  return [x, y, w, h]
}

export {
  calcFileSize,
  loadImage,
  adjustPixelBrightnessContrast,
  calcFactors,
  isUndefined,
  toTargetSize,
}
