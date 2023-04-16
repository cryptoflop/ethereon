import { Vector3 } from 'three'

/*
* sub min from all colors and add them to have at least min from the whole spectrum
*/
export function shiftColor(col: Vector3) {
  col.x = Math.max(0, col.x - 0.1)
  col.y = Math.max(0, col.y - 0.1)
  col.z = Math.max(0, col.z - 0.1)
  col.add(new Vector3(0.1, 0.1, 0.1))
  return col
}