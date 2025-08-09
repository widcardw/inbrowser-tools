import { type Component, Show, createEffect, createSignal, on } from 'solid-js'
import { isUndefined, loadImage } from './utils'
import '~/styles/tools-common.css'

class ExposureAdjuster {
  canvas: HTMLCanvasElement
  private gl!: WebGLRenderingContext
  private exposure!: number
  private imageTexture!: WebGLTexture | null
  private program!: WebGLProgram
  private positionBuffer!: WebGLBuffer
  private texCoordBuffer!: WebGLBuffer
  private positionAttributeLocation!: GLint
  private texCoordAttributeLocation!: GLint
  private exposureUniformLocation!: WebGLUniformLocation | null

  constructor(canvas: HTMLCanvasElement, image: string) {
    this.canvas = canvas
    this.gl = this.canvas.getContext('webgl')!

    if (!this.gl) {
      alert('WebGL not supported in your browser!')
      return
    }

    this.exposure = 0.0
    // this.imageTexture = null
    // this.program = null
    // this.positionBuffer = null
    // this.texCoordBuffer = null

    this.initShaders()
    this.initBuffers()

    // Load default image
    this.loadImage(image)
  }

  initShaders() {
    // Vertex shader source
    const vsSource = `
      attribute vec2 aPosition;
      attribute vec2 aTexCoord;
      varying vec2 vTexCoord;

      void main() {
          gl_Position = vec4(aPosition, 0.0, 1.0);
          vTexCoord = aTexCoord;
      }
    `

    // Fragment shader source
    const fsSource = `
      precision mediump float;
      varying vec2 vTexCoord;
      uniform sampler2D uImage;
      uniform float uExposure;

      // sRGB to linear conversion
      vec3 sRGBToLinear(vec3 sRGB) {
          vec3 linearRGB = pow(sRGB, vec3(2.2));
          return linearRGB;
      }

      // Linear to sRGB conversion
      vec3 linearToSRGB(vec3 linearRGB) {
          vec3 sRGB = pow(linearRGB, vec3(1.0/2.2));
          return sRGB;
      }

      void main() {
          // Sample the texture
          vec4 color = texture2D(uImage, vTexCoord);

          // Convert to linear space
          vec3 linearRGB = sRGBToLinear(color.rgb);

          // Apply exposure adjustment
          float exposureFactor = pow(2.0, uExposure);
          linearRGB *= exposureFactor;

          // Convert back to sRGB
          vec3 sRGB = linearToSRGB(linearRGB);

          // Output the final color
          gl_FragColor = vec4(sRGB, color.a);
      }
    `

    // Compile shaders
    const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource)!
    const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource)!

    // Create shader program
    this.program = this.gl.createProgram()
    this.gl.attachShader(this.program, vertexShader)
    this.gl.attachShader(this.program, fragmentShader)
    this.gl.linkProgram(this.program)

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.error(
        'Unable to initialize shader program:',
        this.gl.getProgramInfoLog(this.program),
      )
      return
    }

    // Get attribute and uniform locations
    this.positionAttributeLocation = this.gl.getAttribLocation(
      this.program,
      'aPosition',
    )
    this.texCoordAttributeLocation = this.gl.getAttribLocation(
      this.program,
      'aTexCoord',
    )
    this.exposureUniformLocation = this.gl.getUniformLocation(
      this.program,
      'uExposure',
    )!
  }

  loadShader(type: GLenum, source: string) {
    const shader = this.gl.createShader(type)!
    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error(
        'An error occurred compiling the shaders:',
        this.gl.getShaderInfoLog(shader),
      )
      this.gl.deleteShader(shader)
      return null
    }

    return shader
  }

  initBuffers() {
    // Create a buffer for the rectangle's positions
    this.positionBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer)

    // Rectangle vertices (covering entire canvas)
    const positions = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]

    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(positions),
      this.gl.STATIC_DRAW,
    )

    // Create a buffer for the texture coordinates
    this.texCoordBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer)

    // Texture coordinates
    const texCoords = [
      0.0,
      1.0, // Bottom left
      1.0,
      1.0, // Bottom right
      0.0,
      0.0, // Top left
      1.0,
      0.0, // Top right
    ]

    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(texCoords),
      this.gl.STATIC_DRAW,
    )
  }

  loadImage(imageSrc: string) {
    const image = new Image()
    image.crossOrigin = 'Anonymous'
    image.onload = () => {
      // Set canvas size to match image
      this.canvas.width = image.width
      this.canvas.height = image.height

      // Create texture
      this.imageTexture = this.gl.createTexture()
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.imageTexture)

      // Set texture parameters
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_S,
        this.gl.CLAMP_TO_EDGE,
      )
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_T,
        this.gl.CLAMP_TO_EDGE,
      )
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MIN_FILTER,
        this.gl.LINEAR,
      )
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MAG_FILTER,
        this.gl.LINEAR,
      )

      // Upload image to texture
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        image,
      )

      // Render with default exposure
      this.render()
    }
    image.src = imageSrc
  }

  render() {
    if (!this.imageTexture) return

    // Set viewport
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)

    // Clear canvas
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)

    // Use shader program
    this.gl.useProgram(this.program)

    // Set exposure uniform
    this.gl.uniform1f(this.exposureUniformLocation, this.exposure)

    // Bind position buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer)
    this.gl.enableVertexAttribArray(this.positionAttributeLocation)
    this.gl.vertexAttribPointer(
      this.positionAttributeLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0,
    )

    // Bind texture coordinate buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer)
    this.gl.enableVertexAttribArray(this.texCoordAttributeLocation)
    this.gl.vertexAttribPointer(
      this.texCoordAttributeLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0,
    )

    // Bind texture
    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.imageTexture)

    // Draw
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
  }

  setExposure(value: number) {
    this.exposure = value
    this.render()
  }
}

