
export function createRenderLoop(fps = 60, onUpdate: (time: number) => void) {
  let rafId: number
  let now
  let then = Date.now()
  let delta
  let time = 0
  const interval = 1000/fps

  function render(currentTime: number) {
    rafId = requestAnimationFrame(render)

    now = Date.now()
    delta = now - then

    if (delta <= interval) return
    then = now - (delta % interval)
    time = currentTime / 1000

    onUpdate(time)
  }

  render(0)

  return () => cancelAnimationFrame(rafId)
}