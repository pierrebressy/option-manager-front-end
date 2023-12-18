import {
  IContractRow,
  ITickerClosingData,
  ITickerPriceRow,
  IBollingerData,
} from "../interfaces/datatypes";
import * as d3 from "d3";
import * as consts from "../services/constants";

export function sumLoiNormale(x: number, mu: number, sigma: number) {
  const xmax = x;
  const xmin = consts.CONTRACT_MIN_PRICE_SIMULATION;
  const num_points = consts.CONTRACT_NUM_POINTS_SIMULATION;
  let dx = (xmax - xmin) / (num_points - 1);
  const price_for_sigma = d3.range(xmin, xmax + dx / 2, dx);
  dx = (xmax - xmin) / num_points;
  let y = price_for_sigma.map((d) => (dx * gaussian(d, mu, sigma)) / sigma);
  let sumy = y.reduce((a, b) => a + b, 0);
  return sumy;
}
export function gaussian(x: number, mu: number, sigma: number) {
  let y = (x - mu) / sigma;
  let z = Math.exp(-(y * y) / 2) / Math.sqrt(2 * Math.PI);
  return z;
}
export function computeGaussianData(sigma: number, currentPriceValue: number) {
  const deltax = 0.01;
  let price_for_sigma = d3.range(0, 2 * currentPriceValue, deltax);
  let y_sigma = price_for_sigma.map((d) =>
    gaussian(d, currentPriceValue, sigma),
  );
  let y_sigma_scaled = price_for_sigma.map(
    (d) => (gaussian(d, currentPriceValue, sigma) * deltax) / sigma,
  );
  let data_sigma = d3.zip(price_for_sigma, y_sigma);
  let data_sigma_int = d3.zip(price_for_sigma, d3.cumsum(y_sigma_scaled));
  return [data_sigma, data_sigma_int];
}
export function getSuccessRate(
  data_sigma: number[][],
  data_sigma_int: number[][],
  strike: number,
) {
  // search the index of the current price
  // and return the success rate from the cumulative gaussian curve
  const x = data_sigma.map((d) => d[0]);
  const index = d3.bisect(x, strike);
  return data_sigma_int[index][1];
}

export function computeOptionPrice(
  price: number = 0,
  strike: number = 0,
  interest_rate: number = 0,
  volatility: number = 0,
  dividend_yield: number = 0,
  num_days_left: number = 0,
) {
  const A = price;
  const B = strike;
  const C = volatility;
  const D = interest_rate;
  const E = dividend_yield;
  const G = num_days_left / consts.NUM_DAYS_YEAR;
  const F = G * consts.NUM_TRADE_DAYS
  const H = Math.log(A / B);
  const I = G * (D - E + (C * C) / 2);
  const J = Math.max(1e-10, C * Math.sqrt(G));
  const K = (H + I) / J;
  const L = K - J;
  const M = sumLoiNormale(K, 0, 1);
  const N = sumLoiNormale(-K, 0, 1);
  const O = sumLoiNormale(L, 0, 1);
  const P = sumLoiNormale(-L, 0, 1);
  const Q = Math.exp(-D * G);
  const R = B * Q;
  const S = Math.exp(-E * G);
  const T = A * S;
/*
  console.log("A=", A);
  console.log("B=", B);
  console.log("C=", C);
  console.log("D=", D);
  console.log("E=", E);
  console.log("F=", F);
  console.log("G=", G);
  console.log("H=", H);
  console.log("I=", I);
  console.log("J=", J);
  console.log("K=", K);
  console.log("L=", L);
  console.log("M=", M);
  console.log("N=", N);
  console.log("O=", O);
  console.log("P=", P);
  console.log("Q=", Q);
  console.log("R=", R);
  console.log("S=", S);
  console.log("T=", T);
*/
  // CALL
  const call_price = T * M - R * O;
  const call_delta = M * S;
  const call_gamma =
    ((Math.exp((-K * K) / 2) / Math.sqrt(2 * Math.PI)) * S) / (A * J);
  const call_theta =
    (-(
      (((A * Math.exp((-K * K) / 2)) / Math.sqrt(2 * Math.PI)) * C * S) /
      (2 * Math.sqrt(G))
    ) -
      D * R * O +
      E * Q * M * S) /
    consts.NUM_TRADE_DAYS;
  const call_vega =
    ((Math.exp((-K * K) / 2) / Math.sqrt(2 * Math.PI)) * S * A * Math.sqrt(G)) /
    100;
  const call_rho = (B * G * Q * O) / 100;
  const call_data = [
    call_price,
    call_delta,
    call_gamma,
    call_theta,
    call_vega,
    call_rho,
  ];

  // PUT
  const put_price = R * P - T * N;
  const put_delta = (M - 1) * S;
  const put_gamma =
    ((Math.exp((-K * K) / 2) / Math.sqrt(2 * Math.PI)) * S) / (A * J);
  const put_theta =
    (-(
      (((A * Math.exp((-K * K) / 2)) / Math.sqrt(2 * Math.PI)) * C * S) /
      (2 * Math.sqrt(G))
    ) +
      D * R * P +
      E * A * N * S) /
    consts.NUM_TRADE_DAYS;
  const put_vega =
    ((Math.exp((-K * K) / 2) / Math.sqrt(2 * Math.PI)) * S * A * Math.sqrt(G)) /
    100;
  const put_rho = (-B * G * Q * P) / 100;
  const put_data = [
    put_price,
    put_delta,
    put_gamma,
    put_theta,
    put_vega,
    put_rho,
  ];

  return [call_data, put_data];
}

