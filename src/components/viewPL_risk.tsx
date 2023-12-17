import { useState, useEffect } from "react";
import apiMonthlyRisk, {
  columnsMonthlyRisk,
} from "../services/api_risk_monthly";
import apiMonthlyPl, { columnsMonthlyPl } from "../services/api_pl_monthly";
import { IMonthlyPlRow, IMonthlyRiskRow } from "../interfaces/datatypes";

import OptionsListComponent from "./classOptionsListComponent";

function PL_risk() {
  const [plMonthly, setPLMonthly] = useState([] as IMonthlyPlRow[]);
  const [isPLMonthlyMounted, setIsPLMonthlyMounted] = useState(false);
  const [riskMonthly, setRiskMonthly] = useState([] as IMonthlyRiskRow[]);
  const [isRiskMonthlyMounted, setIsRiskMonthlyMounted] = useState(false);

  // load pl monthly from database
  useEffect(() => {
    !isPLMonthlyMounted &&
      apiMonthlyPl.getPLMonthly().then((json: any) => {
        setPLMonthly(json);
        setIsPLMonthlyMounted(true);
        console.log("useEffect: api_pl_monthly", json);
        console.log("useEffect: api_pl_monthly", plMonthly.length);
      });
  }, [isPLMonthlyMounted, plMonthly]);

  // load risk monthly from database
  useEffect(() => {
    !isRiskMonthlyMounted &&
      apiMonthlyRisk.getRiskMonthly().then((json: any) => {
        setRiskMonthly(json);
        setIsRiskMonthlyMounted(true);
        console.log("useEffect: api_risk_monthly", json);
      });
  }, [isRiskMonthlyMounted, riskMonthly]);

  const handle = (row: any) => {
    console.log("handle", row);
  };

  return (
    <div className="App">
      <section>
        <div>
          <div className="row">
            <div className="col-4">
              {OptionsListComponent(
                "P&L (monthly)",
                columnsMonthlyPl,
                plMonthly,
                handle,
              )}
            </div>
            <div className="col-4">
              {OptionsListComponent(
                "Risk (monthly)",
                columnsMonthlyRisk,
                riskMonthly,
                handle,
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PL_risk;
