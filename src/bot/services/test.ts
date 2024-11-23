import Binance from "binance-api-node";

const client = Binance.default();

client.time().then((time) => console.log(time));
