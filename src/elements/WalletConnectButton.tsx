

import wallet from '../assets/images/wallet.svg'

export function WalletConnectButton() {

  return <button class={`grid grid-cols-[1rem,1fr] py-0.5 px-2 border-2 text-sm text-center bg-white/5 border-white/80 text-white`}>
    <img class={`h-7 ml-2`} src={wallet} />
    <div class='m-auto'>Connect Wallet</div>
  </button>
}