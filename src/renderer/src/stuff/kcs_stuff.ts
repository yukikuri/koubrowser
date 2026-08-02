import { svdata } from "@renderer/store/svdata";
import { mapInfo as storeMapInfo } from '@renderer/store/mapinfo'
import { ApiGaugeType } from "@common/kcs";
import { computed } from "vue";

export function isGimmickFlagDetected() {
  const ret = computed<boolean>(() => {
    return svdata.svdataRaw.gimmickFlagDetected;
  })
  return {computed: ret};
}

export function isMapChangeDetected() {
  const ret = computed<boolean>(() => {
    return svdata.svdataRaw.mapChangeDetected;
  })
  return {computed: ret};
}

// 輸送ゲージマップがある場合、輸送値を表示する
// 輸送値は常には表示しない
// 常に表示しないのは、表示が煩雑になることを避けるため
export function isShowYusou() {
  const ret = computed<boolean>(() => {
    const svdataMapInfos = svdata.mapinfos;
    if (svdataMapInfos.length) {
      return !!svdataMapInfos.some(mi => mi.api_gauge_type === ApiGaugeType.yusou)
    }
    return storeMapInfo.api_map_info.some(mi => mi.api_gauge_type === ApiGaugeType.yusou)
  });
  return {computed: ret};
}
