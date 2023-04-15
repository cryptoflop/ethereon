import { Outlet } from '@solidjs/router'
import Background from './elements/Background'
import Sidebar from './elements/Sidebar'
import { TubeSceneProvider } from './contexts/TubeScene'

export default function App() {
  return <div class='grid grid-cols-[min-content,1fr]'>
    <TubeSceneProvider>
      <Sidebar />
      <Outlet />
    </TubeSceneProvider>
    <Background />
  </div>
}