import moment from 'moment'

export const nowString = (): string => {
  return moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS')
}

/**
 * 深い階層を探索して最初に見つかったキー名の値を返す
 */
export const findOne = (obj: any, keyNames: string[]): any | undefined => {
  if (typeof obj !== "object" || obj === null) return undefined;

  for (const [key, value] of Object.entries(obj)) {
    if (keyNames.indexOf(key) !== -1) {
      return value; // 最初に見つかったら即 return
    }

    if (typeof value === "object" && value !== null) {
      const found = findOne(value, keyNames);
      if (found !== undefined) {
        return found; // 再帰で見つかった場合も即 return
      }
    }
  }

  return undefined; // 見つからなかった
}

