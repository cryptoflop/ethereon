import { onCleanup, onMount, useContext } from 'solid-js'

import { PerspectiveCamera, Vector3 } from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { TubeSceneContext } from '../contexts/TubeScene'
import { shiftColor } from '../helpers/Gas'
import { createBloomRenderer } from '../functionality/BloomRenderer'


export default function Nether() {
  let btn: HTMLButtonElement
  let canvasEl: HTMLCanvasElement

  const tubeSceneCtx = useContext(TubeSceneContext)!

  let changeColor: (col: Vector3) => void

  onMount(() => {
    btn.animate([
      { filter: 'drop-shadow(-20px 0 20px #ffffffaa) drop-shadow(0 0 20px #ffffffaa) drop-shadow(20px 0 20px #ffffffaa)' },
      { filter: 'drop-shadow(-20px 0 20px #ffffff77) drop-shadow(0 0 20px #ffffff77) drop-shadow(20px 0 20px #ffffff77)' },
      { filter: 'drop-shadow(-20px 0 20px #ffffffaa) drop-shadow(0 0 20px #ffffffaa) drop-shadow(20px 0 20px #ffffffaa)' }
    ], { iterations: Infinity, duration: 5000 })
  })

  onMount(() => {
    const { scene, changeColor: changeGasColor, gasMat } = tubeSceneCtx()!()

    changeColor = (col: Vector3) => {
      changeGasColor(shiftColor(col))
    }

    changeGasColor(new Vector3(0.1, 0.1, 0.1))

    const disposeRenderer = createBloomRenderer(
      scene,
      canvasEl,
      (w, h) => {
        const cam = new PerspectiveCamera(75, w / h, 0.1, 1000)
        cam.position.z = 5
        return cam
      },
      (camera, el) => {
        const controls = new OrbitControls(camera, el)
        controls.target.set( 0, 0, 0 )
        controls.update()
        controls.enablePan = false
        controls.enableDamping = true
        controls.minDistance = 1
        controls.maxDistance = 10
        return controls
      },
      (w, h, cam, controls) => {
        const camera = cam as PerspectiveCamera
        camera.aspect = w / h
        camera.updateProjectionMatrix()

        controls!.update()
      },
      (time) => {
        scene
        gasMat.uniforms.u_time.value = time

        // scene.rotation.x += rot
        // scene.rotation.y += rot
        // scene.rotation.z += rot
      }
    )

    onCleanup(disposeRenderer)
  })

  return <div class='grid relative'>
    <canvas ref={canvasEl!} class='absolute' />
    { /* eslint-disable-next-line max-len */ }
    <input class='absolute' type='color' value='#ffffff' onChange={e => { const v = e.target.value.match(/\w\w/g)!.map(x=>(+`0x${x}`) / 255); changeColor(new Vector3(v[0], v[1], v[2])) }} />

    <div class='absolute bottom-[20vh] w-full grid pointer-events-none'>
      <button ref={btn!} class='bg-black/15 hover:bg-white/5 transition-colors duration-500 m-auto
        pointer-events-auto py-1 px-8 text-2xl border-2 border-white/60'>
        Gather Gas
      </button>
    </div>
  </div>
}
