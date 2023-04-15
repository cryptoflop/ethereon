import { lazy } from 'solid-js'
import { Navigate, Route, Routes } from '@solidjs/router'

import App from './App'

const Nether = lazy(() => import('./routes/Nether'))
const Laboratory = lazy(() => import('./routes/Laboratory'))
const Market = lazy(() => import('./routes/Market'))

export default function Routing() {
  return <Routes>
    <Route path='/' element={<App />}>
      <Route path='/nether' element={<Nether />} />
      <Route path='/lab' element={<Laboratory />} />
      <Route path='/market' element={<Market />} />
      <Route path='/*all' element={<Navigate href='/nether' />} />
    </Route>
  </Routes>
}