import { IMonthlyRiskRow } from "../interfaces/datatypes";

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

const apiMonthlyRisk = () => {
  const getRiskMonthly = async (): Promise<IMonthlyRiskRow[]> => {
    console.log(
      "api_risk_monthly::getRiskMonthly: loading data from database... (async)",
    );
    return await fetch("http://localhost:8000/api/get_risk_monthly", {
      method: "GET",
    }).then((res) => res.json());
  };
  return {
    getRiskMonthly,
  };
};

export default apiMonthlyRisk();
