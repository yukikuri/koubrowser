import { Const } from '@common/const'
import nocacheimg from '../../assets/img/ship/nocache.png'

function getShipSrc(id: number | string): string {
  return `${Const.AssetsCdnUrl}/img/ship/s${id}.png`
}

function getShipDmgSrc(id: number | string): string {
  return `${Const.AssetsCdnUrl}/img/ship-dmg/s${id}.png`
}

function getEnemySrc(id: number): string {
  return `${Const.AssetsCdnUrl}/img/enemy/s${id}.png`
}

export class ShipImg {

  static getSrc(id: number | string, isDmg: boolean): string {
    return isDmg ? getShipDmgSrc(id) : getShipSrc(id)
  }

  static getEnemySrc(id: number): string {
    return getEnemySrc(id)
  }

  static getNoCacheSrc(): string {
    return nocacheimg
  }
}
