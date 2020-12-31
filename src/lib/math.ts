
export interface TotalRate {
  total: number;
  rates: number[];
}

/**
 * 
 */
export class MathUtil {

  /**
   * 
   */
  public static floor(value: number, base: number): number {
    const pow = Math.pow(10, base);
    return Math.trunc(value * pow) / pow;
  }

  /**
   * 
   */
  public static totalRate(rates: number[]): TotalRate {
    const calc =  rates.reduce<{total: number, nohit: number, rates: number[]}>((acc, rate) => {
      const r = acc.nohit*rate;
      acc.rates.push(r);
      acc.total += r;
      acc.nohit = (acc.nohit - r);
      return acc;
    }, { total: 0, nohit: 1, rates: []});
    return {
      total: calc.total,
      rates: calc.rates
    };
  }
}
