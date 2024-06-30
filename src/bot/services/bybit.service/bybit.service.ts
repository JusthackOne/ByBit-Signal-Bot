import { CategoryV5 } from "bybit-api";
import { Context } from "telegraf";
import axios from "axios";

import { ITrackable, ITrackableModel } from "../../models/Trackable";
import ByBitLinear_OI from "../../models/ByBitLinear_OI";
import Config, { IConfig } from "../../models/Config";
import { IDS, WEBSOCKET_STREAM } from "../../utils/CONST";
import loggerWithCtx from "../../utils/logger";
import {
  formatNumberToMillion,
  update_oi,
  update_pump,
  update_rekt
} from "../../utils/messages";
import {
  IByBitApiResponse,
  IByBitApiResponseLiquidation
} from "../api.service";
import { BYBIT_API } from "../..";
import {
  getOpenInterestValueChange,
  getPumpChange,
  getUpdateTimeOI,
  getUpdateTimePUMP
} from "./utils";
import ByBit_PUMP from "../../models/ByBit_PUMP";
import ByBit_REKT from "../../models/ByBit_REKT";
import moment from "moment-timezone";
import { differenceInMilliseconds } from "date-fns";
import { calculatePercentageChange } from "../../utils/math";

class ByBitService {
  private Trackables: ITrackableModel;

  private Bot: Context;
  public test: string;

  constructor(
    trackables: ITrackableModel,

    bot: Context
  ) {
    this.Trackables = trackables;

    this.Bot = bot;
  }

  // При запуске бота
  async onStartApp() {
    const data: ITrackable[] = await this.Trackables.find().exec();
    for (const ticker of data) {
      await this.subcribeTicker(ticker.symbol, ticker.type);
      if (ticker.type === "linear") {
        await this.subcribeLiquidation(ticker.symbol, ticker.type);
      }
    }
  }

  // При запуске бота
  public async signalCheckAndClear() {
    let diff: number;

    const updateTime = () => {
      const now = new Date();
      const moscowTime = moment.tz(now, "Europe/Moscow").toDate(); // опредляем текущее время в Москве

      // Определяем ближайшее время 19:58 в Московском времени
      let midnight = moment
        .tz("Europe/Moscow")
        .set({
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0
        })
        .toDate();

      // Если текущее время уже прошло 19:58 сегодня, выбираем завтрашнее время 19:58
      if (moscowTime > midnight) {
        midnight = moment(midnight).add(1, "day").toDate();
      }

      diff = differenceInMilliseconds(midnight, moscowTime);
      loggerWithCtx.debug(undefined, "update time", { diff });
    };

    // Для выполнения функции обновления времени и запуска сигнала:
    const executeAfterDelay = () => {
      updateTime();
      setTimeout(() => {
        this.clearSignals(diff);
        executeAfterDelay(); // Повторяем цикл
      }, diff);
    };

    executeAfterDelay();
  }

  public async clearSignals(diff) {
    loggerWithCtx.debug(undefined, "ClearSignals", diff);
    await ByBitLinear_OI.updateMany(
      {},
      { h24_signal_count_growth: 0, h24_signal_count_recession: 0 }
    );
    await ByBit_PUMP.updateMany(
      {},
      { h24_signal_count_growth: 0, h24_signal_count_recession: 0 }
    );
    await ByBit_REKT.updateMany({}, { h24_signal_count_liq: 0 });
  }

  async subcribeTicker(symbol: string, type: CategoryV5) {
    try {
      await BYBIT_API.subscribe(WEBSOCKET_STREAM.tickers + symbol, type);
      return true;
    } catch (error) {
      loggerWithCtx.debug(
        undefined,
        `Error to subcribe (start app) to ticker ${symbol} type: ${type}`,
        error
      );
      return false;
    }
  }

