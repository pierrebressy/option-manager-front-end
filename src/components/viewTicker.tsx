import { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import * as api from "../services/backendApi";
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
