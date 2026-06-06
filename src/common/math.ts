export interface TotalRate {
  total: number
  rates: number[]
}

/**
 *
 */
export class MathUtil {
  /**
   *
   */
  static floor(value: number, base: number): number {
    const pow = Math.pow(10, base)
    return Math.trunc(value * pow) / pow
  }

  /**
   *
   */
  static totalRate(rates: number[]): TotalRate {
    const calc = rates.reduce<{ total: number; nohit: number; rates: number[] }>(
      (acc, rate) => {
        const r = acc.nohit * rate
        acc.rates.push(r)
        acc.total += r
        acc.nohit = acc.nohit - r
        return acc
      },
      { total: 0, nohit: 1, rates: [] }
    )
    return {
      total: calc.total,
      rates: calc.rates
    }
  }

  /**
   * 
   * @param min 
   * @param max 
   * @returns 
   */
  static getRandomInt(min, max): number{
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
