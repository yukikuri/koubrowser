import * as Highcharts from 'highcharts';
import theme from 'highcharts/themes/dark-unica';
import stockInit from 'highcharts/modules/stock';

export class ChartStuff {
  public static initialize(): void {
    stockInit(Highcharts);
    theme(Highcharts);    
  }
}
