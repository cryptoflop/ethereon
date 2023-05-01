import { Vector3 } from 'three'
import { rndBtw } from './Math'

/*
* sub min from all colors and add them to have at least min from the whole spectrum
*/
export function shiftColor(col: Vector3) {
  const mod = 0.1
  col.x = Math.max(0, col.x - mod)
  col.y = Math.max(0, col.y - mod)
  col.z = Math.max(0, col.z - mod)
  col.add(new Vector3(mod, mod, mod))
  return col
}

const GAS_NAMES = [
  'HELIUM',
  'NEON',
  'ARGON',
  'KRYPTON',
  'XENON',
  'ETHEREON'
]
export const GAS_COLORS = [
  new Vector3(0.7, 0.1, 0.2),
  new Vector3(0.9, 0.0, 0.1),
  new Vector3(0.5, 0.0, 0.5),
  new Vector3(0.333, 0.333, 0.333),
  new Vector3(0.1, 0.1, 0.8),
  new Vector3(0.0, 1., 0.4)
]

export function gatherGas() {
  const gasCount = Math.ceil(rndBtw(0.0001, 3))

  const weights: number[] = []
  let sum = 0
  for (let i = 0; i < gasCount; i++) {
    weights[i] = rndBtw(0, 100)
    sum += weights[i]
  }
  for (let i = 0; i < gasCount; i++) {
    weights[i] = Math.round(((weights[i] / sum) + Number.EPSILON) * 100) / 100
  }

  const gasColor = new Vector3()

  const names: string[] = []
  const gases = [...GAS_COLORS]
  const gasNames = [...GAS_NAMES]
  for (let i = 0; i < gasCount; i++) {
    const gi = Math.ceil(rndBtw(0.01, gases.length - 1))
    const gas = gases.splice(gi, 1)
    names.push(gasNames.splice(gi, 1)[0])
    const col = gas[0].clone().multiplyScalar(weights[i])
    gasColor.add(col)
  }
  return { color: gasColor, weights, names }
}