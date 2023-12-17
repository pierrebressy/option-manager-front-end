import { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import apiTickerPrices from "../services/api_ticker_prices";
import * as Mychart from "./graphSectorsChart";
import { ITickerPriceRow } from "../interfaces/datatypes";

import * as React from "react";

const TickerView = (charId: string) => {
  const [ticker, setTicker] = React.useState("");
  const [isDataFetchedFromDB, setIsDataFetchedFromDB] = useState(false);
  const [isPriceUpdatedFromDB, setPriceUpdatedFromDB] = useState(false);
  const [isChartCreated, setIsChartCreated] = useState(false);
  const [tickerPrices, setTickerPrices] = useState([] as ITickerPriceRow[]);
  const [tickerChart] = useState<Mychart.SectorChart>(
    new Mychart.SectorChart(charId),
  );

  const changeTicker = (event: any) => {
    setTicker(event.target.value);
    setIsDataFetchedFromDB(false);
    setPriceUpdatedFromDB(false);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    //alert(ticker);
    let cmd =
      "http://localhost:8000/api/update_ticker_price_cvsfiles?ticker=" + ticker;
    console.log(cmd);
    fetch(cmd, { method: "GET" }).then((res) => {
      fetch(
        "http://localhost:8000/api/update_db_ticker_prices?ticker=" + ticker,
        { method: "GET" },
      ).then((res) => {
        setIsDataFetchedFromDB(true);
      });
    });
  };
  useEffect(() => {
    console.log(
      "useEffect1 isDataFetchedFromDB: isDataFetchedFromDB=",
      isDataFetchedFromDB,
    );
    if (isDataFetchedFromDB && ticker !== "") {
      apiTickerPrices.getTickerPrices(ticker).then((json) => {
        console.log("TickerView: api_ticker_prices.getTickerPrices", ticker);
        setTickerPrices(json);
        setPriceUpdatedFromDB(true);
      });
    }
  }, [isDataFetchedFromDB, ticker]);

  useEffect(() => {
    console.log(
      "useEffect2 isPriceUpdatedFromDB: isPriceUpdatedFromDB=",
      isPriceUpdatedFromDB,
    );
    if (isPriceUpdatedFromDB === true) {
      if (!isChartCreated) {
        console.log("useEffect2 createChartNew");
        tickerChart.createChartnew();
        setIsChartCreated(true);
      } else if (ticker !== "") {
        console.log("useEffect2 addCurve", ticker, tickerPrices.length);
        tickerChart.addTickerLine(ticker, tickerPrices, true, "red");
      }
    }
  }, [isPriceUpdatedFromDB, isChartCreated, ticker, tickerPrices, tickerChart]);

  return (
    <div>
      <div className="row">
        <div className="col-4">
          <Form id="tickerFormId" onSubmit={handleSubmit}>
            <Row>
              <Col>
                <Form.Label id="form-ticker-view-ticker-name">
                  Enter the Ticker
                </Form.Label>
              </Col>
              <Col className="mb-2">
                <Form.Control
                  id="ticker"
                  type="text"
                  value={ticker}
                  placeholder="ex: ABBV"
                  onChange={changeTicker}
                />
              </Col>
              <Col>
                <Button variant="primary" type="submit">
                  OK
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
        <div className="col-6"></div>
      </div>
      <div className="row">
        <div className="col-1"></div>
        <div className="col-6">
          <div id={charId}></div>
        </div>
      </div>
    </div>
  );
};

export default TickerView;
