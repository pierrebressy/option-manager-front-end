import { IContractRow } from "../interfaces/datatypes";
import { IMonthlyPlRow } from "../interfaces/datatypes";
import { IMonthlyRiskRow } from "../interfaces/datatypes";
import { ITickerPriceRow } from "../interfaces/datatypes";

export const columnsClosedContracts = [
  {
    name: "Open by",
    selector: (row: { openedBy: any }) => row.openedBy,
    sortable: true,
    compact: false,
    width: "120px",
  },
  {
    name: "Close by",
    selector: (row: { closedBy: any }) => row.closedBy,
    sortable: true,
    compact: true,
    width: "120px",
  },
  {
    name: "Qty",
    selector: (row: { qty: any }) => row.qty,
    sortable: true,
    compact: true,
    width: "50px",
    //right: true,
  },
  {
    name: "Type",
    selector: (row: { type: any }) => row.type,
    sortable: true,
    width: "140px",
    compact: true,
  },
  {
    name: "Ticker",
    selector: (row: { ticker: any }) => row.ticker,
    sortable: true,
    width: "70px",
    compact: true,
  },
  {
    name: "Strike",
    selector: (row: { strike: any }) => row.strike,
    sortable: true,
    width: "50px",
    //right: true,
    compact: true,
  },
  {
    name: "Expiration",
    selector: (row: { expiration: any }) => row.expiration,
    sortable: true,
    width: "130px",
    compact: false,
  },
];

export const columnsOpenedContracts = [
  {
    name: "Open by",
    selector: (row: { openedBy: any }) => row.openedBy,
    sortable: true,
    compact: false,
    width: "120px",
  },
  {
    name: "Qty",
    selector: (row: { qty: any }) => row.qty,
    sortable: true,
    compact: true,
    width: "50px",
    //right: true,
  },
  {
    name: "Type",
    selector: (row: { type: any }) => row.type,
    sortable: true,
    width: "140px",
    compact: true,
  },
  {
    name: "Ticker",
    selector: (row: { ticker: any }) => row.ticker,
    sortable: true,
    width: "70px",
    compact: true,
  },
  {
    name: "Strike",
    selector: (row: { strike: any }) => row.strike,
    sortable: true,
    width: "50px",
    //right: true,
    compact: true,
  },
  {
    name: "Expiration",
    selector: (row: { expiration: any }) => row.expiration,
    sortable: true,
    width: "130px",
    compact: false,
  },
];

export const columnsOpenedShortPuts = [
  {
    name: "Open by",
    selector: (row: { openedBy: any }) => row.openedBy,
    sortable: true,
    compact: false,
    width: "120px",
  },
  {
    name: "Qty",
    selector: (row: { qty: any }) => row.qty,
    sortable: true,
    compact: true,
    width: "50px",
    //right: true,
  },
  {
    name: "Ticker",
    selector: (row: { ticker: any }) => row.ticker,
    sortable: true,
    width: "70px",
    compact: true,
  },
  {
    name: "Strike",
    selector: (row: { strike: any }) => row.strike,
    sortable: true,
    width: "50px",
    //right: true,
    compact: true,
  },
  {
    name: "Expiration",
    selector: (row: { expiration: any }) => row.expiration,
    sortable: true,
    width: "130px",
    compact: false,
  },
  {
    name: "P&L (%)",
    selector: (row: { plRatio: any }) => row.plRatio,
    right: true,
    sortable: true,
    format: (row: { plRatio: any }) => {
      return row.plRatio.toFixed(0);
    },
    conditionalCellStyles: [
      {
        when: (row: { plRatio: any }) => row.plRatio > 0,
        style: {
          //backgroundColor: 'white',
          color: "lightgreen",
        },
      },
      {
        when: (row: { plRatio: any }) => row.plRatio < 0,
        style: {
          //backgroundColor: 'white',
          color: "red",
          "&:hover": {
            cursor: "pointer",
          },
        },
      },
    ],
  },
];

export const columnsMonthlyPl = [
  {
    name: "Year",
    selector: (row: { year: any }) => row.year,
    width: "100px",
    //sortable: true,
  },
  {
    name: "Month",
    selector: (row: { month: any }) => row.month,
    width: "100px",
    //sortable: true,
  },
  {
    name: "P&L",
    selector: (row: { PL: any }) => row.PL,

    //compact: false,
    width: "100px",
    right: true,

    format: (row: { PL: any }) => {
      return row.PL.toFixed(2);
    },
    conditionalCellStyles: [
      {
        when: (row: { PL: any }) => row.PL > 0,
        style: {
          color: "lightgreen",
        },
      },
      {
        when: (row: { PL: any }) => row.PL < 0,
        style: {
          color: "red",
          "&:hover": {
            cursor: "pointer",
          },
        },
      },
    ],
  },
];

export const columnsMonthlyRisk = [
  {
    name: "Year",
    selector: (row: { year: any }) => row.year,
    sortable: true,
  },
  {
    name: "Month",
    selector: (row: { month: any }) => row.month,
    sortable: true,
  },
  {
    name: "Risk",
    selector: (row: { risk: any }) => row.risk,
    sortable: true,
    right: true,
    style: {
      color: "lightgreen",
    },
  },
];

export async function getTickerPrices(
  ticker: string,
): Promise<ITickerPriceRow[]> {
  return await fetch(
    "http://localhost:8000/api/get_symbol_prices?symbol=" + ticker,
    { method: "GET" },
  ).then((res) => res.json());
}

export async function getRiskMonthly(): Promise<IMonthlyRiskRow[]> {
  return await fetch("http://localhost:8000/api/get_risk_monthly", {
    method: "GET",
  }).then((res) => res.json());
}

export async function getPLMonthly(): Promise<IMonthlyPlRow[]> {
  return await fetch("http://localhost:8000/api/get_pl_monthly", {
    method: "GET",
  }).then((res) => res.json());
}

export function getClosedContractsList(): Promise<IContractRow[]> {
  return fetch("http://localhost:8000/api/get_closed_contracts_list", {
    method: "GET",
  }).then((res) => res.json());
}

export function getOpenedContractsList(): Promise<IContractRow[]> {
  return fetch("http://localhost:8000/api/get_opened_contracts_list", {
    method: "GET",
  }).then((res) => res.json());
}

export function getOpenedShortPutsContractsList(): Promise<IContractRow[]> {
  return fetch("http://localhost:8000/api/get_opened_short_put_list", {
    method: "GET",
  }).then((res) => res.json());
}
