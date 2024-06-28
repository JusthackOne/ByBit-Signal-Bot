import { CategoryV5 } from "bybit-api";
import { ITrackable, ITrackableModel } from "../models/Trackable";
import { IDS, WEBSOCKET_STREAM } from "../utils/CONST";
import loggerWithCtx from "../utils/logger";
import { BYBIT_API } from "..";
import { IByBitApiResponse } from "./api.service";
import ByBitLinear_OI from "../models/ByBitLinear_OI";
import Config, { IConfig } from "../models/Config";
import { getConfigFileParsingDiagnostics } from "typescript";
import { Context } from "telegraf";
import { formatNumberToMillion, update_oi } from "../utils/messages";
import axios from "axios";
import mongoose from "mongoose";

class OIService {
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
    }
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

  async unSubcribeTicker(symbol: string, type: CategoryV5): Promise<Boolean> {
    try {
      await BYBIT_API.unSubscribe(WEBSOCKET_STREAM.tickers + symbol, type);
      return true;
    } catch (err) {
      return false;
    }
  }

  public async getTickerUpdate(data: IByBitApiResponse): Promise<void> {
    const wsKey = data.wsKey;
    const values = data.data;
    const result = (
      await axios.get(
        `https://api.bybit.com/v5/market/tickers?category=${
          wsKey === "v5LinearPublic" ? "linear" : "spot"
        }&symbol=${values.symbol}`
      )
    ).data.result.list[0];

    const config: IConfig = (await Config.find().exec())[0];
    const ticker = await ByBitLinear_OI.findOne({
      symbol: values.symbol
    }).exec();

    if (!ticker) {
      loggerWithCtx.debug(undefined, values, { values, result });
      const newByBitLinear_OI = await ByBitLinear_OI.create({
        symbol: values.symbol,
        openInterestValue: result?.openInterestValue
          ? result.openInterestValue
          : undefined,
        lastPrice: result.lastPrice,
        last_update: new Date(),
        h24_signal_count: 0
      });

      await newByBitLinear_OI.save();
      return;
    }

    // Добавляем минуты к дате из Mongoose
    const updateTime = new Date(
      ticker.last_update.getTime() + config.oi_growth_period * 60000
    );

    if (updateTime.getTime() <= new Date().getTime()) {
      loggerWithCtx.debug(undefined, "updateData", {
        1: updateTime.getTime(),
        2: new Date().getTime()
      });
      await ByBitLinear_OI.updateOne(
        { symbol: values.symbol }, // критерий поиска по symbol
        {
          openInterestValue: result.openInterestValue,
          lastPrice: result.lastPrice,
          last_update: new Date()
        } // данные для обновления
      );

      return;
    }

    switch (wsKey) {
      case "v5LinearPublic":
        const oi_growth_percentage: number | undefined = Number(
          (
            (Number(values.openInterestValue) / ticker.openInterestValue) *
              100 -
            100
          ).toFixed(2)
        );

        if (
          values?.openInterestValue &&
          oi_growth_percentage >= config.oi_growth_percentage
        ) {
          loggerWithCtx.debug(undefined, "updateData change", {
            2: oi_growth_percentage,
            1: config.oi_growth_percentage
          });
          const oi_change_value: number = formatNumberToMillion(
            Number(result.openInterestValue) - ticker.openInterestValue
          );

          const change_price: string = (
            (Number(result.lastPrice) / ticker.lastPrice) * 100 -
            100
          ).toFixed(2);

          const signals_count = ticker.h24_signal_count;

          for (const id of IDS) {
            try {
              await this.Bot.telegram.sendMessage(
                id,
                update_oi(
                  values.symbol,
                  config.oi_growth_period,
                  oi_growth_percentage,
                  oi_change_value,
                  change_price,
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

          await ByBitLinear_OI.updateOne(
            { symbol: values.symbol }, // критерий поиска по symbol
            {
              openInterestValue: result.openInterestValue,
              lastPrice: result.lastPrice,
              last_update: Date.now(),
              h24_signal_count: ticker.h24_signal_count + 1
            } // данные для обновления
          );
        }
    }
  }

  async deleteTrackable(symbol: string) {
    const isTrackableExist = await this.Trackables.findOne({ symbol }).exec();
    if (isTrackableExist) {
      await this.Trackables.deleteOne({ symbol }).exec();
    }
  }

  static getOIService(
    trackables,

    bot: Context
  ) {
    return new OIService(trackables, bot);
  }
}

export default OIService;
