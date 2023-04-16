import { onCleanup, onMount, useContext } from 'solid-js'

import { Layers, WebGLRenderer, ShaderMaterial, Vector2, Vector3, Mesh, Scene, OrthographicCamera } from 'three'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

import objectUV3DVert from '../shaders/ObjectUV3D.vert?raw'
import bloomMergeFrag from '../shaders/BloomMerge.frag?raw'

import { TubeSceneContext, changeGasColor } from '../contexts/TubeScene'
import { rndBtw } from '../helpers/Math'

function randomColor() {
  const r = rndBtw(0, 1)
  const g = rndBtw(0, 1 - r)
  const b = 1 - (r + g)
  return new Vector3(r, g, b)
}

export default function Laboratory() {
  let canvasEl: HTMLCanvasElement

  const tubeSceneCtx = useContext(TubeSceneContext)!

  onMount(() => {
    const tubeSceneOrg = tubeSceneCtx()!

    const scene = new Scene()
    const tubes = [tubeSceneOrg.clone(), tubeSceneOrg.clone(), tubeSceneOrg.clone()]
    tubes.forEach(s => {
      changeGasColor(s, randomColor())
      s.rotateZ(Math.PI / 2)
      s.scale.subScalar(0.5)
      scene.add(s)
    })
    tubes[0].position.setX(-5)
    tubes[2].position.setX(5)

    const camera = new OrthographicCamera(canvasEl.clientWidth / -2, canvasEl.clientWidth / 2, canvasEl.clientHeight / 2, canvasEl.clientHeight / -2, 1, 1000)
    camera.position.z = 5
    camera.zoom = 100
    camera.updateProjectionMatrix()

    const renderer = new WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true })
    renderer.setSize(canvasEl.clientWidth, canvasEl.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)

    const params = {
      bloomStrength: 0.8,
      bloomThreshold: 0,
      bloomRadius: 0
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
        vertexShader: objectUV3DVert,
        fragmentShader: bloomMergeFrag,
        defines: {}
      } ), 'baseTexture'
    )
    finalPass.needsSwap = true

    const finalComposer = new EffectComposer(renderer)
    finalComposer.addPass(renderScene)
    finalComposer.addPass(finalPass)

    window.onresize = () => {
      const width = canvasEl.clientWidth
      const height = canvasEl.clientHeight

      //camera.aspect = width / height
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
      time = currentTime / 1000;

      ((scene.getObjectByName('cylMid') as Mesh).material as ShaderMaterial).uniforms.u_time.value = time

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
      renderer.forceContextLoss()
    })
  })

  return <div class='grid'>
    <canvas ref={canvasEl!} class='h-full w-full' />
  </div>
}