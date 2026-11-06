/**
 * revision レジストリ
 * 
 * アプリ実装任務情報revision
 * 外部任務情報を登録する前に参照する
 * 
 * アプリrevision >= 外部任務情報revision : 外部任務情報無視
 * アプリrevision <  外部任務情報revision : 外部任務情報使用
 */
const questRevisions = new Map<number, number>()

/**
 * revision取得
 * 
 * @param id 
 * @returns 
 */
export function getQuestRevision(id: number): number {
  return questRevisions.get(id) ?? 0
}

/**
 * revision設定
 * 
 * @param id 
 * @param revision 
 */
function setQuestRevision(id: number, revision: number): void {
  questRevisions.set(id, revision)
}

// 1053: 再編二十駆「天霧」「狭霧」南方へ展開せよ！
setQuestRevision(1053, 2026101502)