export function dateToYYYYYMMDD(d: Date) {
  var yyyy = d.getFullYear().toString();
  var mm = (d.getMonth() + 1).toString(); // getMonth() is zero-based
  var dd = d.getDate().toString();
  return (
    yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0])
  );
}

export function findIndexByDate(date: Date, close: ITickerClosingData[]) {
  if (close && close.length > 0) {
    let d0 = close[0].date;
    if (d0 && date < d0) return -1;
    let d1 = close[close.length - 1].date;
    if (d1 && date > d1) return close.length - 1;
  }

  const bisectDate = d3.bisector<ITickerClosingData, Date>(
    (d) => d.date as Date,
  ).left;
  const i = bisectDate(close, date, 1);
  return i;
}

export function computeStartDate(duration: string) {
  var d = new Date();

  if (duration === "All") {
    d = new Date("1970-01-01");
  } else if (duration === "1 Year") {
    d.setMonth(d.getMonth() - 12);
  } else if (duration === "6 Months") {
    d.setMonth(d.getMonth() - 6);
  } else if (duration === "3 Months") {
    d.setMonth(d.getMonth() - 3);
  } else if (duration === "1 Month") {
    d.setMonth(d.getMonth() - 1);
  }
  return d;
}

export function addContractToList(
  contracts_list: any,
  id: number,
  contract: IContractRow,
) {
  contracts_list.push({
    id: id,
    reference: contract.reference,
    open_by: contract.openedBy,
    close_by: contract.closedBy,
    type: contract.type,
    qty: contract.qty,
    ticker: contract.ticker,
    strike: contract.strike,
    expiration: contract.expiration,
    PL_ratio: contract.plRatio,
  });

  return contracts_list;
}

export function computeSma(
  closing: ITickerClosingData[],
  duration: number = 20,
) {
  let sma: ITickerClosingData[] = [];
  let sum = 0;

  for (let i = 0; i < closing.length; i++) {
    sum += +closing[i].close;
    if (i >= duration) {
      sum -= +closing[i - duration].close;
      sma.push({ date: closing[i].date, close: sum / duration });
    }
  }
  return sma;
}

