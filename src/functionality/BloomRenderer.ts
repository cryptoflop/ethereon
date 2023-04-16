import { Layers, WebGLRenderer, ShaderMaterial, Vector2, Camera, Scene } from 'three'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'

// import Stats from 'three/examples/jsm/libs/stats.module.js'

import objectUV3DVert from '../shaders/ObjectUV3D.vert?raw'
import bloomMergeFrag from '../shaders/BloomMerge.frag?raw'

import { createRenderLoop } from '../helpers/RenderLoop'
import { rndNormal } from '../helpers/Math'

// TODO: a createBasicRenderer could be extracted out of this
export function createBloomRenderer(
  scene: Scene,
  canvas: HTMLCanvasElement,
  setupCamera: (w: number, h: number) => Camera,
  setupControls?: (cam: Camera, rendererEl: HTMLElement) => { update: () => void },
  onResize?: (w: number, h: number, cam: Camera, controls?: { update: () => void }) => void,
  onUpdate?: (time: number) => void
) {

  const width = canvas.parentElement!.clientWidth, height = canvas.parentElement!.clientHeight
  const camera = setupCamera(width, height)

  const renderer = new WebGLRenderer({ canvas: canvas, antialias: false, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)

  const controls = setupControls?.(camera, renderer.domElement)

  const params = {
    bloomStrength: 0.8,
    bloomThreshold: 0,
    bloomRadius: 0
  }

  const bloomLayer = new Layers()
  bloomLayer.set(1)

  const renderScene = new RenderPass(scene, camera)

  const bloomPass = new UnrealBloomPass(new Vector2(width, height), 0, 0, 0)
  bloomPass.threshold = params.bloomThreshold
  bloomPass.strength = params.bloomStrength
  bloomPass.radius = params.bloomRadius

  const bloomComposer = new EffectComposer(renderer)
  bloomComposer.renderToScreen = false
  bloomComposer.addPass(renderScene)
  bloomComposer.addPass(bloomPass)

  const finalPass = new ShaderPass(
    new ShaderMaterial( {
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture }
      },
      vertexShader: objectUV3DVert,
      fragmentShader: bloomMergeFrag,
      defines: {}
    } ), 'baseTexture'
  )
  finalPass.needsSwap = true

  const fxaaPass = new ShaderPass(FXAAShader)
  fxaaPass.material.uniforms.resolution.value = new Vector2(1 / (width * renderer.getPixelRatio()), height * renderer.getPixelRatio())

  const finalComposer = new EffectComposer(renderer)
  finalComposer.addPass(renderScene)
  finalComposer.addPass(fxaaPass)
  finalComposer.addPass(finalPass)

  // const stats = [0].map(n => { const s = new Stats(); s.showPanel(n); return s })
  // stats.forEach((s, i) => {
  //   s.dom.style.left = i * 80 + 'px'; s.dom.style.bottom = '80px'; s.dom.style.top = ''
  //   document.body.appendChild(s.dom)
  // })

  window.onresize = () => {
    const width = canvas.parentElement!.clientWidth, height = canvas.parentElement!.clientHeight

    onResize?.(width, height, camera, controls)

    fxaaPass.material.uniforms.resolution.value = new Vector2(1 / (width * renderer.getPixelRatio()), height * renderer.getPixelRatio())

    renderer.setSize(width, height)

    bloomComposer.setSize(width, height)
    finalComposer.setSize(width, height)
  }

  let lastRnd = 0.5
  const cancelRenderLoop = createRenderLoop(60, (time) => {
    // stats.forEach(s => s.update())

    controls?.update()

    scene.traverse(obj => {
      if ('material' in obj) {
        const mat = (obj.material as ShaderMaterial)
        if (mat.isShaderMaterial === true && !!mat.uniforms.u_time) {
          mat.uniforms.u_time.value = time
        }
      }
    })

    fxaaPass.material.uniforms.resolution.value = new Vector2(1 / (width * renderer.getPixelRatio()), height * renderer.getPixelRatio())

    const rnd = rndNormal() * 0.2
    bloomPass.strength = params.bloomStrength + ((rnd / 2 + lastRnd) / 2)
    lastRnd = (rnd / 2 + lastRnd) / 2

    onUpdate?.(time)

    camera.layers.set(1)
    bloomComposer.render()
    camera.layers.set(0)
    finalComposer.render()
    // renderer.render(scene, camera)
  })

  return () => {
    cancelRenderLoop()
    renderer.dispose()
    renderer.getContext().flush()
    renderer.forceContextLoss()
    // Array.from(document.body.children).forEach(e => !e.id && e.remove())
  }
}