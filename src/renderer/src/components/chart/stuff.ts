import Highcharts from 'highcharts';
import theme from 'highcharts/themes/dark-unica';
import stockInit from 'highcharts/modules/stock';

let initialized = false;

/**
 * 
 */
export function initialize(): void {
  if (! initialized) {
    initialized = true;
    stockInit(Highcharts);
    theme(Highcharts);
  }
}
