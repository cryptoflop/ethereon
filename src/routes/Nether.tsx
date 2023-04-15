import { onCleanup, onMount, useContext } from 'solid-js'

import { Layers, WebGLRenderer, PerspectiveCamera, ShaderMaterial, Vector2, Vector3 } from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

import neonBuzzSrc from '../assets/sounds/neon_buzz.mp3'

// import Stats from 'three/examples/jsm/libs/stats.module.js'

import { TubeSceneContext, changeGasColor } from '../contexts/TubeScene'
import { rndBtw } from '../helpers/Math'


function randomColor() {
  const r = rndBtw(0, 1)
  const g = rndBtw(0, 1 - r)
  const b = 1 - (r + g)
  return new Vector3(r, g, b)
}

export default function Nether() {
  let canvasEl: HTMLCanvasElement

  const tubeSceneCtx = useContext(TubeSceneContext)!

  onMount(() => {
    const scene = tubeSceneCtx()!.clone(true)

    changeGasColor(scene, randomColor())

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    const renderer = new WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true })
    renderer.setSize(canvasEl.clientWidth, canvasEl.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)

    const controls = new OrbitControls( camera, renderer.domElement )
    controls.target.set( 0, 0, 0 )
    controls.update()
    controls.enablePan = false
    controls.enableDamping = true
    controls.minDistance = 1
    controls.maxDistance = 10

    const params = {
      bloomStrength: 0.8,
      bloomThreshold: 0,
      bloomRadius: 0.
    }

    const bloomLayer = new Layers()
    bloomLayer.set(1)

    const renderScene = new RenderPass(scene, camera)

    const bloomPass = new UnrealBloomPass(new Vector2(canvasEl.clientWidth, canvasEl.clientHeight), 1.5, 0.4, 0.85)
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
        // eslint-disable-next-line max-len
        vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }',
        // eslint-disable-next-line max-len
        fragmentShader: 'uniform sampler2D baseTexture; uniform sampler2D bloomTexture; varying vec2 vUv; void main() { gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4(1.,1.,1.,.0) * texture2D( bloomTexture, vUv ) * 2. ); }',
        defines: {}
      } ), 'baseTexture'
    )
    finalPass.needsSwap = true

    const finalComposer = new EffectComposer(renderer)
    finalComposer.addPass(renderScene)
    finalComposer.addPass(finalPass)

    // const stats = [0].map(n => { const s = new Stats(); s.showPanel(n); return s })
    // stats.forEach((s, i) => {
    //   s.dom.style.left = i * 80 + 'px'; s.dom.style.bottom = '80px'; s.dom.style.top = ''
    //   document.body.appendChild(s.dom)
    // })

    window.onresize = () => {
      const width = canvasEl.clientWidth
      const height = canvasEl.clientHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()

      renderer.setSize( width, height )

      bloomComposer.setSize( width, height )
      finalComposer.setSize( width, height )
    }

    function gaussianRandom(mean=0, stdev=0.5) {
      const u = 1 - Math.random() // Converting [0,1) to (0,1]
      const v = Math.random()
      const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
      // Transform to the desired mean and standard deviation:
      return z * stdev + mean
    }

    let rafId: number
    let lastRnd = 0.5
    let now
    let then = Date.now()
    let delta
    let time = 0
    const fps = 60
    const interval = 1000/fps
    function render(currentTime: number) {
      rafId = requestAnimationFrame(render)

      now = Date.now()
      delta = now - then

      if (delta <= interval) return
      then = now - (delta % interval)
      time = currentTime / 1000

      controls.update()
      // stats.forEach(s => s.update())

      scene.traverse(obj => {
        if ('material' in obj) {
          const mat = (obj.material as ShaderMaterial)
          if (mat.isShaderMaterial === true && !!mat.uniforms.u_time) {
            mat.uniforms.u_time.value = time
          }
        }
      })

      const rnd = gaussianRandom() * 0.18
      bloomPass.strength = params.bloomStrength + ((rnd / 2 + lastRnd) / 2)
      lastRnd = (rnd / 2 + lastRnd) / 2

      camera.layers.set(1)
      bloomComposer.render()
      camera.layers.set(0)
      finalComposer.render()
      // renderer.render(scene, camera)
    }
    render(0)

    onCleanup(() => {
      cancelAnimationFrame(rafId)
      renderer.dispose()
      renderer.getContext().flush()
      Array.from(document.body.children).forEach(e => !e.id && e.remove())
    })
  })

  onMount(() => {
    const audio = new Audio(neonBuzzSrc)
    audio.volume = 0.035
    audio.playbackRate = 3
    audio.loop = true
    // audio.play()

    onCleanup(() => {
      audio.pause()
    })
  })

  return <div class='grid'>
    <canvas ref={canvasEl!} class='h-full w-full' />
  </div>
}
