import Nav from './Nav'

import eth from '../assets/images/eth.svg'
import block from '../assets/images/block.svg'

import tooltip from '../directives/tooltip'
import { WalletConnectButton } from './WalletConnectButton'
import { useAudioState } from '../helpers/Audio'
false && tooltip

export default function Sidebar() {
  const [muted, setMuted] = useAudioState()

  return <aside class='grid grid-rows-[min-content,min-content,1fr,min-content] gap-4 p-6 bg-black/10'>
    <div class='p-6 text-3xl select-none'>
      Ethereon
    </div>

    <div class='grid mb-14'>
      <WalletConnectButton />
    </div>

    <Nav />

    <button onClick={() => setMuted(!muted())}>
      { muted() ? 'Unmute' : 'Mute' }
    </button>

    <div class='grid grid-cols-2'>
      <div class='bg-black/20 mr-auto py-2 px-3 hover:bg-white/10 select-none'>
        <img src={eth} />
      </div>
      <div class='grid grid-cols-[1rem,1fr] items-center gap-1' use:tooltip='Current block on Mainnet'>
        <img src={block} class='animate-pulse' />
        <div>17069882</div>
      </div>
    </div>
  </aside>
}