  async subcribeLiquidation(symbol: string, type: CategoryV5) {
    try {
      await BYBIT_API.subscribe(WEBSOCKET_STREAM.liquidation + symbol, type);
      return true;
    } catch (error) {
      loggerWithCtx.debug(
        undefined,
        `Error to subcribe (start app) to Liquidation ${symbol} type: ${type}`,
        error
      );
      return false;
    }
  }

  async unSubcribeTicker(symbol: string, type: CategoryV5): Promise<Boolean> {
    try {
      await BYBIT_API.unSubscribe(WEBSOCKET_STREAM.tickers + symbol, type);
      return true;
    } catch (err) {
      return false;
    }
  }

  async unSubcribeLiquidation(
    symbol: string,
    type: CategoryV5
  ): Promise<Boolean> {
    try {
      await BYBIT_API.unSubscribe(WEBSOCKET_STREAM.liquidation + symbol, type);
      return true;
    } catch (err) {
      return false;
    }
  }

  public async getTickerUpdateOI(data: IByBitApiResponse): Promise<void> {
    const updateData = data.data;
    const tickerData = (
      await axios.get(
        `https://api.bybit.com/v5/market/tickers?category=linear&symbol=${updateData.symbol}`
      )
    ).data.result.list[0];

    const config: IConfig = (await Config.find().exec())[0];
    const ticker = await ByBitLinear_OI.findOne({
      symbol: updateData.symbol
    }).exec();

    // If doens`t exist row in bybit_ois table
    if (!ticker) {
      const newByBitLinear_OI = await ByBitLinear_OI.create({
        symbol: updateData.symbol,
        openInterestValueGrowth: tickerData.openInterestValue,
        openInterestValueRecession: tickerData.openInterestValue,

        lastPriceGrowth: tickerData.lastPrice,
        lastPriceRecession: tickerData.lastPrice,

        last_update_recession: new Date(),
        last_update_growth: new Date(),
        h24_signal_count_growth: 0,
        h24_signal_count_recession: 0
      });

      await newByBitLinear_OI.save();
      return;
    }

    const { updateTimeGrowth, updateTimeRecession } = getUpdateTimeOI(
      ticker,
      config
    );

    if (updateTimeGrowth.getTime() <= new Date().getTime()) {
      loggerWithCtx.debug(undefined, "Update time gr", {
        1: updateTimeGrowth,
        10: ticker.last_update_growth,
        101: config.oi_growth_period,
        2: new Date(),
        3: ticker.symbol
      });
      await ByBitLinear_OI.updateOne(
        { symbol: updateData.symbol }, // критерий поиска по symbol
        {
          openInterestValueGrowth: updateData.openInterestValue,
          lastPriceGrowth: tickerData.lastPrice,
          last_update_growth: new Date()
        } // данные для обновления
      );
    }

    if (updateTimeRecession.getTime() <= new Date().getTime()) {
      loggerWithCtx.debug(undefined, "Update time rec", {
        1: updateTimeRecession,
        2: new Date(),
        3: updateData.symbol
      });
      const result = await ByBitLinear_OI.updateOne(
        { symbol: updateData.symbol },
        {
          openInterestValueRecession: updateData.openInterestValue,
          lastPriceRecession: tickerData.lastPrice,
          last_update_recession: new Date()
        }
      );
    }

    if (!updateData?.openInterestValue) {
      return;
    }

    const { oi_change_growth, oi_change_recession } =
      getOpenInterestValueChange(updateData, ticker);

    const change_price: number = Number(
      calculatePercentageChange(
        ticker.lastPriceGrowth,
        tickerData.lastPrice
      ).toFixed(2)
    );

    const signals_count = ticker.h24_signal_count_growth + 1;

    if (oi_change_growth >= config.oi_growth_percentage) {
      const oi_change_value: number = formatNumberToMillion(
        Number(updateData.openInterestValue) - ticker.openInterestValueGrowth
      );
      for (const id of IDS) {
        try {
          await this.Bot.telegram.sendMessage(
            id,
            update_oi(
              updateData.symbol,
              config.oi_growth_period,
              oi_change_growth,
              oi_change_value,
              change_price,
              signals_count,
              "growth"
            ),
            {
              parse_mode: "HTML",
              link_preview_options: { is_disabled: true }
            }
          );
        } catch (err) {
          loggerWithCtx.error(undefined, "Can`t send meessage", err);
        }
      }

      await ByBitLinear_OI.updateOne(
        { symbol: updateData.symbol },
        {
          openInterestValueGrowth: updateData.openInterestValue,
          lastPriceGrowth: tickerData.lastPrice,
          last_update_growth: Date.now(),
          h24_signal_count_growth: Number(signals_count)
        }
      );
    } else if (
      oi_change_recession < 0 &&
      Math.abs(oi_change_recession) >= config.oi_recession_percentage
    ) {
      const oi_change_value: number = formatNumberToMillion(
        Number(updateData.openInterestValue) - ticker.openInterestValueRecession
      );
      for (const id of IDS) {
        try {
          await this.Bot.telegram.sendMessage(
            id,
            update_oi(
              updateData.symbol,
              config.oi_recession_period,
              Math.abs(oi_change_recession),
              oi_change_value,
              change_price,
              signals_count,
              "recession"
            ),
            {
              parse_mode: "HTML",
              link_preview_options: { is_disabled: true }
            }
          );
        } catch (err) {
          loggerWithCtx.error(undefined, "Can`t send meessage", err);
        }
      }

      await ByBitLinear_OI.updateOne(
        { symbol: updateData.symbol },
        {
          openInterestValueRecession: updateData.openInterestValue,
          lastPriceRecession: tickerData.lastPrice,
          last_update_recession: Date.now(),
          h24_signal_count_recession: Number(signals_count)
        }
      );
    }
  }

