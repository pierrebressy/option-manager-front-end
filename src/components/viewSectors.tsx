import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";

import { ITickerPriceRow } from "../interfaces/datatypes";
import * as Mychart from "./graphSectorsChart";
import * as api from "../services/backendApi";

function SectorsView(charId: string) {
  const [tickerChart] = useState<Mychart.SectorChart>(
    new Mychart.SectorChart(charId),
  );
  const [isLoaded, setIsLoaded] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [isDisplayed, setIsDisplayed] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [loaded, setLoaded] = useState(false);

  const [ticker, setTicker] = useState("");
  const [isDataFetchedFromDB, setIsDataFetchedFromDB] = useState(false);
  const [tickerPrices, setTickerPrices] = useState([] as ITickerPriceRow[]);
  const [isPriceUpdatedFromDB, setPriceUpdatedFromDB] = useState(false);
  const [isChartCreated, setIsChartCreated] = useState(false);

  const handleClick = (ticker: string, index: number) => {
    let isLoadingtmp = isLoaded;
    let isDisplayedtmp = isDisplayed;
    setTicker(ticker);
    setIsDataFetchedFromDB(false);
    setPriceUpdatedFromDB(false);

    if (!isLoadingtmp[index]) {
      let cmd =
        "http://localhost:8000/api/update_ticker_price_cvsfiles?ticker=" +
        ticker;
      fetch(cmd, { method: "GET" }).then((res) => {
        fetch(
          "http://localhost:8000/api/update_db_ticker_prices?ticker=" + ticker,
          { method: "GET" },
        ).then((res) => {
          setIsDataFetchedFromDB(true);
        });
      });
      isDisplayedtmp[index] = true;
    } else {
      tickerChart.toggleTickerLineVisibility(ticker);
      isDisplayedtmp[index] = !isDisplayedtmp[index];
    }

    isLoadingtmp[index] = true; //!isLoadingtmp[index];
    setIsLoaded(isLoadingtmp);
    setIsDisplayed(isDisplayedtmp);
    setLoaded(!loaded);
  };

  useEffect(() => {
    if (isDataFetchedFromDB && ticker !== "") {
      api.getTickerPrices(ticker).then((json) => {
        setTickerPrices(json);
        setPriceUpdatedFromDB(true);
      });
    }
  }, [isDataFetchedFromDB, ticker]);

  useEffect(() => {
    if (isPriceUpdatedFromDB === true) {
      if (!isChartCreated) {
        tickerChart.createChartnew();
        setIsChartCreated(true);
      } else if (ticker !== "") {
        tickerChart.addTickerLine(ticker, tickerPrices, true, "red");
      }
    }
  }, [isPriceUpdatedFromDB, isChartCreated, ticker, tickerPrices, tickerChart]);

  return (
    <div className="row">
      <div className="col-sm-2">
        <ul className="list-group">
          {[
            ["XLE", "Energie", "0"],
            ["XLU", "Utilitaires", "1"],
            ["XLK", "Technologie", "2"],
            ["XLB", "Matériaux", "3"],
            ["XLP", "Consommateur Staples", "4"],
            ["XLY", "Consommateur Discrétionnaire", "5"],
            ["XLI", "Industriels", "6"],
            ["XLC", "Services de Communication", "7"],
            ["XLV", "Soins de santé", "8"],
            ["XLF", "Finances", "9"],
            ["XLRE", "Immobilier", "10"],
          ].map((variant) => (
            <Button
              variant="outline-primary text-left"
              onClick={() => {
                handleClick(variant[0], +variant[2]);
              }}
              active={isDisplayed[+variant[2]]}
            >
              {variant[0]} - {variant[1]}
            </Button>
          ))}
        </ul>
      </div>
      <div className="col">
        <div id={charId}></div>
      </div>
    </div>
  );
  /*return (
        <div className="App">
            <section>
                <div>
                    <div className="col text-left">
                        <div className="row" >
                            <div className="row-2">
                                <DropdownButton as={ButtonGroup} title="Choose a sector..." id="bg-nested-dropdown">
                                    {['XLE', 'XLU', 'XLK', 'XLB', 'XLP', 'XLY', 'XLI', 'XLC', 'XLV', 'XLF', 'XLRE'].map(
                                        (variant) => (
                                            <Dropdown.Item onClick={() => {
                                                updateTickerData(variant)
                                            }}>{variant}</Dropdown.Item>
                                        ),
                                    )}
                                </DropdownButton>
                            </div>
                        </div>
                        <div className="row text-left" >
                            <div className="col-md-4 text-left">
XXX
YYY
                            </div>
                            <div className="col-6">
                                <div id={charId}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );*/
}
/*
Énergie: XLE
Matériaux: XLB
Industriels: XLI
Consommateur Discrétionnaire: XLY
Consommateur Staples: XLP
Soins de santé: XLV
Finances: XLF
Technologie de l'information: SMH
Services de Communication: XTL
Utilitaires: XLU
Immobilier: IYR

*/
export default SectorsView;
