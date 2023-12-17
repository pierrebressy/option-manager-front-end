import { useState, useEffect } from "react";
import OptionsListComponent from "./classOptionsListComponent";
import apiOpenedContracts, {
  columnsOpenedContracts,
} from "../services/api_opened_contracts";
import apiTickerPrices from "../services/api_ticker_prices";
import * as Mychart from "./graphMyChart";
import * as utils from "../services/utils";
import {
  IContractRow,
  IContractTableRow,
  ITickerPriceRow,
} from "../interfaces/datatypes";
import * as cp from "./classClipboard";

let opened_contracts_table: IContractTableRow[] = [];

function OpenedContracts(charId: string) {
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
    for (let i = 0; i < opened_contracts_table.length; i++) {
      if (opened_contracts_table[i].reference === contract_ref) {
        newContractsToDisplay.push(openedContracts[i]);
      }
    }

    cp.copyToClipboard({ value: JSON.stringify(newContractsToDisplay) });
    //const dataToClipboard =JSON.stringify(newContractsToDisplay);
    //navigator.clipboard.writeText(dataToClipboard);
    //console.log('dataToClipboard=', dataToClipboard);

    //let dataFromClipboard = pasteFromClipboard();
    //console.log('XXX dataFromClipboard=', dataFromClipboard);

    const newContractToDisplay: IContractRow = row as IContractRow;
    setTicker(newContractToDisplay.ticker);
    setContractsToDisplay(newContractsToDisplay);
    setContractToDisplay(newContractToDisplay);
    setIsTickerPricesMounted(false);
  };

  useEffect(() => {
    !isOpenedContractsMounted &&
      apiOpenedContracts.getContractsList().then((json) => {
        setIsOpenedContractsMounted(true);
        setOpenedContracts(json);
        opened_contracts_table.length = 0;
        for (let i = 0; i < json.length; i++) {
          opened_contracts_table = utils.addContractToList(
            opened_contracts_table,
            i,
            json[i],
          );
        }
      });
  }, [isOpenedContractsMounted]);

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
            <div className="col-4">
              {OptionsListComponent(
                "Opened contrats",
                columnsOpenedContracts,
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

export default OpenedContracts;
