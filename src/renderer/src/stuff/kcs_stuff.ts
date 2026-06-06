import { svdata } from "@renderer/store/svdata";
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
