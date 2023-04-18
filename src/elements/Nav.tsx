import { Link, useMatch } from '@solidjs/router'
import { For } from 'solid-js'

import flame from '../assets/images/flame.svg'
import lab from '../assets/images/lab.svg'
import money from '../assets/images/money.svg'

const routes = [
  { name: 'Nether', route: 'nether', icon: flame },
  { name: 'Lab', route: 'lab', icon: lab },
  { name: 'Market', route: 'market', icon: money }
]

export default function Nav() {

  return <nav class='flex flex-col space-y-4'>
    <For each={routes}>
      { r => {
        const active = useMatch(() => r.route)

        return <Link href={r.route} class={`grid grid-cols-[1rem,1fr] py-1 px-2 border-2 text-lg text-center ${active() ?
          'bg-white/5 border-white/80 text-white' :
          'bg-black/20 text-white/50 border-transparent hover:bg-white/5 hover:text-white'}`}>
          <img class={`h-7 ml-2 ${active() ? '' : 'opacity-50'}`} src={r.icon} />
          {r.name}
        </Link>
      } }
    </For>
  </nav>
}