  public async getTickerUpdatePUMP(
    data: IByBitApiResponse,
    type: CategoryV5
  ): Promise<void> {
    const updateData = data.data;
    const tickerData = (
      await axios.get(
        `https://api.bybit.com/v5/market/tickers?category=${type}&symbol=${updateData.symbol}`
      )
    ).data.result.list[0];

    const config: IConfig = (await Config.find().exec())[0];
    const ticker = await ByBit_PUMP.findOne({
      symbol: updateData.symbol
    }).exec();

    // If doens`t exist row in bybit_pump table
    if (!ticker) {
      const newByBit_PUMP = await ByBit_PUMP.create({
        symbol: updateData.symbol,
        priceGrowth: tickerData.lastPrice,
        priceRecession: tickerData.lastPrice,
        last_update_recession: new Date(),
        last_update_growth: new Date(),
        h24_signal_count_growth: 0,
        h24_signal_count_recession: 0
      });

      await newByBit_PUMP.save();
      return;
    }

    const { updateTimeGrowth, updateTimeRecession } = getUpdateTimePUMP(
      ticker,
      config
    );

    if (updateTimeGrowth.getTime() <= new Date().getTime()) {
      loggerWithCtx.debug(undefined, "Update time gr", {
        1: updateTimeGrowth,
        10: ticker.last_update_growth,
        101: config.oi_growth_period,
        2: new Date(),
        3: ticker.symbol
      });
      await ByBit_PUMP.updateOne(
        { symbol: updateData.symbol }, // критерий поиска по symbol
        {
          priceGrowth: updateData.lastPrice,
          last_update_growth: new Date()
        } // данные для обновления
      );
    }

    if (updateTimeRecession.getTime() <= new Date().getTime()) {
      loggerWithCtx.debug(undefined, "Update time rec", {
        1: updateTimeRecession,
        2: new Date(),
        3: updateData.symbol
      });
      await ByBit_PUMP.updateOne(
        { symbol: updateData.symbol },
        {
          priceRecession: updateData.lastPrice,
          last_update_recession: new Date()
        }
      );
    }

    if (!updateData?.lastPrice) {
      return;
    }

    const { pump_change_recession, pump_change_growth } = getPumpChange(
      updateData,
      ticker
    );

    if (pump_change_growth >= config.pump_growth_percentage) {
      const signals_count = ticker.h24_signal_count_growth + 1;

      for (const id of IDS) {
        try {
          await this.Bot.telegram.sendMessage(
            id,
            update_pump(
              updateData.symbol,

              config.pump_growth_period,
              pump_change_growth,
              ticker.priceGrowth,
              Number(updateData.lastPrice),
              signals_count,
              "growth"
            ),
            {
              parse_mode: "HTML",
              link_preview_options: { is_disabled: true }
            }
          );
        } catch (err) {
          loggerWithCtx.error(undefined, "Can`t send meessage", err);
        }
      }

      await ByBit_PUMP.updateOne(
        { symbol: updateData.symbol },
        {
          priceGrowth: Number(updateData.lastPrice),
          last_update_growth: Date.now(),
          h24_signal_count_growth: Number(signals_count)
        }
      );
    } else if (
      pump_change_recession < 0 &&
      Math.abs(pump_change_recession) >= config.pump_recession_percentage
    ) {
      const signals_count = ticker.h24_signal_count_recession + 1;

      for (const id of IDS) {
        try {
          await this.Bot.telegram.sendMessage(
            id,
            update_pump(
              updateData.symbol,

              config.pump_growth_period,
              Math.abs(pump_change_recession),
              ticker.priceRecession,
              Number(updateData.lastPrice),
              signals_count,
              "recession"
            ),
            {
              parse_mode: "HTML",
              link_preview_options: { is_disabled: true }
            }
          );
        } catch (err) {
          loggerWithCtx.error(undefined, "Can`t send meessage", err);
        }
      }

      await ByBit_PUMP.updateOne(
        { symbol: updateData.symbol },
        {
          priceRecession: Number(updateData.lastPrice),
          last_update_recession: Date.now(),
          h24_signal_count_recession: Number(signals_count)
        }
      );
    }
  }

