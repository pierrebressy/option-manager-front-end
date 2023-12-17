import { useState, useEffect } from "react";
import OptionsListComponent from "./classOptionsListComponent";
import apiClosedContracts, {
  columnsClosedContracts,
} from "../services/api_closed_contracts";
import apiTickerPrices from "../services/api_ticker_prices";
import * as Mychart from "./graphMyChart";
import * as utils from "../services/utils";
import {
  IContractRow,
  IContractTableRow,
  ITickerPriceRow,
} from "../interfaces/datatypes";

let closed_contracts_table: IContractTableRow[] = [];

function ClosedContracts(charId: string) {
  const [closedContracts, setclosedContracts] = useState([] as IContractRow[]);
  const [ticker, setTicker] = useState("ABBV");
  const [contractsToDisplay, setContractsToDisplay] = useState(
    {} as IContractRow[],
  );
  const [, setContractToDisplay] = useState({} as IContractRow);
  const [isTickerPricesMounted, setIsTickerPricesMounted] = useState(false);
  const [isclosedContractsMounted, setIsclosedContractsMounted] =
    useState(false);
  const [tickerPrices, setTickerPrices] = useState([] as ITickerPriceRow[]);
  const [tickerChart] = useState<Mychart.MyChart>(new Mychart.MyChart(charId));

  const handleContractsRowClick = (row: any) => {
    const contract_ref = row.reference;
    const newContractsToDisplay: IContractRow[] = [];
    for (let i = 0; i < closed_contracts_table.length; i++) {
      if (closed_contracts_table[i].reference === contract_ref) {
        newContractsToDisplay.push(closedContracts[i]);
      }
    }
    const newContractToDisplay: IContractRow = row as IContractRow;
    setTicker(newContractToDisplay.ticker);
    setContractsToDisplay(newContractsToDisplay);
    setContractToDisplay(newContractToDisplay);
    setIsTickerPricesMounted(false);
  };

  useEffect(() => {
    !isclosedContractsMounted &&
      apiClosedContracts.getContractsList().then((json) => {
        setIsclosedContractsMounted(true);
        setclosedContracts(json);
        closed_contracts_table.length = 0;
        for (let i = 0; i < json.length; i++) {
          closed_contracts_table = utils.addContractToList(
            closed_contracts_table,
            i,
            json[i],
          );
        }
      });
  }, [isclosedContractsMounted]);

  // load ticker prices from database
  useEffect(() => {
    !isTickerPricesMounted &&
      apiTickerPrices.getTickerPrices(ticker).then((json) => {
        setTickerPrices(json);
        setIsTickerPricesMounted(true);
      });
  }, [isTickerPricesMounted, ticker]);

  // update chart when needed
  useEffect(() => {
    tickerChart.draw(ticker, tickerPrices);
    if (contractsToDisplay.length !== undefined) {
      tickerChart.addContractsToDisplay(contractsToDisplay);
    }
    tickerChart.activate_crosshair();
  }, [
    isTickerPricesMounted,
    tickerPrices,
    tickerPrices.length,
    ticker,
    contractsToDisplay,
    tickerChart,
  ]);

  return (
    <div className="App">
      <section>
        <div>
          <div className="row">
            <div className="col-5">
              {OptionsListComponent(
                "Closed contrats",
                columnsClosedContracts,
                closedContracts,
                handleContractsRowClick,
              )}
            </div>
            <div className="col-5">
              <section>
                <div id={charId}></div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ClosedContracts;
