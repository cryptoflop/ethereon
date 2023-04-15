import { Link, useMatch } from '@solidjs/router'
import { For } from 'solid-js'

const routes = [
  { name: 'Nether', route: 'nether' },
  { name: 'Lab', route: 'lab' },
  { name: 'Market', route: 'market' }
]

export default function Nav() {

  return <nav class='flex flex-col space-y-4'>
    <For each={routes}>
      { r => {
        const active = useMatch(() => r.route)

        return <Link href={r.route} class={`p-2 border-2 text-lg text-center ${active() ?
          'bg-white/10 border-white/80 text-white' :
          'bg-black/10 text-white/40 border-transparent hover:bg-white/10 hover:text-white'}`}>
          {r.name}
        </Link>
      } }
    </For>
  </nav>
}