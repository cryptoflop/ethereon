import { createContext, createSignal, JSX, Match, Switch } from 'solid-js'
import { Mesh, MeshBasicMaterial, CylinderGeometry, EquirectangularReflectionMapping, MeshPhysicalMaterial, Scene } from 'three'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

export const TubeSceneContext = createContext<ReturnType<typeof makeTubeSceneContext>>()

function makeTubeSceneContext() {
  const [tubeScene, setTubeScene] = createSignal<Scene>()

  new GLTFLoader().load('/tube.gltf', (gltf) => {
    const gltfScene = gltf.scene
    gltfScene.scale.set(0.4, 0.5, 0.5)

    const wire = (gltf.scene.children[1] as Mesh)
    wire.scale.set(3, 1.1, 3)
    wire.material = new MeshBasicMaterial({ color: '#8888ff' })
    wire.layers.enable(1);

    (gltf.scene.children[2] as Mesh).material = new MeshBasicMaterial({ color: '#8888ff' });
    (gltf.scene.children[2] as Mesh).layers.enable(1);
    (gltf.scene.children[3] as Mesh).material = new MeshBasicMaterial({ color: '#8888ff' });
    (gltf.scene.children[3] as Mesh).layers.enable(1)

    const left = new Mesh(new CylinderGeometry())
    left.rotation.x = Math.PI / 2
    left.rotation.z = Math.PI / 2
    left.position.x = -3.38
    left.scale.set(.24, 3.2, .24)
    left.layers.enable(1)
    left.material = new MeshBasicMaterial({
      color: '#8888ff'
    })
    gltfScene.add(left)

    const right = left.clone()
    left.position.x = -left.position.x
    gltfScene.add(right)

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

      const scene = new Scene()
      scene.add(gltfScene)
      setTubeScene(scene)
    })
  }, undefined, console.error)

  return tubeScene
}

export function TubeSceneProvider(props: { children: JSX.Element }) {
  const tubeScene = makeTubeSceneContext()

  return <TubeSceneContext.Provider value={tubeScene}>
    <Switch>
      <Match when={tubeScene()}>
        {props.children}
      </Match>
    </Switch>
  </TubeSceneContext.Provider>
}