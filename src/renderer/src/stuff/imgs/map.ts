import nodataimg from '../../assets/img/map/nodata.png'

const mapImgs = import.meta.glob('../../assets/img/map/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

function getMapSrc(name: string): string {
  const idx = `../../assets/img/map/${name}.png`
  return mapImgs[idx] ?? nodataimg
}

export class MapImg {

  static getSrc(area_id: number, area_no: number): string {
    const area_id_no =
      area_id.toString().padStart(3, '0') + '_' + area_no.toString().padStart(2, '0')
    return getMapSrc(area_id_no)
  }

  static getNodataSrc(): string {
    return nodataimg
  }
}