const ImgReveal: Component = () => {
  const [exposure, setExposure] = createSignal(0)

  const [img, setImg] = createSignal<HTMLImageElement>()
  const [canvas, setCanvas] = createSignal<HTMLCanvasElement>()
  const [canvasWidth, setCanvasWidth] = createSignal(80)

  let adjuster: ExposureAdjuster | null = null

  createEffect(
    on(img, () => {
      const i = img()
      if (isUndefined(i)) return

      const c = canvas()
      if (isUndefined(c)) return

      setExposure(0)
      adjuster = new ExposureAdjuster(c, i.src)
    }),
  )

  createEffect(
    on(exposure, () => {
      adjuster?.setExposure(exposure())
    }),
  )

  return (
    <div class="space-y-2">
      <label>
        <input
          type="file"
          accept="images/*"
          onChange={(e) => {
            // setFile(e.target.files?.[0])
            loadImage(e.target.files?.[0]).then((res) => {
              setImg(res)
              console.log('load end')
            })
          }}
        />
      </label>
      <div class="flex items-center gap-4">
        <label for="exposure" class="w-4rem">
          曝光度
        </label>
        <input
          id="exposure"
          type="range"
          min="-10.0"
          max="10.0"
          step="0.1"
          class="flex-1"
          value={exposure()}
          onInput={(e) => setExposure(Number.parseFloat(e.target.value))}
        />{' '}
        <code class="text-sm w-2rem">{exposure().toFixed(1)}</code>
        <button class="btn" onClick={() => setExposure(0)}>
          重置
        </button>
      </div>
      <div class="flex items-center gap-4">
        <label for="canvas-width" class="w-4rem">
          窗格宽度
        </label>
        <input
          id="canvas-width"
          type="range"
          min="20"
          max="100"
          class="flex-1"
          value={canvasWidth()}
          onInput={(e) => setCanvasWidth(Number.parseFloat(e.target.value))}
        />
        <code class="text-sm w-2rem">{canvasWidth()}%</code>
        <button class="btn" onClick={() => setCanvasWidth(80)}>
          重置
        </button>
      </div>
      <Show when={img()}>
        {/*<img
          src={img()!.src}
          alt={img()!.sizes}
        />*/}
        <canvas
          ref={(el) => setCanvas(el)}
          class="mx-a"
          style={{
            'max-width': `${canvasWidth()}%`,
          }}
        />
      </Show>
    </div>
  )
}

export default ImgReveal
