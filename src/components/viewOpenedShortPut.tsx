import { useState, useEffect } from "react";
import OptionsListComponent from "./classOptionsListComponent";

import * as api from "../services/backendApi";
import { columnsOpenedShortPuts } from "../services/backendApi";

import * as utils from "../services/utils";
import {
  IContractRow,
  IContractTableRow,
  ITickerPriceRow,
} from "../interfaces/datatypes";
import * as Mychart from "./graphMyChart";

let open_short_puts_contracts_table: IContractTableRow[] = [];

function OpenedShortPuts(charId: string) {
  const [openedContracts, setOpenedContracts] = useState([] as IContractRow[]);
  const [ticker, setTicker] = useState("ABBV");
  const [contractsToDisplay, setContractsToDisplay] = useState(
    {} as IContractRow[],
  );
  const [, setContractToDisplay] = useState({} as IContractRow);
  const [isTickerPricesMounted, setIsTickerPricesMounted] = useState(false);
  const [isOpenedContractsMounted, setIsOpenedContractsMounted] =
    useState(false);
  const [tickerPrices, setTickerPrices] = useState([] as ITickerPriceRow[]);
  const [tickerChart] = useState<Mychart.MyChart>(new Mychart.MyChart(charId));

  const handleContractsRowClick = (row: any) => {
    const contract_ref = row.reference;
    const newContractsToDisplay: IContractRow[] = [];
    for (let i = 0; i < open_short_puts_contracts_table.length; i++) {
      if (open_short_puts_contracts_table[i].reference === contract_ref) {
        newContractsToDisplay.push(openedContracts[i]);
      }
    }
    const newContractToDisplay: IContractRow = row as IContractRow;
    setTicker(newContractToDisplay.ticker);
    setContractsToDisplay(newContractsToDisplay);
    setContractToDisplay(newContractToDisplay);
    setIsTickerPricesMounted(false);
  };

  useEffect(() => {
    !isOpenedContractsMounted &&
      api.getOpenedShortPutsContractsList().then((json) => {
        setIsOpenedContractsMounted(true);
        setOpenedContracts(json);
        open_short_puts_contracts_table.length = 0;
        for (let i = 0; i < json.length; i++) {
          open_short_puts_contracts_table = utils.addContractToList(
            open_short_puts_contracts_table,
            i,
            json[i],
          );
        }
      });
  }, [isOpenedContractsMounted]);

  // load ticker prices from database
  useEffect(() => {
    !isTickerPricesMounted &&
      api.getTickerPrices(ticker).then((json) => {
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
    tickerChart,
    contractsToDisplay,
  ]);

  return (
    <div className="App">
      <section>
        <div>
          <div className="row">
            <div className="col-4">
              {OptionsListComponent(
                "Opened short puts",
                columnsOpenedShortPuts,
                openedContracts,
                handleContractsRowClick,
              )}
            </div>
            <div className="col-6">
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

export default OpenedShortPuts;
