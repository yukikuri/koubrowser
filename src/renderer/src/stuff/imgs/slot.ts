import { SlotitemImgType } from '@common/kcs'
import emptyimg from '../../assets/img/slot/empty.png'

const typeImgs = import.meta.glob('../../assets/img/slot/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const alvImgs = import.meta.glob('../../assets/img/slot/alv/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

function getTypeSrc(type: SlotitemImgType): string {
  const idx = `../../assets/img/slot/type${type}.png`
  return typeImgs[idx] ?? emptyimg
}

function getAlvSrc(alv: number): string {
  const idx = `../../assets/img/slot/alv/alv${alv}.png`
  return alvImgs[idx] ?? emptyimg
}

export class SlotImg {

  static getTypeSrc(type: SlotitemImgType): string {
    return getTypeSrc(type)
  }

  static getAlvSrc(alv: number): string {
    return getAlvSrc(alv)
  }

  static getEmptySrc(): string {
    return emptyimg
  }
}
