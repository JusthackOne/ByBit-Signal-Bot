export const update_oi = (
  symbol: string,
  period: number,
  oi_perseteges: number,
  oi_change_value: number,
  change_price: number,
  signals_count: number
): string => {
  let message: string = "";

  message += `💼 Изменение OI — <i>${period}м</i> — <b>${symbol}</b>\n`;
  message += `<b>📈 ОИ вырос на ${oi_perseteges}% (${oi_change_value} млн. $)</b>\n`;
  message += `<b>💰 Изменение цены: ${change_price}%</b>\n`;
  message += `❗️ Сигнал за сутки: ${signals_count}\n\n`;

  message += `<a href="https://www.bybit.com/ru-RU/trade/spot/${symbol.replace(
    "USDT",
    ""
  )}/USDT">Bybit</a> | `;
  message += `<a href="https://www.binance.com/ru/trade/${symbol.replace(
    "USDT",
    ""
  )}_USDT?type=spot">Binance</a> | `;
  message += `<a href="https://www.coinglass.com/ru/currencies/${symbol.replace(
    "USDT",
    ""
  )}">Coinglass</a>`;

  return message;
};

export function formatNumberToMillion(number: number): number {
  const million = 1_000_000;
  let formattedNumber = number / million;

  // Округляем до двух знаков после запятой
  formattedNumber = Math.round(formattedNumber * 100) / 100;

  return formattedNumber;
}
