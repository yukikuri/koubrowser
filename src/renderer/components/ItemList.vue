<template>
  <div class="item-list">
    <div v-if="isDataOk" class="item-grid">
      <div v-for="(item, index) in items" :key="index" :title="item.name">
        <span>
          <img class="item-img" :src="item.src">
        </span>
        <div class="item-count">{{item.api.api_count}}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { SvData, ApiUseItem, MstUseitem, ApiItemId } from '@/lib/kcs';
import { svdata } from '@/renderer/store/svdata';
import { RUtil } from '@/renderer/util';
import { toUnicode } from 'punycode';
import { Component, Vue } from 'vue-property-decorator';

interface ItemInfo {
  api: ApiUseItem;
  name: string;
  src: string;
}

const toItemInfo = (id: ApiItemId, count: number): ItemInfo => {
  const mst = svdata.mstUseItem(id);
  return { 
    api: { api_id: id, api_count: count }, 
    name: mst?.api_name ?? '', 
    src: RUtil.itemImg(id),
  };
};

const slotitemToItemInfo = (id: ApiItemId, slotitem_id: number): ItemInfo | undefined => {
  const count = svdata.slotitems.reduce((acc, el) => {
    //console.log(el);
    acc = acc + ((el.api_slotitem_id === slotitem_id) ? 1 : 0);
    return acc;
  }, 0);
  console.log('slotitemid:', slotitem_id, count);
  if (! count) {
    return ;
  }

  const mst = svdata.mstUseItem(id);
  return { 
    api: { api_id: id, api_count: count },
    name: mst?.api_name ?? '', 
    src: RUtil.itemImg(id),
  };
};


@Component({
  components: {},
})
export default class extends Vue {

  private get isDataOk() {
    return svdata.useitems.length > 0;
  }

  private get items(): ItemInfo[] {
    const ignore = [79, 81, 82, 83, 84];
    const ret = svdata.useitems.reduce<ItemInfo[]>((acc, api) => {
      if (ignore.includes(api.api_id)) {
        return acc;
      }

      const mst = svdata.mstUseItem(api.api_id);
      if (mst) {
        acc.push({api, name: mst.api_name, src: RUtil.itemImg(api.api_id)});
      }
      return acc;
    }, []);


    // material
    ret.push(toItemInfo(ApiItemId.fast_repair, svdata.fastRepair));
    ret.push(toItemInfo(ApiItemId.fast_build, svdata.fastBuild));
    ret.push(toItemInfo(ApiItemId.build_kit, svdata.buildKit));
    ret.push(toItemInfo(ApiItemId.remodel_kit, svdata.remodelKit));

    // slotitem
    const slotitems: [ApiItemId, number][] = [
      [ApiItemId.emergency_repair, 42],
      [ApiItemId.emergency_repair_god, 43],
      [ApiItemId.rice_ball, 145],
      [ApiItemId.saury_canning, 150],
      [ApiItemId.special_rice_ball, 241],
    ];
    slotitems.forEach((el) => {
      const info = slotitemToItemInfo(el[0], el[1]);
      console.log(info);
      if (info) {
        ret.push(info);
      }
    });
  
    return ret.sort((a,b) => a.api.api_id - b.api.api_id);
  }

}
</script>

