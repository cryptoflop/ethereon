import { Outlet } from '@solidjs/router'
import Background from './elements/Background'
import Sidebar from './elements/Sidebar'
import { TubeSceneProvider } from './contexts/TubeScene'
import { createAudio } from './helpers/Audio'

import atmoshpereSrc from './assets/sounds/atmoshpere.mp3'

export default function App() {
  createAudio(atmoshpereSrc, { autoPlay: true, loop: true, volume: 0.5 })

  return <div class='grid grid-cols-[min-content,1fr]'>
    <TubeSceneProvider>
      <Sidebar />
      <Outlet />
    </TubeSceneProvider>
    <Background />
  </div>
}