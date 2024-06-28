import { ITrackable, ITrackableModel } from "../models/Trackable";
import { WEBSOCKET_STREAM } from "../utils/CONST";
import loggerWithCtx from "../utils/logger";
import ByBitWebSocketApiService from "./api.service";

class OIService {
  private Trackables: ITrackableModel;
  public API: ByBitWebSocketApiService;
  private Bot;
  public test: string;

  constructor(trackables: ITrackableModel, api: ByBitWebSocketApiService, bot) {
    this.Trackables = trackables;
    this.API = api;
    this.Bot = bot;
    this.test = "1";
  }

  // При запуске бота
  async onStartApp() {
    const data: ITrackable[] = await this.Trackables.find().exec();
    for (const item of data) {
      await this.subcribeTicker(item);
    }
  }

  async subcribeTicker(ticker: ITrackable) {
    await this.API.subscribe(WEBSOCKET_STREAM.tickers + ticker.symbol);
  }

  async subcribeNewTicker(symbol: string) : Promise<Boolean> {
    try {
    await this.API.subscribe(WEBSOCKET_STREAM.tickers + symbol);
    return true
  } catch (err) {
    return false
  }
  }

  async deleteTrackable(symbol: string) {
    const isTrackableExist = await this.Trackables.findOne({symbol}).exec()
    if ((isTrackableExist)) {
    await this.Trackables.deleteOne({ symbol }).exec();
  }
  }

  static getOIService(
    trackables,
    api: ByBitWebSocketApiService | undefined,
    bot
  ) {
    return new OIService(trackables, api, bot);
  }
}

export default OIService;
