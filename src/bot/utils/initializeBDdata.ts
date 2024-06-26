import Config from "../models/Config";
import logger from "./logger";

async function initializeBDdata() {
  // Проверьте, существует ли хотя бы один документ в коллекции.
  const userCount = await Config.countDocuments();

  if (userCount === 0) {
    // Если документов нет, создаем начальную запись
    const defaulConfig = new Config({
      oi_growth_period: 15,
      oi_recession_period: 15,
      oi_growth_percentage: 5,
      oi_recession_percentage: 5
    });

    await defaulConfig.save();
    logger.debug(undefined, `Создан дефолтный конфиг в бд`);
  } else {
    logger.error(undefined, `Конфиг уже существует`);
  }
}

export default initializeBDdata;
