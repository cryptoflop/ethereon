import { JSX, onCleanup, onMount, splitProps } from 'solid-js'

export default function Shader(props: JSX.CanvasHTMLAttributes<HTMLCanvasElement> & { frag: string, images?: string[], fps?: number }) {
  const [shaderProps, canvasProps] = splitProps(props, ['frag', 'images', 'fps'])

  let canvas: HTMLCanvasElement

  onMount(() => {
    const gl = canvas.getContext('webgl2')!

    const vert = `
      attribute vec2 aVertexPosition;
      attribute vec2 aTexturePosition;
      
      varying vec2 fragCoord;
      
      void main() {
        fragCoord = aTexturePosition;
        gl_Position = vec4(aVertexPosition, 0.0, 1.0);
      }
    `
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
    const vertShaderSrc = vert
    gl.shaderSource(vertexShader, vertShaderSrc)
    gl.compileShader(vertexShader)

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
    const fragShaderSrc = shaderProps.frag
    gl.shaderSource(fragmentShader, fragShaderSrc)
    gl.compileShader(fragmentShader)

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.log(`Error compiling fragment shader:`)
      console.log(gl.getShaderInfoLog(fragmentShader))
    }

    const program = gl.createProgram()!
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)

    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.log('Error linking shader program:')
      console.log(gl.getProgramInfoLog(program))
    }


    const uniforms: string[] = [
      'iResolution',
      'iTime'
    ]
    const unifrorms_dict: Record<string, WebGLUniformLocation | null> = {}
    uniforms.forEach(function(name) {
      unifrorms_dict[name] = gl.getUniformLocation(program, name)
    })

    const attributes = [
      'aVertexPosition',
      'aTexturePosition'
    ]
    const attributes_dict: Record<string, number> = {}
    attributes.forEach(function(name) {
      attributes_dict[name] = gl.getAttribLocation(program, name)
    })

    const vertices = new Float32Array([
      -1,  1, 0, 0,
      1,  1, 1, 0,
      -1, -1, 0, 1,
      1, -1, 1, 1
    ])

    const vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const vertexCount = vertices.length / 4

    gl.useProgram(program)


    const fps = shaderProps.fps ?? 29
    const interval = 1000/fps
    let now
    let then = Date.now()
    let delta
    let time = 0
    let rafId: number
    const animate = (currentTime: number) => {
      rafId = requestAnimationFrame(animate)

      now = Date.now()
      delta = now - then

      if (delta <= interval) return
      then = now - (delta % interval)

      time = currentTime / 1000

      // Check if the canvas has different size and make it the same.
      if (canvas.clientWidth  !== canvas.width || canvas.clientHeight !== canvas.height) {
        canvas.width = canvas.clientWidth
        canvas.height = canvas.clientHeight
      }

      // Setup viewport and clear it with black non transparent colour.
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0.0, 0.0, 0.0, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      // Select a buffer for vertices attributes.
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)

      gl.uniform2fv(unifrorms_dict['iResolution'], [canvas.width, canvas.height])
      gl.uniform1f(unifrorms_dict['iTime'], time)

      // Enable and setup attributes.
      gl.enableVertexAttribArray(attributes_dict['aVertexPosition'])
      gl.vertexAttribPointer(attributes_dict['aVertexPosition'], 2,
        gl.FLOAT, false, 4 * 4, 0)
      gl.enableVertexAttribArray(attributes_dict['aTexturePosition'])
      gl.vertexAttribPointer(attributes_dict['aTexturePosition'], 2,
        gl.FLOAT, false, 4 * 4, 2 * 4)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexCount)


    }

    const imgPromises = shaderProps.images?.map(src => new Promise<HTMLImageElement>((res, rej) => {
      const img = new Image()
      img.onload = () => res(img)
      img.onerror = () => rej(null)
      img.src = src
    }))

    if (imgPromises) {
      Promise.all(imgPromises).then(images => {
        images.forEach((img, idx) => {
          // TODO: clean this up

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          gl.activeTexture((gl as any)['TEXTURE' + idx])
          const tex = gl.createTexture()
          gl.bindTexture(gl.TEXTURE_2D, tex)

          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img)

          // gl.generateMipmap(gl.TEXTURE_2D)

          // console.log('iChannel' + idx + ' loaded.')
          const texLoc = gl.getUniformLocation(program, 'iChannel' + idx)
          gl.uniform1i(texLoc, idx)
        })
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)  // draw over the entire viewport
        animate(0)
      })
    } else {
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)  // draw over the entire viewport
      animate(0)
    }

    onCleanup(() => {
      cancelAnimationFrame(rafId)
      gl.flush()
    })
  })

  return <canvas {...canvasProps} ref={canvas!} />
}