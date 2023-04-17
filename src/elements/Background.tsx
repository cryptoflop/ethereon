import Shader from './Shader'

import nether from '../assets/images/nether.png'

import backgroundParallax from '../shaders/BackgroundParallax.frag?raw'

export default function Background() {
  return <Shader class='pointer-events-none absolute z-[-2] w-screen h-screen' frag={backgroundParallax} images={[nether]} fps={30} />
}