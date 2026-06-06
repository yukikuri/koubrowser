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
