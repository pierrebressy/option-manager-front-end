import { IContractRow } from "../interfaces/datatypes";

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

const apiOpenedShortPuts = () => {
  const getContractsList = (): Promise<IContractRow[]> => {
    return fetch("http://localhost:8000/api/get_opened_short_put_list", {
      method: "GET",
    }).then((res) => res.json());
  };
  return {
    getContractsList,
  };
};

export default apiOpenedShortPuts();
