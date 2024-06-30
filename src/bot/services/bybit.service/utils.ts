import { IByBit_PUMP } from "../../models/ByBit_PUMP";
import { IByBitLinear_OI } from "../../models/ByBitLinear_OI";
import { IConfig } from "../../models/Config";
import { calculatePercentageChange } from "../../utils/math";
import { IByBitApiResponse } from "../api.service";

interface IgetUpdateTime {
  updateTimeGrowth: Date;
  updateTimeRecession: Date;
}

interface IgetUpdateOIPercentage {
  oi_change_growth: number;
  oi_change_recession: number;
}

interface IgetUpdatePUMPPercentage {
  pump_change_growth: number;
  pump_change_recession: number;
}

export const getUpdateTimeOI = (
  ticker: IByBitLinear_OI,
  config: IConfig
): IgetUpdateTime => {
  // Добавляем минуты к дате из Mongoose
  const updateTimeGrowth = new Date(
    new Date(String(ticker.last_update_growth)).getTime() +
      config.oi_growth_period * 60000
  );

  const updateTimeRecession = new Date(
    new Date(String(ticker.last_update_recession)).getTime() +
      config.oi_recession_period * 60000
  );
  return { updateTimeGrowth, updateTimeRecession };
};

export const getUpdateTimePUMP = (
  ticker: IByBit_PUMP,
  config: IConfig
): IgetUpdateTime => {
  // Добавляем минуты к дате из Mongoose
  const updateTimeGrowth = new Date(
    new Date(String(ticker.last_update_growth)).getTime() +
      config.pump_growth_period * 60000
  );

  const updateTimeRecession = new Date(
    new Date(String(ticker.last_update_recession)).getTime() +
      config.pump_recession_period * 60000
  );
  return { updateTimeGrowth, updateTimeRecession };
};

export const getOpenInterestValueChange = (
  updateData: IByBitApiResponse["data"],
  ticker: IByBitLinear_OI
): IgetUpdateOIPercentage => {
  const oi_change_growth: number = Number(
    calculatePercentageChange(
      ticker.openInterestValueGrowth,
      Number(updateData.openInterestValue)
    ).toFixed(2)
  );

  const oi_change_recession: number = Number(
    calculatePercentageChange(
      ticker.openInterestValueRecession,
      Number(updateData.openInterestValue)
    ).toFixed(2)
  );

  return { oi_change_growth, oi_change_recession };
};

export const getPumpChange = (
  updateData: IByBitApiResponse["data"],
  ticker: IByBit_PUMP
): IgetUpdatePUMPPercentage => {
  const pump_change_growth: number = Number(
    calculatePercentageChange(
      ticker.priceGrowth,
      Number(updateData.lastPrice)
    ).toFixed(2)
  );

  const pump_change_recession: number = Number(
    calculatePercentageChange(
      ticker.priceRecession,
      Number(updateData.lastPrice)
    ).toFixed(2)
  );

  return { pump_change_recession, pump_change_growth };
};
