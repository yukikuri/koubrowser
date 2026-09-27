import { Const } from '@common/const'
import noimg from '../../assets/img/item/noimg.png'

function getItemSrc(id: number): string {
  return `${Const.AssetsCdnUrl}/img/item/item${id}.png`
}

export class ItemImg {

  static getSrc(id: number): string {
    return getItemSrc(id)
  }

  static getNodataSrc(): string {
    return noimg
  }
}
