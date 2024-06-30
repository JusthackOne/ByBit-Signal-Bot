import {
  CategoryV5,
  WebsocketClient,
  WSClientConfigurableOptions
} from "bybit-api";

import { WSCONFIG, WSKEY } from "../utils/CONST";
import loggerWithCtx from "../utils/logger";
import { ByBitService } from "./../index";
import { CategoryV5 } from "bybit-api";
import executeIfNotRunning from "../utils/executeIfNotRunning";

export interface IByBitApiResponse {
  topic: string;
  type: "delta" | "snapshot";
  data: {
    symbol: string;
    lastPrice?: string;
    openInterestValue?: string;
  };
  wsKey: "v5LinearPublic" | "v5SpotPublic";
}

export interface IByBitApiResponseLiquidation {
  topic: string;
  type:  "snapshot";
  data: {
    symbol: string;
    side: 'Buy' | 'Sell';
    price: string
  };
  wsKey: "v5LinearPublic" | "v5SpotPublic";
}


class ByBitWebSocketApiService {
  private client: WebsocketClient;

  constructor(
    WebsocketClientClass: typeof WebsocketClient,
    config: WSClientConfigurableOptions
  ) {
    this.client = new WebsocketClientClass(config);

    // Добавляем обработчик события 'open'
    this.client.on("open", this.onOpenConnection);
    // Optional: Listen to responses to websocket queries (e.g. the response after subscribing to a topic)
    this.client.on("response", this.onResponses);
    this.client.on("update", this.onUpdate);
    this.client.on("close", this.onClose);
    this.client.on("error", this.onError);
  }

  async subscribe(subcribeName: string, TYPE: CategoryV5): Promise<void> {
    try {
      // (v5) and/or subscribe to individual topics on demand
      await this.client.subscribeV5(subcribeName, TYPE);
    } catch (err) {
      throw new Error(`Cant subcribe ${TYPE}` + err);
    }
  }

  async unSubscribe(subcribeName: string, TYPE: CategoryV5): Promise<void> {
    try {
      this.client.unsubscribeV5(subcribeName, TYPE);
    } catch (err) {
      throw new Error("Can`t subcribe" + err);
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
  private async onUpdate(data: IByBitApiResponse | IByBitApiResponseLiquidation) {
    const wsKey = data.wsKey; // get topic of responst

    if (wsKey.includes(WSKEY.linear)) {
      await executeIfNotRunning(
        () => ByBitService.getTickerUpdateOI(data),
        data.data.symbol + ".OI"
      );

      await executeIfNotRunning(
        () => ByBitService.getTickerUpdateREKT(data),
        data.data.symbol + ".REKT"
      );

      await executeIfNotRunning(
        () => ByBitService.getTickerUpdatePUMP(data, "linear"),
        data.data.symbol + ".PUMP"
      );
    } else if (wsKey.includes(WSKEY.spot)) {
      await executeIfNotRunning(
        () => ByBitService.getTickerUpdatePUMP(data, "spot"),
        data.data.symbol + ".PUMP"
      );
    }
  }

  // Метод для обработки события 'close'
  private async onClose() {
    loggerWithCtx.debug(undefined, "Close connection");
  }

  private onError = async (err: any) => {
    // if (err.ret_msg.includes(WEBSOCKET_ERRORS.not_found)) {
    //   const ticker = err.ret_msg.replaceAll(WEBSOCKET_ERRORS.not_found, "");
    //   await ByBitService.deleteTrackable(ticker);
    //   loggerWithCtx.debug(undefined, `Deleting ticker (not found): `, ticker);
    // }
  };

  static getWebsocketClient(): ByBitWebSocketApiService {
    return new ByBitWebSocketApiService(WebsocketClient, WSCONFIG);
  }
}

export default ByBitWebSocketApiService;
