import { IConfig } from "../models/Config";

export const getMainPumpText = (config: IConfig): string => {
  return `<b>🤖 Я сканирую рынок на маленькие пампы, чтобы искать точки входа в ЛОНГ 📈 и большие пампы, чтобы искать точки входа в ШОРТ 📉\n\n</b><i>Текущие настройки:</i>\n📈 Период роста: ${config.pump_growth_period} мин\n🟩 Процент роста: ${config.pump_growth_percentage}%\n\n📉 Период просадки: ${config.pump_recession_period} мин\n🟥 Процент просадки: ${config.pump_recession_percentage}%`;
};

export const getMainOIText = (config: IConfig): string => {
  return `<b>🤖 Я сканирую рынок на предмет роста Open Interest</b>\n\n <i>Текущие настройки:</i>\n📈 Период роста: ${config.oi_growth_period} мин\n🟩 Процент роста: ${config.oi_growth_percentage}%\n\n📉 Период просадки: ${config.oi_recession_period} мин\n🟥 Процент просадки: ${config.oi_recession_percentage}%`;
};


export const getMainREKTText = (config: IConfig): string => {
  return `<b>🤖 Я сканирую рынок на ликвидации.</b>\n\nТекущие настройки:\n🔻 Лимит минимальной ликвидации: ${config.rekt_limit}`
};
