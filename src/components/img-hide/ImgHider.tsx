import {
  type Component,
  Show,
  createEffect,
  createMemo,
  createSignal,
  on,
} from 'solid-js'
import {
  adjustPixelBrightnessContrast,
  calcFactors,
  calcFileSize,
  isUndefined,
  loadImage,
  toTargetSize,
} from './utils'
import '~/styles/tools-common.css'
import './index.css'

const ImgHider: Component = () => {
  const [img1, setImg1] = createSignal<File>()
  const [img2, setImg2] = createSignal<File>()

  const [oriBrightness, setOriBrightness] = createSignal(100)
  const [hidBrightness, setHidBrightness] = createSignal(90)
  const [oriContrast, setOriContrast] = createSignal(20)
  const [hidContrast, setHidContrast] = createSignal(100)
  const [canvasEl, setCanvasEl] = createSignal<HTMLCanvasElement>()
  const [img1Content, setImg1Content] = createSignal<HTMLImageElement>()
  const [img2Content, setImg2Content] = createSignal<HTMLImageElement>()
  const [warningText, setWarningText] = createSignal('')
  const [imgGenerated, setImgGenerated] = createSignal(false)
  const [copyText, setCopyText] = createSignal('复制到剪贴板')

  createEffect(
    on(img1, async () => {
      const i1 = await loadImage(img1())
      setImg1Content(i1)
    }),
  )
  createEffect(
    on(img2, async () => {
      const i2 = await loadImage(img2())
      setImg2Content(i2)
    }),
  )
  const sizeMatch = createMemo(() => {
    const i1 = img1Content()
    const i2 = img2Content()
    if (isUndefined(i1) || isUndefined(i2)) return null
    return i1.height === i2.height && i1.width === i2.width
  })

  const [mixChoice, setMixChoice] = createSignal('scale')

  function drawImgStretch() {
    const canvas = canvasEl()
    if (isUndefined(canvas)) {
      setWarningText('未找到 canvas 元素')
      return
    }
    const i1 = img1Content()
    const i2 = img2Content()
    if (isUndefined(i1) || isUndefined(i2)) {
      setWarningText('图片未上传')
      return
    }
    const width = i1.width
    const height = i1.height
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (ctx === null) {
      setWarningText('未找到 canvas 2d context')
      return
    }
    const oriCanvas = drawOnNewCanvas(i1, width, height)
    let hidCanvas: HTMLCanvasElement | null = null
    if (mixChoice() === 'stretch') {
      hidCanvas = drawOnNewCanvas(i2, width, height)
    } else if (mixChoice() === 'scale') {
      const [x, y, w, h] = toTargetSize(i2.width, i2.height, width, height)
      hidCanvas = drawOnNewCanvasXywh(i2, x, y, w, h, width, height)
    } else {
      setWarningText('请选择一种缩放方式')
      return
    }
    const oriData = oriCanvas
      .getContext('2d')!
      .getImageData(0, 0, width, height)
    const hidData = hidCanvas
      .getContext('2d')!
      .getImageData(0, 0, width, height)

    const result = ctx.createImageData(width, height)
    for (let i = 0; i < oriData?.data.length; i += 4) {
      const pixelIndex = i / 4
      const x = pixelIndex % width
      const y = Math.floor(pixelIndex / width)

      const oriR = oriData.data[i]
      const oriG = oriData.data[i + 1]
      const oriB = oriData.data[i + 2]

      const hidR = hidData.data[i]
      const hidG = hidData.data[i + 1]
      const hidB = hidData.data[i + 2]

      let r = 0
      let g = 0
      let b = 0

      const [
        oriBrightnessFactor,
        hidBrightnessFactor,
        oriContrastFactor,
        hidContrastFactor,
      ] = calcFactors(
        oriBrightness(),
        hidBrightness(),
        oriContrast(),
        hidBrightness(),
      )

      if ((x + y) % 2 === 0) {
        // 原图像素
        const result_ori = adjustPixelBrightnessContrast(
          oriR,
          oriG,
          oriB,
          oriBrightnessFactor,
          oriContrastFactor,
        )
        r = result_ori[0]
        g = result_ori[1]
        b = result_ori[2]
      } else {
        // 隐藏图像素
        const result_hid = adjustPixelBrightnessContrast(
          hidR,
          hidG,
          hidB,
          hidBrightnessFactor,
          hidContrastFactor,
        )
        r = result_hid[0]
        g = result_hid[1]
        b = result_hid[2]
      }

      result.data[i] = r
      result.data[i + 1] = g
      result.data[i + 2] = b
      result.data[i + 3] = 255
    }

    ctx.putImageData(result, 0, 0)
    setImgGenerated(true)
  }

  function drawOnNewCanvasXywh(
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    canvasW: number,
    canvasH: number,
  ) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = canvasW
    canvas.height = canvasH
    // ctx?.drawImage(img, x, y, w, h)
    ctx?.drawImage(img, 0, 0, img.width, img.height, x, y, w, h)
    return canvas
  }

  function drawOnNewCanvas(
    img: HTMLImageElement,
    width: number,
    height: number,
  ) {
    return drawOnNewCanvasXywh(img, 0, 0, width, height, width, height)
  }

  function downloadImg() {
    if (!imgGenerated()) {
      setWarningText('图像尚未生成')
      return
    }
    const canvas = canvasEl()
    if (isUndefined(canvas)) {
      setWarningText('未找到 canvas')
      return
    }
    const url = canvas.toDataURL('image/png')
    const downloadEl = document.createElement('a')
    downloadEl.href = url
    downloadEl.download = 'img.png'
    downloadEl.click()
  }

  async function getBlobFromCanvas(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Canvas toBlob 操作执行失败'))
        }
      })
    })
  }

  async function copyImage() {
    if (!imgGenerated()) {
      setWarningText('图像尚未生成')
      return
    }
    const canvas = canvasEl()
    if (isUndefined(canvas)) {
      setWarningText('未找到 canvas')
      return
    }
    try {
      setCopyText('正在复制')
      const blob = await getBlobFromCanvas(canvas)
      // 用 blob 及其类型创建 ClipboardItem 并写入数组
      const data = [new ClipboardItem({ [blob.type]: blob })]
      // 写入剪贴板
      await navigator.clipboard.write(data)
      setCopyText('已复制')
      setTimeout(() => setCopyText('复制到剪贴板'), 2000)
    } catch (error) {
      setWarningText(String(error))
      console.log(error)
    }
  }

  return (
    <div class="space-y-4">
      <div class="img-input-grid grid grid-cols-3 gap-2 items-center">
        <span>原图</span>
        <input
          id="ori-img"
          type="file"
          accept="images/*"
          onChange={(e) => setImg1(e.target.files?.[0])}
        />
        <span>{img1() ? calcFileSize(img1()?.size) : ''}</span>
        <span>隐藏图</span>
        <input
          id="hid-img"
          type="file"
          accept="images/*"
          onChange={(e) => setImg2(e.target.files?.[0])}
        />
        <span>{img2() ? calcFileSize(img2()?.size) : ''}</span>
      </div>

      <div class="param-grid grid grid-cols-3 gap-2 items-center">
        <span>原图亮度提高</span>
        <input
          value={oriBrightness()}
          class="text-right text-input"
          onChange={(e) => setOriBrightness(Number.parseInt(e.target.value))}
        />
        <span>%</span>
        <span>隐藏图亮度降低</span>
        <input
          value={hidBrightness()}
          class="text-right text-input"
          onChange={(e) => setHidBrightness(Number.parseInt(e.target.value))}
        />
        <span>%</span>
        <span>原图对比度</span>
        <input
          value={oriContrast()}
          class="text-right text-input"
          onChange={(e) => setOriContrast(Number.parseInt(e.target.value))}
        />
        <span>%</span>
        <span>隐藏图对比度</span>
        <input
          value={hidContrast()}
          class="text-right text-input"
          onChange={(e) => setHidContrast(Number.parseInt(e.target.value))}
        />
        <span>%</span>
      </div>
      <button disabled class="btn">
        {sizeMatch() === null
          ? '尚未上传'
          : sizeMatch()
            ? '图像大小一致'
            : '图像大小不一致'}
      </button>
      <div class="flex gap-4">
        <label class="radio-btn">
          <input
            type="radio"
            name="mix-choice"
            value="stretch"
            onClick={(e) => setMixChoice((e.target as HTMLInputElement).value)}
          />{' '}
          拉伸以填充
        </label>
        <label class="radio-btn">
          <input
            type="radio"
            name="mix-choice"
            value="scale"
            onClick={(e) => setMixChoice((e.target as HTMLInputElement).value)}
            checked
          />{' '}
          缩放以适应
        </label>
      </div>
      <div class=" space-y-2 md:flex items-center gap-4">
        <button class="btn primary" onClick={drawImgStretch}>
          生成图片
        </button>
        <Show when={warningText().trim() !== ''}>
          <button class="btn bg-red" disabled>
            {warningText()}
          </button>
        </Show>
        <button
          class="btn primary"
          disabled={!imgGenerated()}
          onClick={downloadImg}
        >
          下载图片
        </button>
        <button
          class="btn primary"
          disabled={!imgGenerated()}
          onClick={copyImage}
        >
          {copyText()}
        </button>
      </div>
      <canvas ref={(el) => setCanvasEl(el)} class="w-800px max-w-full" />
    </div>
  )
}

export default ImgHider
