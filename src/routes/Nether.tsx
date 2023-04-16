import { onCleanup, onMount, useContext } from 'solid-js'

import { PerspectiveCamera, Vector3 } from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import neonBuzzSrc from '../assets/sounds/neon_buzz.mp3'

import { TubeSceneContext } from '../contexts/TubeScene'
import { shiftColor } from '../helpers/Gas'
import { createBloomRenderer } from '../functionality/BloomRenderer'


export default function Nether() {
  let canvasEl: HTMLCanvasElement

  const tubeSceneCtx = useContext(TubeSceneContext)!

  let changeColor: (col: Vector3) => void

  onMount(() => {
    const { scene, changeColor: changeGasColor } = tubeSceneCtx()!()

    changeColor = (col: Vector3) => {
      changeGasColor(shiftColor(col))
    }

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
      }
    )

    onCleanup(disposeRenderer)
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
    <canvas ref={canvasEl!} class='absolute' />
    { /* eslint-disable-next-line max-len */ }
    <input class='absolute' type='color' value='#ffffff' onChange={e => { const v = e.target.value.match(/\w\w/g)!.map(x=>(+`0x${x}`) / 255); changeColor(new Vector3(v[0], v[1], v[2])) }} />
  </div>
}
