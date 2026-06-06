import noimg from '../../assets/img/item/noimg.png'

const itemImgs = import.meta.glob('../../assets/img/item/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>

function getItemSrc(id: number): string {
  const idx = `../../assets/img/item/item${id}.png`
  return itemImgs[idx] ?? noimg
}

export class ItemImg {

  static getSrc(id: number): string {
    return getItemSrc(id)
  }

}
