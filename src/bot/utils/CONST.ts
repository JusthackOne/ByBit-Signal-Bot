import { WSClientConfigurableOptions } from "bybit-api";

export const MAIN_ROUTES = {
  OI: "💼 OI Screener",
  PUMP: "📈 Pump Screener",
  REKT: "💣 REKT Screener",
  CREATE: "🟢 Отслеживать новую пару",
  DELETE: "🔴 Удалить пару"
};

export const OI_ROUTES = {
  UP_PERIOD: "📈 Период роста",
  DOWN_PERIOD: "📉 Период просадки",
  UP_PERCENTEGES: "🟩 Процент роста",
  DOWN_PERCENTEGES: "🟥 Процент просадки"
};

export const PUMP_ROUTES = {
  UP_PERIOD: "📈 Период лонг",
  DOWN_PERIOD: "📉 Период шорт",
  UP_PERCENTEGES: "🟩 Процент лонг",
  DOWN_PERCENTEGES: "🟥 Процент шорт"
};

export const REKT_ROUTES = {
  SET_LIMIT: "🔻 Установить минимальную ликвидацию"
};

export const BACK_ROUTES = {
  BACK: "⬅️ Назад"
};

export const SESSION_FIELDS = {
  DELETE_MESSAGES: "deleteMessages" as const,
  CHANGE: "change" as const
};

export const ACTIONS = {
  DELETE_TRACKABLE: "deleteTrackable",
  NEXT_DELETE_TRACKABLE: "next_deleteTrackable",
  PREV_DELETE_TRACKABLE: "prev_deleteTrackable",

  CLOSE: "close",
  NONE: "none"
};

export const IDS = [998972268, 1189241784]

export const TRACKABLE_KEYBOARD_ITEMS = 6;

export const WSCONFIG : WSClientConfigurableOptions = {
  /*
    The following parameters are optional:
  */

  // Connects to livenet by default. Set testnet to true to use the testnet environment.

  // If you can, use the v5 market (the newest generation of Bybit's websockets)
  market: "v5"

  // how long to wait (in ms) before deciding the connection should be terminated & reconnected
  // pongTimeout: 1000,

  // how often to check (in ms) that WS connection is still alive
  // pingInterval: 10000,

  // how long to wait before attempting to reconnect (in ms) after connection is closed
  // reconnectTimeout: 500,

  // recv window size for authenticated websocket requests (higher latency connections (VPN) can cause authentication to fail if the recv window is too small)
  // recvWindow: 5000,

  // config options sent to RestClient (used for time sync). See RestClient docs.
  // restOptions: { },

  // config for axios used for HTTP requests. E.g for proxy support
  // requestOptions: { }

  // override which URL to use for websocket connections
  // wsUrl: 'wss://stream.bybit.com/v5/public'
};

export const WEBSOCKET_STREAM = {
  tickers: "tickers."
};

export const WEBSOCKET_ERRORS = {
  not_found: "error:handler not found,topic:tickers."
};
