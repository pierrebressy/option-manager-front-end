import { NamespaceBody } from "typescript";

export interface I2DPoint {
  x: number;
  y: number;
}

export interface I2DSize {
  width: number;
  height: number;
}

export interface ITickerClosingData {
  date: Date | null;
  close: number;
}

export interface IOptionProfitAndLostData {
  price: number;
  pl: number;
}

export interface ITickerCurveDescriptor {
  ticker: string;
  tickerPrices: ITickerPriceRow[];
  lineColor: string;
  visibility: string;
  value: number[];
  ratio: number[];
  element: any;
}

export interface IBollingerData {
  date: Date | null;
  close: number;
  std: number;
  std2: number;
}

export interface ITickerPriceRow {
  date: string;
  open: number;
  close: number;
  low: number;
  high: number;
}

export interface IContractTableRow {
  reference: number;
  openedBy: string;
  closedBy: string;
  type: string;
  qty: number;
  ticker: string;
  strike: number;
  expiration: string;
}

export interface IContractRow {
  id: number;
  reference: number;
  openedBy: string;
  closedBy: string;
  type: string;
  qty: number;
  ticker: string;
  strike: number;
  expiration: string;
  openPremium: number;
  closePremium: number;
  plRatio: number;
  pru: number;
}

export interface IMonthlyPlRow {
  year: string;
  month: string;
  pl: number;
}

export interface IMonthlyRiskRow {
  year: string;
  risk: number;
}
