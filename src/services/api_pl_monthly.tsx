import { IMonthlyPlRow } from "../interfaces/datatypes";

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

const apiMonthlyPl = () => {
  const getPLMonthly = async (): Promise<IMonthlyPlRow[]> => {
    console.log(
      "api_pl_monthly::getPLMonthly: loading data from database... (async)",
    );
    return await fetch("http://localhost:8000/api/get_pl_monthly", {
      method: "GET",
    }).then((res) => res.json());
  };
  return {
    getPLMonthly,
  };
};

export default apiMonthlyPl();
