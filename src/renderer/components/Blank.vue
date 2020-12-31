<template>
  <div></div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class extends Vue {

  @Prop({default: 'blank'})
  public tag!: string;

  public constructor() {
    super();
    console.debug('blank ctor', this.tag);
  }

  private beforeCreate() {
    console.debug('blank before created');
  }

  private created() {
    console.debug('blank created', this.tag);
  }

  private beforeMount() {
    console.debug('blank before mount', this.tag);
  }

  private mounted() {
    console.debug('blank mounted', this.tag);
  }

  private beforeUpdate() {
    console.debug('blank before update', this.tag);
  }

  private updated() {
    console.debug('blank updated', this.tag);
  }

  private beforeDestroy() {
    console.debug('blank before destroy', this.tag);
  }

  private destroyed() {
    console.debug('blank destroyed', this.tag);
  }
}
</script>
