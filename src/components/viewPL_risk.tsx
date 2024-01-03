import { useState, useEffect } from "react";

import * as api from "../services/backendApi";
import { columnsMonthlyPl } from "../services/backendApi";
import { columnsMonthlyRisk } from "../services/backendApi";

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
      //apiMonthlyPl.getPLMonthly().then((json: any) => {
      api.getPLMonthly().then((json: any) => {
        setPLMonthly(json);
        setIsPLMonthlyMounted(true);
      });
  }, [isPLMonthlyMounted, plMonthly]);

  // load risk monthly from database
  useEffect(() => {
    !isRiskMonthlyMounted &&
      //apiMonthlyRisk.getRiskMonthly().then((json: any) => {
      api.getRiskMonthly().then((json: any) => {
        setRiskMonthly(json);
        setIsRiskMonthlyMounted(true);
      });
  }, [isRiskMonthlyMounted, riskMonthly]);

  const handle = (row: any) => {};

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
