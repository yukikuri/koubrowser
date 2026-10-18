import * as original from '@common/locale'
import { t } from './i18n'
export * from '@common/locale'

function labels<T extends object>(value: T): T {
  return new Proxy(value, {
    get(target, key, receiver) {
      const result: unknown = Reflect.get(target, key, receiver)
      return typeof result === 'string' ? t(result) : result
    }
  })
}
export const SyateiText = labels(original.SyateiText)
export const SokuText = labels(original.SokuText)
export const FACutinText = labels(original.FACutinText)
export const AACutinText = labels(original.AACutinText)
export const SlotitemRareTextMap = labels(original.SlotitemRareTextMap)
export const SenseiTaisenText = labels(original.SenseiTaisenText)
export const DeckNames = labels(original.DeckNames)
export const CombinedNames = labels(original.CombinedNames)
export const DispSeikuText = labels(original.DispSeikuText)
export const TacticsText = labels(original.TacticsText)
export const QuestCategoryText = labels(original.QuestCategoryText)
export const QuestTypeText = labels(original.QuestTypeText)
export const getQuestTypeTextYear = (): string => t(original.QuestTypeTextYear, [], 'quest-period')
export const MapLvText = labels(original.MapLvText)
export const StateText = labels(original.StateText)
export const AirbaseActionKindText = labels(original.AirbaseActionKindText)
export const FormationShortText = labels(original.FormationShortText)
export const ShipTypeText = labels(original.ShipTypeText)
export const ShipRareText = labels(original.ShipRareText)
export const AirSearchResultText = labels(original.AirSearchResultText)
export const AirBaseActionKindText = labels(original.AirBaseActionKindText)
export const getYCutinText = (...args: Parameters<typeof original.getYCutinText>): string => t(original.getYCutinText(...args))
export const getYSCutinText = (...args: Parameters<typeof original.getYSCutinText>): string => t(original.getYSCutinText(...args))
export const getTacticsText = (...args: Parameters<typeof original.getTacticsText>): string => t(original.getTacticsText(...args))
export const getStateText = (...args: Parameters<typeof original.getStateText>): string => t(original.getStateText(...args))
export const getFormationText = (...args: Parameters<typeof original.getFormationText>): string => t(original.getFormationText(...args))
export const getFormationShortText = (...args: Parameters<typeof original.getFormationShortText>): string => t(original.getFormationShortText(...args))
export const getShipRareText = (...args: Parameters<typeof original.getShipRareText>): string => t(original.getShipRareText(...args))
export const getAirSearchResultText = (...args: Parameters<typeof original.getAirSearchResultText>): string => t(original.getAirSearchResultText(...args))
export const getAirBaseActionKindText = (...args: Parameters<typeof original.getAirBaseActionKindText>): string => t(original.getAirBaseActionKindText(...args))