  public async getTickerUpdateREKT(
    data: IByBitApiResponseLiquidation
  ): Promise<void> {
    const updateData = data.data;

    const config: IConfig = (await Config.find().exec())[0];
    const ticker = await ByBit_REKT.findOne({
      symbol: updateData.symbol
    }).exec();

    // If doens`t exist row in bybit_rekt table
    if (!ticker) {
      const newByBit_REKT = await ByBit_REKT.create({
        symbol: updateData.symbol,
        h24_signal_count_liq: 0
      });

      await newByBit_REKT.save();
      return;
    }

    if (!updateData?.price) {
      return;
    }

    if (Number(updateData.price) >= config.rekt_limit) {
      const signals_count = ticker.h24_signal_count_liq + 1;

      for (const id of IDS) {
        try {
          await this.Bot.telegram.sendMessage(
            id,
            update_rekt(
              updateData.symbol,
              Number(updateData.price),
              updateData.side,
              signals_count
            ),
            {
              parse_mode: "HTML",
              link_preview_options: { is_disabled: true }
            }
          );
        } catch (err) {
          loggerWithCtx.error(undefined, "Can`t send meessage", err);
        }
      }

      await ByBit_REKT.updateOne(
        { symbol: updateData.symbol },
        {
          h24_signal_count_liq: signals_count
        }
      );
    }
  }

  async deleteTrackable(symbol: string) {
    const isTrackableExist = await this.Trackables.findOne({ symbol }).exec();
    if (isTrackableExist) {
      await this.Trackables.deleteOne({ symbol }).exec();
    }
  }

  static getByBitService(
    trackables,

    bot: Context
  ) {
    return new ByBitService(trackables, bot);
  }
}

export default ByBitService;
