
export function rndBtw(min = 0, max = 1) {
  return Math.random() * (max - min) + min
}

export function rndNormal(mean=0, stdev=0.5) {
  const u = 1 - Math.random()
  const v = Math.random()
  const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
  return z * stdev + mean
}