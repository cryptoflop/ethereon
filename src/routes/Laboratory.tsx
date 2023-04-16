import { For, onCleanup, onMount, useContext } from 'solid-js'

import { Scene, OrthographicCamera } from 'three'

import { TubeSceneContext } from '../contexts/TubeScene'
import { gatherGas, shiftColor } from '../helpers/Gas'
import { createBloomRenderer } from '../functionality/BloomRenderer'

import tooltip from '../directives/tooltip'
false && tooltip

export default function Laboratory() {
  let canvasEl: HTMLCanvasElement

  const tubeSceneCtx = useContext(TubeSceneContext)!

  const tubeGenerator = tubeSceneCtx()!
  const tubes = Array(24).fill(1)
    .map(() => ({...tubeGenerator(), gas: gatherGas() }))

  onMount(() => {

    const scene = new Scene()

    // TODO: get item count from width and height
    const width = canvasEl.parentElement!.clientWidth, height = canvasEl.parentElement!.clientHeight

    const cols = Math.floor(width / 145)

    tubes.forEach((g, i) => {
      const { scene: s, changeColor, gas } = g
      changeColor(shiftColor(gas.color))
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

  const chemicalDescription = (gas: ReturnType<typeof gatherGas>) => {
    const desc = Array(gas.weights.length).fill(1)
      .map((_, i) => ({
        initials: gas.names[i].slice(0, 2),
        name: gas.names[i].toLowerCase().charAt(0)
          .toUpperCase() + gas.names[i].toLowerCase().substring(1),
        percentage: gas.weights[i].toFixed(2)
          .replace('0.', '')
          .replace(/^0+(?!$)/, '')
          .replace('.', '')
      }))
    return <p>
      <For each={desc}>
        {d => <span class='hover:bg-white/20 cursor-pointer' use:tooltip={`${d.percentage} units of ${d.name}`}>
          {d.initials}<sup>{d.percentage}</sup>
        </span>}
      </For>
    </p>
  }

  return <div class='grid'>
    <canvas ref={canvasEl!} class='absolute z-[-1]' />
    <div class='grid grid-cols-8 grid-rows-3'>
      <For each={tubes}>
        {t => <div class='mx-auto mt-16'>
          {chemicalDescription(t.gas)}
        </div>}
      </For>
    </div>
  </div>
}