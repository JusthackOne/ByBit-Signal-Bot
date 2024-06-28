import { WebsocketClient, WSClientConfigurableOptions } from "bybit-api";
import { WEBSOCKET_ERRORS, WSCONFIG } from "../utils/CONST";
import loggerWithCtx from "../utils/logger";

class ByBitWebSocketApiService {
  private client: WebsocketClient;
  private OIService;

  constructor(
    WebsocketClientClass: typeof WebsocketClient,
    config: WSClientConfigurableOptions,
    oIService
  ) {
    this.OIService = oIService;
    this.client = new WebsocketClientClass(config);

    // Добавляем обработчик события 'open'
    this.client.on("open", this.onOpenConnection);
    // Optional: Listen to responses to websocket queries (e.g. the response after subscribing to a topic)
    this.client.on("response", this.onResponses);
    this.client.on("update", this.onUpdate);
    this.client.on("close", this.onClose);
    this.client.on("error", this.onError);
  }

  async subscribe(subcribeName: string, TYPE = "linear" as const) : Promise<void> {
    try {
    // (v5) and/or subscribe to individual topics on demand
    await this.client
      .subscribeV5(subcribeName, TYPE)

      
      } catch(err) {
        throw new Error('Can`t subcribe' + err)
      }
  }

  // Метод для обработки события 'open'
  private async onOpenConnection({
    wsKey,
    event
  }: {
    wsKey: string;
    event: Event;
  }) {
    loggerWithCtx.debug(
      undefined,
      "Connection open for websocket with ID:",
      wsKey
    );
  }

  // Метод для обработки события 'response' (после отправления данных на сервер ответ)
  private async onResponses(response: any) {
    loggerWithCtx.debug(undefined, "Get response", response);
  }

  // Метод для обработки события 'update' (получение информации с сервера)
  private async onUpdate(data: any) {}

  // Метод для обработки события 'close'
  private async onClose() {
    loggerWithCtx.debug(undefined, "Close connection");
  }

  private onError = async (err: any) => {
    if (err.ret_msg.includes(WEBSOCKET_ERRORS.not_found)) {
      const ticker = err.ret_msg.replaceAll(WEBSOCKET_ERRORS.not_found, "");
      await this.OIService.deleteTrackable(ticker);
      loggerWithCtx.debug(undefined, `Deleting ticker (not found): `, ticker);
    }
  };

  static getWebsocketClient(OIService): ByBitWebSocketApiService {
    return new ByBitWebSocketApiService(WebsocketClient, WSCONFIG, OIService);
  }
}

export default ByBitWebSocketApiService;
