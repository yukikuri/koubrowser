import nocacheimg from '../../assets/img/ship/nocache.png'

const shipImgs = import.meta.glob('../../assets/img/ship/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const shipDmgImgs = import.meta.glob('../../assets/img/ship-dmg/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const enemyImgs = import.meta.glob('../../assets/img/enemy/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>


function getShipSrc(id: number | string): string {
  const idx = `../../assets/img/ship/s${id}.png`
  return shipImgs[idx] ?? nocacheimg
}

function getShipDmgSrc(id: number | string): string {
  const idx = `../../assets/img/ship-dmg/s${id}.png`
  return shipDmgImgs[idx] ?? nocacheimg
}

function getEnemySrc(id: number): string {
  const idx = `../../assets/img/enemy/s${id}.png`
  return enemyImgs[idx] ?? nocacheimg
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
