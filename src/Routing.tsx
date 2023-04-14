import { lazy } from 'solid-js'
import { Navigate, Route, Routes } from 'solid-app-router'

import App from './App'

const Nether = lazy(() => import('./routes/Nether'))
const Inventory = lazy(() => import('./routes/Inventory'))
const Market = lazy(() => import('./routes/Market'))

export default function Routing() {
  return <Routes>
    <Route path='/' element={<App />}>
      <Route path='/nether' element={<Nether />} />
      <Route path='/inventory' element={<Inventory />} />
      <Route path='/market' element={<Market />} />
      <Route path='/*all' element={<Navigate href='/nether' />} />
    </Route>
  </Routes>
}