export const update_oi = (
  symbol: string,
  period: number,
  oi_perseteges: number,
  oi_change_value: number,
  change_price: number,
  signals_count: number,
  type: "recession" | "growth"
): string => {
  let message: string = "";

  message += `🟣 Изменение OI — <i>${period}м</i> — <b>#${symbol}</b> 🟣\n`;
  message += `<b>${type === "growth" ? "📈 ОИ:" : "📉 ОИ:"} ${
    type === "growth" ? `+${oi_perseteges}` : `-${oi_perseteges}`
  }% ( ${oi_change_value} млн. $)</b>\n`;
  message += `<b>💰 Изменение цены: ${change_price}%</b>\n`;
  message += `❗️ Сигналов за сутки: ${signals_count}\n\n`;

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

export const update_pump = (
  symbol: string,
  period: number,
  price_change: number,
  lastPrice: number,
  nowPrice: number,
  signals_count: number,
  type: "recession" | "growth"
): string => {
  let message: string = "";

  message += `🔵 <b>${
    type === "growth" ? "🛫 PUMP" : "🔻 DUMP"
  }</b> — <i>${period}м</i> — <b>#${symbol}</b> 🔵\n`;
  message += `<b>${type === "growth" ? "📈" : "📉"} Цена: ${
    type === "growth" ? `+${price_change}` : `-${price_change}`
  }% (${lastPrice}-${nowPrice})</b>\n`;

  message += `❗️ Сигналов за сутки: ${signals_count}\n\n`;

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

export const update_rekt = (
  symbol: string,
  price: number,
  side: "Sell" | "Buy",

  signals_count: number
): string => {
  let message: string = "";

  message += `<b>${side === "Sell" ? `🔴 #${symbol}` : `🟢 #${symbol}`} rekt `;
  message += `${side === "Sell" ? `Short` : `Long`}: $${price}</b>\n`;

  message += `❗️ Сигналов за сутки: ${signals_count}\n\n`;

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
