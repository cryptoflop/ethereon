import { onCleanup, onMount, useContext } from 'solid-js'

import { Vector3, Scene, OrthographicCamera } from 'three'

import { TubeSceneContext } from '../contexts/TubeScene'
import { rndBtw } from '../helpers/Math'
import { shiftColor } from '../helpers/Gas'
import { createBloomRenderer } from '../functionality/BloomRenderer'

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
    const tubeGenerator = tubeSceneCtx()!

    const scene = new Scene()

    // TODO: get item count from width and height
    const width = canvasEl.parentElement!.clientWidth, height = canvasEl.parentElement!.clientHeight

    const cols = Math.floor(width / 145)
    const tubes = Array(30).fill(1)
      .map(() => tubeGenerator())

    tubes.forEach((g, i) => {
      const { scene: s, changeColor: cc } = g
      cc(shiftColor(randomColor()))
      s.rotateZ(Math.PI / 2)
      s.rotateY(Math.PI / 5)
      s.rotateX(1)
      s.scale.subScalar(0.5)
      s.position.setX(5.2 + -(i % cols) * 1.5)
      s.position.setY(-(Math.floor(i / cols) * 3) + 2.6)
      scene.add(s)
    })

    const disposeRenderer = createBloomRenderer(
      scene,
      canvasEl,
      (w, h) => {
        const camera = new OrthographicCamera(w / -2, w / 2, h / 2, h / -2, 1, 1000)
        camera.position.z = 5
        camera.zoom = 100
        camera.updateProjectionMatrix()
        return camera
      },
      undefined,
      (w, h, cam) => {
        const camera = cam as OrthographicCamera
        camera.left = w / -2
        camera.right = w / 2
        camera.top = h / 2
        camera.bottom = h / -2
        camera.updateProjectionMatrix()
      },
      (time) => {
        for (const tubeGroup of tubes) {
          tubeGroup.gasMat.uniforms.u_time.value = time
          tubeGroup.scene.position.y += (Math.sin(time + tubeGroup.gasMat.uniforms.baseColor.value.x * 2) * 0.0008)
        }
      }
    )

    onCleanup(disposeRenderer)
  })

  return <div class='grid'>
    <canvas ref={canvasEl!} class='absolute' />
  </div>
}