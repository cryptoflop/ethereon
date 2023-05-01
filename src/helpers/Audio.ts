import { createSignal, onCleanup } from 'solid-js'

let muted = !!localStorage.getItem('muted')
const audioEls: HTMLAudioElement[] = []

const blockedAutoplays: HTMLAudioElement[] = []
document.onclick = () => {
  blockedAutoplays.forEach(ae => {
    ae.play()
    blockedAutoplays.splice(blockedAutoplays.indexOf(ae), 1)
  })
}

export function setAudioMuted(isMuted: boolean) {
  muted = isMuted
  audioEls.forEach(ae => ae.muted = true)
}

export function useAudioState() {
  const [m, setM] = createSignal(muted)
  return [m, (isMuted: boolean) => {
    if (isMuted) {
      localStorage.setItem('muted', 'true')
    } else {
      localStorage.removeItem('muted')
    }
    muted = isMuted
    setM(isMuted)
    audioEls.forEach(ae => ae.muted = isMuted)
  }] as const
}

export function createAudio(src: string,
  options: { volume?: number, loop?: boolean, playbackRate?: number, autoPlay?: boolean }
) {
  options = {...{ volume: 0.5, loop: false, playbackRate: 1, autoPlay: false }, ...options}
  const audio = new Audio(src)
  audio.volume = options.volume!
  audio.playbackRate = options.playbackRate!
  audio.loop = options.loop!
  audio.muted = muted

  if (options.autoPlay!) {
    audio.play().catch(() => blockedAutoplays.push(audio))
  }

  audioEls.push(audio)

  onCleanup(() => {
    audio.pause()
    audioEls.splice(audioEls.indexOf(audio), 1)
  })

  return audio
}