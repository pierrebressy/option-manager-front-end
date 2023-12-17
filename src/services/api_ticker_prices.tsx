import { ITickerPriceRow } from "../interfaces/datatypes";

const apiTickerPrices = () => {
  const getTickerPrices = async (
    ticker: string,
  ): Promise<ITickerPriceRow[]> => {
    console.log(
      "api_ticker_prices::getTickerPrices: loading data from database... (async) ticker=",
      ticker,
    );
    return await fetch(
      "http://localhost:8000/api/get_symbol_prices?symbol=" + ticker,
      { method: "GET" },
    ).then((res) => res.json());
  };
  return {
    getTickerPrices,
  };
};

export default apiTickerPrices();
