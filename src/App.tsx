import { Outlet } from 'solid-app-router'
import Background from './elements/Background'
import Sidebar from './elements/Sidebar'

export default function App() {
  return <div class='grid grid-cols-[min-content,1fr]'>
    <Sidebar />
    <Outlet />
    <Background />
  </div>
}