/**
 * 
 * @param localTime 
 * @returns 
 */
export function toServerDate(localTime: Date): Date {
  const serverTime = new Date(
    /* UTC */ localTime.getTime() +
      localTime.getTimezoneOffset() * 60000 /* JST = UTC+9 */ +
      9 * 60000 * 60
  )
  return serverTime
}

/**
 * 
 * @returns 
 */
export function currentServerDate(): Date {
  return toServerDate(new Date())
}

/**
 * 指定された日付のクエスト日付文字列を取得する
 * JSTの午前5時を日付の切り替わりとする
 * 
 * @param date 
 * @returns YYYYMMDD形式日付
 */
export function getQuestDateString(date: Date): string {
  return new Date(date.getTime() + 4 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '')
}
