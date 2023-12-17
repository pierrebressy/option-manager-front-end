import { IContractRow } from "../interfaces/datatypes";

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

const apiOpenedContracts = () => {
  const getContractsList = (): Promise<IContractRow[]> => {
    return fetch("http://localhost:8000/api/get_opened_contracts_list", {
      method: "GET",
    }).then((res) => res.json());
  };
  return {
    getContractsList,
  };
};

export default apiOpenedContracts();
