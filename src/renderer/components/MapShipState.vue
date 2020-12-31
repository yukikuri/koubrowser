<template>
  <div>
    <div
      v-for="(ship, index) in ships"
      :key="index"
      :mst="mst=mstShip(ship)"
    >
      <div>{{mst.api_name}} Lv {{ship.api_lv}}</div>
      <div>{{ship.api_nowhp}}/{{ship.api_maxhp}}&nbsp;</div>
      <div>燃料:{{ship.api_fuel}}/{{mst.api_fuel_max}}&nbsp;</div>
      <div>弾薬:{{ship.api_bull}}/{{mst.api_bull_max}}&nbsp;</div>
      <span class="cond">cond:{{ship.api_cond}}&nbsp;</span>
        <span>火力:{{ship.api_karyoku[0]}}/{{ship.api_karyoku[1]}}&nbsp;</span>
        <span>雷装:{{ship.api_raisou[0]}}/{{ship.api_raisou[1]}}&nbsp;</span>
        <span>対空:{{ship.api_taiku[0]}}/{{ship.api_taiku[1]}}&nbsp;</span>
        <span>装甲:{{ship.api_soukou[0]}}/{{ship.api_soukou[1]}}&nbsp;</span>
        <span>回避:{{ship.api_kaihi[0]}}/{{ship.api_kaihi[1]}}&nbsp;</span>
        <span>索敵:{{ship.api_sakuteki[0]}}/{{ship.api_sakuteki[1]}}&nbsp;</span>
        <span>slotnum:{{ship.api_slotnum}}&nbsp;</span>
        <div
          class="slotitems"
          v-for="(slotitem_id, slot_index) in ship.api_slot"
          :key="slot_index"
          :slotitem="slotitem=slotitemFromId(slotitem_id)"
          :msts="msts=mstSlotitem(slotitem)"
        >
        <span v-if="slotitem !== undefined && msts !== undefined">
           <span>{{msts.api_name}}&nbsp;</span>
           <span>slotitem_id:{{slotitem_id}}&nbsp;</span>
           <span v-if="Number.isInteger(slotitem.api_level)">★{{slotitem.api_level}}&nbsp;</span>
           <span v-if="Number.isInteger(slotitem.api_alv)">熟練度:{{slotitem.api_alv}}&nbsp;</span>
           <span>搭載数:{{ship.api_onslot[slot_index]}}/{{mst.api_maxeq[slot_index]}}&nbsp;</span>
           <span class="aa" v-if="hasAADefence(msts)">制空値:{{slotSeiku(msts, slotitem, ship.api_onslot[slot_index])}}&nbsp;</span>
         </span>
       </div>
       <span v-if="ship.api_slot_ex !== -1">拡張スロット:{{ship.api_slot_ex}}&nbsp;</span>
     </div>
   </div>
</template>

<script lang="ts">
import {
  SvData,
  ApiShip,
  ApiSlotitem,
  MstShip,
  MstSlotitem,
  ApiMissionStateIndex,
  KcsUtil,
  SlotitemType,
  ApiDeckPort
} from "@/lib/kcs";
import { svdata } from "@/renderer/store/svdata";
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({
  components: {},
})
export default class extends Vue {

  @Prop({required: true})
  public deck!: ApiDeckPort;

  private shipFromId(ship_id: number): ApiShip | undefined {
    return svdata.ship(ship_id);
  }

  private mstShip(ship: ApiShip): MstShip | undefined {
    if (ship) {
      return svdata.mstShipSafe(ship.api_ship_id);
    }
  }

  private slotitemFromId(slotitem_id: number): ApiSlotitem | undefined {
    return svdata.slotitem(slotitem_id);
  }

  private mstSlotitem(slotitem: ApiSlotitem | undefined) : MstSlotitem | undefined {
    if (slotitem) {
      return svdata.mstSlotitem(slotitem.api_slotitem_id);
    }
  }
  
  private hasAADefence(mst: MstSlotitem): boolean {
    if (! mst) {
      return false;
    }
    return KcsUtil.hasAADefence(mst.api_type[2]);
  }
  
  private slotSeiku(mst: MstSlotitem, slotitem: ApiSlotitem, carried: number): number {
    if (! mst || ! slotitem) {
      return 0;
    }
    return  KcsUtil.slotSeiku(mst, slotitem, carried);
  }

  private deckFire(): number {
    let ret = 0;
    const deck = this.deck;
    deck.api_ship.forEach(ship_id=> {
      const ship = svdata.ship(ship_id);
      if (ship) {
        ret += ship.api_karyoku[0];
      }
    });
    return ret;
  }

  private deckASW(): number {
    let ret = 0;
    const deck = this.deck;
    deck.api_ship.forEach(ship_id=> {
      const ship = svdata.ship(ship_id);
      if (ship) {
        ret += ship.api_taisen[0];
      }
    });
    return ret;
  }

  private deckLos(): number {
    let ret = 0;
    const deck = this.deck;
    deck.api_ship.forEach(ship_id=> {
      const ship = svdata.ship(ship_id);
      if (ship) {
        ret += ship.api_sakuteki[0];
      }
    });
    return ret;
  }

  private deckAA(): number {
    let ret = 0;
    const deck = this.deck;
    deck.api_ship.forEach(ship_id=> {
      const ship = svdata.ship(ship_id);
      if (ship) {
        ret += ship.api_taiku[0];
      }
    });
    return ret;
  }

  private deckSeiku(): number {
    return svdata.deckSeiku(this.deck);
  }

  private shipSrc(ship: ApiShip): string {
    return `./img/ship/s${ship.api_ship_id}.png`;
  }

  private missioning(data: number[]): boolean {
    return data[ApiMissionStateIndex.state] !== 0;
  }

  private missionState(data: number[]): String {
    const mission = svdata.mission(data[ApiMissionStateIndex.mission_id]);
    const mst = svdata.mstMission(data[ApiMissionStateIndex.mission_id]);
    if (mission && mst) {
      let s: String[] = [];
      s.push(mst.api_name);
      s.push(data[ApiMissionStateIndex.time].toString());
      const dt = new Date(data[ApiMissionStateIndex.time]);
      s.push(dt.toLocaleString());
      return s.join(" ");
    }
    return "";
  }
}
</script>

<style lang="scss" scoped>
.ship-img {
  width: 80px;
}
.weapon-img {
  width: 40px;
}
.deck-name {
  color: yellow;
  font-weight: bold;
}
.deckport {
  font-size: 85%;
}
.aa {
  color: yellow;
}
.cond {
  color: yellow;
}
</style>
