/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/no-explicit-any */
import Vue, { VNode } from 'vue';

declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}
