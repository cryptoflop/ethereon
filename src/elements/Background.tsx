import Shader from './Shader'

import pre from '../assets/images/back.png'
import pos from '../assets/images/backinv.png'

import backgroundParallax from '../shaders/BackgroundParallax.frag?raw'

export default function Background() {
  return <Shader class='pointer-events-none absolute z-[-2] w-screen h-screen' frag={backgroundParallax} images={[pre, pos]} fps={13} />
}