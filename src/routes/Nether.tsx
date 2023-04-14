import { onCleanup, onMount } from 'solid-js'

import { AmbientLight, EquirectangularReflectionMapping, Layers, Mesh,  MeshBasicMaterial,  MeshPhysicalMaterial, PerspectiveCamera,
  Scene, ShaderMaterial, Vector2, WebGLRenderer } from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

import Stats from 'three/examples/jsm/libs/stats.module.js'

const disposables: (() => void)[] = []
import.meta.hot!.on('vite:beforeUpdate', () => {
  for (let i = disposables.length; i > 0; i--) {
    disposables.pop
  }
})

export default function Nether() {
  let canvasEl: HTMLCanvasElement

  onMount(() => {
    const scene = new Scene()

    new GLTFLoader().load('/tube.gltf', (gltf) => {
      const tubeScene = gltf.scene
      tubeScene.scale.set(0.5, 0.5, 0.5)

      const wire = (gltf.scene.children[1] as Mesh)
      wire.material = new MeshBasicMaterial({ color: '#8888ff' })
      wire.layers.enable(BLOOM_SCENE);

      (gltf.scene.children[2] as Mesh).material = new MeshBasicMaterial({ color: '#8888ff' });
      (gltf.scene.children[2] as Mesh).layers.enable(BLOOM_SCENE);
      (gltf.scene.children[3] as Mesh).material = new MeshBasicMaterial({ color: '#8888ff' });
      (gltf.scene.children[3] as Mesh).layers.enable(BLOOM_SCENE)

      new RGBELoader().load('/sky.hdr', (hdr) => {
        hdr.mapping = EquirectangularReflectionMapping

        const tube = gltf.scene.children[0] as Mesh
        tube.material = new MeshPhysicalMaterial({
          roughness: 0.,
          transmission: 1,
          thickness: 0.,
          envMap: hdr,
          envMapIntensity: 0.8
        })

        scene.add(tubeScene)
      })
    }, undefined, console.error)

    const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    const renderer = new WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true })
    renderer.setSize(canvasEl.clientWidth, canvasEl.clientHeight)

    const params = {
      exposure: 4,
      bloomStrength: 4,
      bloomThreshold: 0,
      bloomRadius: 0.4
    }

    const ENTIRE_SCENE = 0, BLOOM_SCENE = 1

    const bloomLayer = new Layers()
    bloomLayer.set(BLOOM_SCENE)

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
        fragmentShader: 'uniform sampler2D baseTexture; uniform sampler2D bloomTexture; varying vec2 vUv; void main() { gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4(1.,1.,1.,.0) * texture2D( bloomTexture, vUv ) ); }',
        defines: {}
      } ), 'baseTexture'
    )
    finalPass.needsSwap = true

    const finalComposer = new EffectComposer(renderer)
    finalComposer.addPass(renderScene)
    finalComposer.addPass(finalPass)

    // const light = new DirectionalLight(0xffffff, 1)
    // light.position.set(0, 5, 10)
    // scene.add(light)

    scene.add( new AmbientLight( 0x404040 ) )

    const stats = [0].map(n => { const s = new Stats(); s.showPanel(n); return s })
    stats.forEach((s, i) => {
      s.dom.style.left = i * 80 + 'px'; s.dom.style.bottom = '80px'; s.dom.style.top = ''
      document.body.appendChild(s.dom)
    })

    const controls = new OrbitControls( camera, renderer.domElement )
    controls.target.set( 0, 0, 0 )
    controls.update()
    controls.enablePan = false
    controls.enableDamping = true
    controls.minDistance = 1
    controls.maxDistance = 10

    renderer.setPixelRatio(window.devicePixelRatio)

    window.onresize = () => {
      const width = canvasEl.clientWidth
      const height = canvasEl.clientHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()

      renderer.setSize( width, height )

      bloomComposer.setSize( width, height )
      finalComposer.setSize( width, height )
    }

    let rafId: number
    function render() {
      rafId = requestAnimationFrame(render)

      controls.update()
      stats.forEach(s => s.update())

      camera.layers.set( BLOOM_SCENE )
      bloomComposer.render()
      camera.layers.set( ENTIRE_SCENE )
      finalComposer.render()
      // renderer.render(scene, camera)
    }
    render()

    onCleanup(() => {
      cancelAnimationFrame(rafId)
      renderer.dispose()
      renderer.getContext().flush()
      Array.from(document.body.children).forEach(e => !e.id && e.remove())
    })
  })

  return <div class='grid'>
    <canvas ref={canvasEl!} class='h-full w-full' />
  </div>
}