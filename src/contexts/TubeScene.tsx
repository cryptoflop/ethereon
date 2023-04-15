import { createContext, createSignal, JSX, Match, Switch } from 'solid-js'
import { Mesh, MeshBasicMaterial, CylinderGeometry, EquirectangularReflectionMapping, MeshPhysicalMaterial, Scene,
  ShaderMaterial, AdditiveBlending, Vector3, DoubleSide, Color, SphereGeometry } from 'three'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

export const TubeSceneContext = createContext<ReturnType<typeof makeTubeSceneContext>>()

export function changeGasColor(scene: Scene, color: Vector3) {
  const col = new Color(color.x, color.y, color.z);
  ((scene.getObjectByName('wire') as Mesh).material as MeshBasicMaterial).color = col;
  ((scene.getObjectByName('cylMid') as Mesh).material as ShaderMaterial).uniforms.baseColor.value = color
}

function makeTubeSceneContext() {
  const [tubeScene, setTubeScene] = createSignal<Scene>()

  new GLTFLoader().load('/tube.gltf', (gltf) => {
    const gltfScene = gltf.scene
    gltfScene.scale.set(0.36, 0.5, 0.5)

    const colorMat = new MeshBasicMaterial({ color: '#ffffff' })

    const wire = (gltf.scene.children[1] as Mesh)
    wire.name = 'wire'
    wire.scale.set(3, 1.1, 3)
    wire.material = colorMat
    wire.layers.enable(1);

    (gltf.scene.children[2] as Mesh).material = colorMat;
    (gltf.scene.children[2] as Mesh).layers.enable(1);
    (gltf.scene.children[2] as Mesh).name = 'wirePos';
    (gltf.scene.children[3] as Mesh).material = colorMat;
    (gltf.scene.children[3] as Mesh).layers.enable(1);
    (gltf.scene.children[3] as Mesh).name = 'wireNeg'

    const left = new Mesh(new CylinderGeometry())
    left.rotation.x = Math.PI / 2
    left.rotation.z = Math.PI / 2
    left.position.x = -3.38
    left.scale.set(.14, 3.2, .14)
    left.layers.enable(1)
    left.material = colorMat
    left.name = 'wireLeft'
    gltfScene.add(left)

    const right = left.clone()
    right.position.x = -left.position.x
    right.name = 'wireRight'
    gltfScene.add(right)


    const uniforms = {
      u_time: { type: 'f', value: 1.0 },
      baseColor: { type: 'vec3', value: new Vector3(1, 1, 1) }
    }

    const gasMaterial = new ShaderMaterial( {
      uniforms,
      vertexShader: `
        varying vec2 vUv;

        #ifdef GL_ES
          precision mediump float;
        #endif

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        }
      `,
      fragmentShader: `
        uniform float u_time;
        uniform vec3 baseColor;

        varying vec2 vUv;

        #ifdef GL_ES
          precision mediump float;
        #endif

        float random (in vec2 _st) {
            return fract(sin(dot(_st.xy,
                                vec2(12.9898,78.233)))*
                43758.5453123);
        }

        float noise (in vec2 _st) {
            vec2 i = floor(_st);
            vec2 f = fract(_st);

            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));

            vec2 u = f * f * (3.0 - 2.0 * f);

            return mix(a, b, u.x) +
                    (c - a)* u.y * (1.0 - u.x) +
                    (d - b) * u.x * u.y;
        }

        #define NUM_OCTAVES 6

        float fbm ( in vec2 _st) {
            float v = 0.0;
            float a = 0.5;
            vec2 shift = vec2(100.0);
            for (int i = 0; i < NUM_OCTAVES; ++i) {
                v += a * noise(_st);
                _st = _st * 2.2 + shift;
                a *= 0.5;
            }
            return v;
        }

        void main() {
          vec2 st = vUv;
          vec3 color = vec3(0.0);
      
          float time = u_time * .5;
          
          vec2 q = vec2(0.);
          q.x = fbm( st + 0.00*time);
          q.y = fbm( st + vec2(1.0));
      
          vec2 r = vec2(0.);
          r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ 0.15*time );
          r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ 0.5*time);
      
          float f = fbm(st+r);
      
          vec3 base = baseColor;
    
          color = mix(vec3(base),
                      vec3(base),
                      clamp((f*f)*4.,0.,1.));

          color = mix(color,
                      vec3(base),
                      clamp(length(q),0.,1.));

          color = mix(color,
                      vec3(base) / 10.,
                      clamp(length(r.x),0.,1.));
      
          gl_FragColor = vec4((f*f*f+.6*f*f+.5*f)*color, .8);
        }
      `,
      transparent: true,
      blending: AdditiveBlending // It looks like real blast with Additive blending!!!
    })

    const geometry = new CylinderGeometry(0.213, 0.213, 3.3, 40, 1, true)
    const cylinder = new Mesh(geometry, gasMaterial)
    cylinder.position.set(0, 0, 0)
    cylinder.rotation.x = Math.PI / 2
    cylinder.rotation.z = Math.PI / 2
    cylinder.material.side = DoubleSide
    cylinder.name = 'cylMid'
    gltfScene.add(cylinder)

    const leftC = cylinder.clone()
    leftC.position.set(-3.71, 0, 0)
    leftC.scale.addScalar(0.88)
    leftC.scale.sub(new Vector3(0, 0.6, 0))
    leftC.name = 'cylLeft'
    gltfScene.add(leftC)

    const rightC = leftC.clone()
    rightC.position.set(3.75, 0, 0)
    rightC.name = 'cylRight'
    gltfScene.add(rightC)


    const plate = new Mesh(new CylinderGeometry(0.4, 0.4, 0.028, 40, 1, false), gasMaterial)
    plate.position.set(-1.582, 0, 0)
    plate.rotation.x = Math.PI / 2
    plate.rotation.z = Math.PI / 2
    plate.material.side = DoubleSide
    plate.name = 'plateML'
    gltfScene.add(plate)

    const plateMR = plate.clone()
    plateMR.position.set(-plate.position.x + 0.05, 0, 0)
    plateMR.name = 'plateMR'
    gltfScene.add(plateMR)

    const plateR = plate.clone()
    plateR.position.set(5.878, 0, 0)
    plateR.name = 'plateR'
    gltfScene.add(plateR)

    const plateL = plate.clone()
    plateL.position.set(-plateR.position.x + 0.05, 0, 0)
    plateL.name = 'plateL'
    gltfScene.add(plateL)



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
      // tube.layers.enable(1)
      tube.name = 'glass'

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