export function computeBollingerBands(
  closing: ITickerClosingData[],
  duration: number = 20,
) {
  let bollinger: IBollingerData[] = [];
  let sum = 0;
  let sum2 = 0;
  let std = 0;
  let std2 = 0;

  for (let i = 0; i < closing.length; i++) {
    sum += +closing[i].close;
    sum2 += +closing[i].close * +closing[i].close;
    if (i >= duration) {
      sum -= +closing[i - duration].close;
      sum2 -= +closing[i - duration].close * +closing[i - duration].close;
      std = Math.sqrt((sum2 - (sum * sum) / duration) / duration);
      std2 = 2 * std;
      bollinger.push({
        date: closing[i].date,
        close: sum / duration,
        std: std,
        std2: std2,
      });
    }
  }
  return bollinger;
}

export function prepareData(tickerPrices: ITickerPriceRow[], minDate: any) {
  let closingPrice: ITickerClosingData[] = [];
  let tmpSma: ITickerClosingData[] = [];
  let sma20: ITickerClosingData[] = [];
  let sma50: ITickerClosingData[] = [];
  let sma200: ITickerClosingData[] = [];
  let closing: ITickerClosingData[] = [];
  let open: ITickerClosingData[] = [];
  let close: ITickerClosingData[] = [];
  let low: ITickerClosingData[] = [];
  let high: ITickerClosingData[] = [];
  let ratio: ITickerClosingData[] = [];

  for (let i = 0; i < tickerPrices.length; i++) {
    let d: ITickerClosingData = {} as ITickerClosingData;
    d.date = new Date(tickerPrices[i].date);
    //d.close = tickerPrices[i].price;
    d.close = tickerPrices[i].close;
    closingPrice.push(d);
    if (d.date >= minDate) {
      closing.push(d);
    }
  }

  for (let i = 0; i < tickerPrices.length; i++) {
    let d: ITickerClosingData = {} as ITickerClosingData;
    d.date = new Date(tickerPrices[i].date);
    d.close = tickerPrices[i].open;
    if (d.date >= minDate) {
      open.push(d);
    }
  }
  for (let i = 0; i < tickerPrices.length; i++) {
    let d: ITickerClosingData = {} as ITickerClosingData;
    d.date = new Date(tickerPrices[i].date);
    d.close = tickerPrices[i].close;
    if (d.date >= minDate) {
      close.push(d);
    }
  }
  for (let i = 0; i < tickerPrices.length; i++) {
    let d: ITickerClosingData = {} as ITickerClosingData;
    d.date = new Date(tickerPrices[i].date);
    d.close = tickerPrices[i].low;
    if (d.date >= minDate) {
      low.push(d);
    }
  }
  for (let i = 0; i < tickerPrices.length; i++) {
    let d: ITickerClosingData = {} as ITickerClosingData;
    d.date = new Date(tickerPrices[i].date);
    d.close = tickerPrices[i].high;
    if (d.date >= minDate) {
      high.push(d);
    }
  }

  tmpSma = computeSma(closingPrice, 20);
  for (let i = 0; i < tmpSma.length; i++) {
    let d = tmpSma[i].date;
    if (d && d >= minDate) {
      sma20.push(tmpSma[i]);
    }
  }
  tmpSma = computeSma(closingPrice, 50);
  for (let i = 0; i < tmpSma.length; i++) {
    let d = tmpSma[i].date;
    if (d && d >= minDate) {
      sma50.push(tmpSma[i]);
    }
  }
  tmpSma = computeSma(closingPrice, 200);
  for (let i = 0; i < tmpSma.length; i++) {
    let d = tmpSma[i].date;
    if (d && d >= minDate) {
      sma200.push(tmpSma[i]);
    }
  }
  for (let i = 0; i < tmpSma.length; i++) {
    let d = tmpSma[i].date;
    if (d && d >= minDate) {
      let tmp: ITickerClosingData = {} as ITickerClosingData;
      tmp.date = tmpSma[i].date;
      //tmp.close = "0.00";
      tmp.close = 0.0;
      ratio.push(tmp);
    }
  }
  return { open, close, low, high, sma20, sma50, sma200, ratio };
}
