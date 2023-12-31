// TODO: short and long: don't display the right axis

import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { useState, useEffect } from "react";
import { IContractRow } from "../interfaces/datatypes";
import * as Contract from "./classContracts";
import * as consts from "../services/constants";
import { StrategyChart } from "./classStrategyChart";
import { OptionValueChart } from "./classOptionValueChart";
import { CoveredCall } from "./classContractsCoveredCall";
import { CreditCallSpread } from "./classContractsCCS";
import { DebitCallSpread } from "./classContractsDCS";
import { CreditPutSpread } from "./classContractsCPS";
import { DebitPutSpread } from "./classContractsDPS";
import { Long } from "./classContractsLong";
import { Short } from "./classContractsShort";
import { Call } from "./classContractsCall";
import { Put } from "./classContractsPut";


const Strategy = (plChartId: string, optionValueChartId: string) => {
  const [optionValueChart] = useState(new OptionValueChart(optionValueChartId));
  const [plChart] = useState(new StrategyChart(plChartId));
  const [loadDefault, setLoadDefault] = useState(true);
  const [drawSigmaLines, setDrawSigmaLines] = useState(false);
  const [numContractsValue, setNumContracts] = useState(
    consts.DEFAULT_STRATEGY_NUM_CONTRACTS,
  );
  const [interestRateValue, setInterestRateValue] = useState(
    consts.DEFAULT_INTEREST_RATE,
  );
  const [dividendYieldValue, setDividendYieldValue] = useState<number>(
    consts.DEFAULT_DIVIDEND_YIELD,
  );
  const [strikeValue, setStrikeValue] = useState(
    consts.DEFAULT_STRATEGY_STRIKE,
  );
  const [strike1Value, setStrike1Value] = useState(
    consts.DEFAULT_STRATEGY_STRIKE_1,
  );
  const [strike2Value, setStrike2Value] = useState(
    consts.DEFAULT_STRATEGY_STRIKE_2,
  );
  const [premiumValue, setPremiumValue] = useState(
    consts.DEFAULT_STRATEGY_PREMIUM,
  );
  const [premium1Value, setPremium1Value] = useState(
    consts.DEFAULT_STRATEGY_PREMIUM_1,
  );
  const [premium2Value, setPremium2Value] = useState(
    consts.DEFAULT_STRATEGY_PREMIUM_2,
  );
  const [viATMValue, setViatmValue] = useState(
    consts.DEFAULT_STRATEGY_IMPLICIT_VOLATILITY,
  );
  const [numDaysValue, setNumDaysValue] = useState(
    consts.DEFAULT_STRATEGY_NUM_DAYS,
  );

  const [currentPriceValue, setCurrentPriceValue] = useState(
    consts.DEFAULT_STRATEGY_CURRENT_PRICE,
  );
  const [pruValue, setPruValue] = useState(consts.DEFAULT_STRATEGY_PRU);

  const [sigma, setSigmaValue] = useState(
    strikeValue * viATMValue * Math.sqrt(numDaysValue / 365),
  );
  const [cost, setCost] = useState(0.0);
  const [breakEven, setBreakEven] = useState(0.0);
  const [maxLost, setMaxLost] = useState(0.0);
  const [maxProfit, setMaxProfit] = useState(0.0);

  //const [clibBoardData, setClipboardData] = useState("");

  const dummyContract = {
    id: 0,
    ticker: "None",
    type: "Put",
    strike: strikeValue,
    expiration: "",
    openedBy: "",
    closedBy: "",
    openPremium: premiumValue,
    closePremium: premiumValue,
    qty: numContractsValue,
  } as IContractRow;

  const [theContract, setTheContract] = useState<Contract.OptionContract>(
    new Contract.OptionContract([dummyContract] as IContractRow[]),
  );
  const [selectedContractType, setSelectedContractType] = useState(
    consts.DEFAULT_STRATEGY,
  );

  /*async function pasteFromClipboard() {
        try {
            if (!navigator.clipboard) {
                throw new Error("Browser don't have support for native clipboard.");
            }

            const text = await navigator.clipboard.readText();
            //setClipboardData(JSON.parse(text));
            return text;
        } catch (error) {
            console.log(error);
        }
    }*/

  //useEffect(() => {
  //    console.log('useEffect::clibBoardData=', clibBoardData);
  //}, [clibBoardData]);

  useEffect(() => {
    setSigmaValue(strikeValue * viATMValue * Math.sqrt(numDaysValue / 365));
  }, [strikeValue, viATMValue, numDaysValue]);

  function onDrawSigmaLinesChange(event: any) {
    setDrawSigmaLines(event.target.checked);
    //let dataFromClipboard = await pasteFromClipboard();
    //console.log('XXX dataFromClipboard=', dataFromClipboard);
  }

  const onDividendYieldChange = (event: any) => {
    setDividendYieldValue(+event.target.value);
  };
  const onInterestRateChange = (event: any) => {
    setInterestRateValue(+event.target.value);
  };

  const onCurrentPriceValueChange = (event: any) => {
    setCurrentPriceValue(+event.target.value);
  };
  const onPruChange = (event: any) => {
    setPruValue(+event.target.value);
  };
  const onStrikeChange = (event: any) => {
    setStrikeValue(+event.target.value);
  };
  const onStrike1Change = (event: any) => {
    setStrike1Value(+event.target.value);
  };
  const onStrike2Change = (event: any) => {
    setStrike2Value(+event.target.value);
  };
  const onViATMChange = (event: any) => {
    setViatmValue(+event.target.value);
  };
  const onNumDaysChange = (event: any) => {
    setNumDaysValue(+event.target.value);
  };
  const onPremiumChange = (event: any) => {
    setPremiumValue(+event.target.value);
  };
  const onPremium1Change = (event: any) => {
    setPremium1Value(+event.target.value);
  };
  const onPremium2Change = (event: any) => {
    setPremium2Value(+event.target.value);
  };
  const onNumContractsChange = (event: any) => {
    setNumContracts(+event.target.value);
  };
  const onContractTypeChange = (event: any) => {
    setSelectedContractType(event.target.id);
    setDrawSigmaLines(false);
    if (consts.AUTOLOAD_DEFAULT) setLoadDefault(true);
  };

  useEffect(() => {
    let contract: any;

    let contractData = {
      id: 0,
      ticker: "None",
      type: "Unknown",
      strike: strikeValue, //.toString(),
      expiration: "",
      openedBy: "",
      closedBy: "",
      openPremium: premiumValue,
      closePremium: premiumValue,
      qty: numContractsValue,
      pru: +pruValue,
    } as IContractRow;

    if (selectedContractType === "Short") {
      contractData.type = "Short";
      contractData.qty = -numContractsValue;
      contract = new Short([contractData] as IContractRow[]);
    } else if (selectedContractType === "Long") {
      contractData.type = "Long";
      contractData.qty = -numContractsValue;
      contract = new Long([contractData] as IContractRow[]);
    } else if (selectedContractType === "Covered Call") {
      contractData.type = "Covered Call";
      contractData.qty = -numContractsValue;
      contract = new CoveredCall([contractData] as IContractRow[]);
      contract.setPru(pruValue);
      setPruValue(contract.getPru());
      if (loadDefault) {
        contract.loadDefaultValues();
        setLoadDefault(false);
        setPremiumValue(contract.getOpenPremium());
        setStrikeValue(contract.getStrike());
        setPruValue(contract.getPru());
      }
    } else if (selectedContractType === "Short Put") {
      contractData.type = "Put";
      contractData.qty = -numContractsValue;
      contract = new Put([contractData] as IContractRow[]);
      if (loadDefault) {
        contract.loadDefaultValues();
        setLoadDefault(false);
        setPremiumValue(contract.getOpenPremium());
        setStrikeValue(contract.getStrike());
      }
    } else if (selectedContractType === "Long Put") {
      contractData.type = "Put";
      contractData.qty = numContractsValue;
      contract = new Put([contractData] as IContractRow[]);
      if (loadDefault) {
        contract.loadDefaultValues();
        setLoadDefault(false);
        setPremiumValue(contract.getOpenPremium());
        setStrikeValue(contract.getStrike());
      }
    } else if (selectedContractType === "Long Call") {
      contractData.type = "Call";
      contractData.qty = numContractsValue;
      contract = new Call([contractData] as IContractRow[]);
      if (loadDefault) {
        contract.loadDefaultValues();
        setLoadDefault(false);
        setPremiumValue(contract.getOpenPremium());
        setStrikeValue(contract.getStrike());
      }
    } else if (selectedContractType === "Short Call") {
      contractData.type = "Call";
      contractData.qty = -numContractsValue;
      contract = new Call([contractData] as IContractRow[]);
      if (loadDefault) {
        contract.loadDefaultValues();
        setLoadDefault(false);
        setPremiumValue(contract.getOpenPremium());
        setStrikeValue(contract.getStrike());
      }
    } else if (selectedContractType === "CCS") {
      const contractsData: IContractRow[] = [
        {
          id: 0,
          ticker: "None",
          type: "Call",
          strike: strike1Value,
          expiration: "",
          openedBy: "",
          closedBy: "",
          openPremium: premium1Value,
          closePremium: premium1Value,
          qty: numContractsValue,
        } as IContractRow,
        {
          id: 0,
          ticker: "None",
          type: "Call",
          strike: strike2Value,
          expiration: "",
          openedBy: "",
          closedBy: "",
          openPremium: premium2Value,
          closePremium: premium2Value,
          qty: numContractsValue,
        } as IContractRow,
      ];
      contractData.type = "CCS";
      contractData.qty = -numContractsValue;
      contract = new CreditCallSpread(contractsData);
      if (loadDefault) {
        contract.loadDefaultValues();
        setLoadDefault(false);
        setStrike1Value(contract.soldCall.getStrike());
        setStrike2Value(contract.boughtCall.getStrike());
        setPremium1Value(contract.soldCall.getOpenPremium());
        setPremium2Value(contract.boughtCall.getOpenPremium());
      }
    } else if (selectedContractType === "DCS") {
      const contractsData: IContractRow[] = [
        {
          id: 0,
          ticker: "None",
          type: "Call",
          strike: strike1Value,
          expiration: "",
          openedBy: "",
          closedBy: "",
          openPremium: premium1Value,
          closePremium: premium1Value,
          qty: numContractsValue,
        } as IContractRow,
        {
          id: 0,
          ticker: "None",
          type: "Call",
          strike: strike2Value,
          expiration: "",
          openedBy: "",
          closedBy: "",
          openPremium: premium2Value,
          closePremium: premium2Value,
          qty: numContractsValue,
        } as IContractRow,
      ];
      contractData.type = "DCS";
      contractData.qty = -numContractsValue;
      contract = new DebitCallSpread(contractsData);
      if (loadDefault) {
        contract.loadDefaultValues();
        setLoadDefault(false);
        setStrike1Value(contract.boughtCall.getStrike());
        setStrike2Value(contract.soldCall.getStrike());
        setPremium1Value(contract.boughtCall.getOpenPremium());
        setPremium2Value(contract.soldCall.getOpenPremium());
      }
    } else if (selectedContractType === "CPS") {
      const contractsData: IContractRow[] = [
        {
          id: 0,
          ticker: "None",
          type: "Put",
          strike: strike1Value,
          expiration: "",
          openedBy: "",
          closedBy: "",
          openPremium: premium1Value,
          closePremium: premium1Value,
          qty: numContractsValue,
        } as IContractRow,
        {
          id: 0,
          ticker: "None",
          type: "Put",
          strike: strike2Value,
          expiration: "",
          openedBy: "",
          closedBy: "",
          openPremium: premium2Value,
          closePremium: premium2Value,
          qty: numContractsValue,
        } as IContractRow,
      ];
      contractData.type = "CPS";
      contractData.qty = -numContractsValue;
      contract = new CreditPutSpread(contractsData);
      if (loadDefault) {
        contract.loadDefaultValues();
        setLoadDefault(false);
        setStrike1Value(contract.boughtPut.getStrike());
        setStrike2Value(contract.soldPut.getStrike());
        setPremium1Value(contract.boughtPut.getOpenPremium());
        setPremium2Value(contract.soldPut.getOpenPremium());
      }
    } else if (selectedContractType === "DPS") {
      const contractsData: IContractRow[] = [
        {
          id: 0,
          ticker: "None",
          type: "Put",
          strike: strike1Value,
          expiration: "",
          openedBy: "",
          closedBy: "",
          openPremium: premium1Value,
          closePremium: premium1Value,
          qty: numContractsValue,
        } as IContractRow,
        {
          id: 0,
          ticker: "None",
          type: "Put",
          strike: strike2Value,
          expiration: "",
          openedBy: "",
          closedBy: "",
          openPremium: premium2Value,
          closePremium: premium2Value,
          qty: numContractsValue,
        } as IContractRow,
      ];
      contractData.type = "DPS";
      contractData.qty = -numContractsValue;
      contract = new DebitPutSpread(contractsData);
      if (loadDefault) {
        contract.loadDefaultValues();
        setLoadDefault(false);
        setStrike1Value(contract.soldPut.getStrike());
        setStrike2Value(contract.boughtPut.getStrike());
        setPremium1Value(contract.soldPut.getOpenPremium());
        setPremium2Value(contract.boughtPut.getOpenPremium());
      }
    } else {
      contractData.type = "";
    }

    if (theContract.type !== "") {
      let cost = contract.getInitialCost();
      setCost(cost);
      let breakEven = contract.getBreakEvenValue();
      setBreakEven(breakEven);
      setMaxProfit(contract.getMaxProfit());
      setMaxLost(contract.getMaxLost());
      setTheContract(contract);
    }
  }, [
    loadDefault,
    viATMValue,
    strikeValue,
    strike1Value,
    strike2Value,
    premiumValue,
    premium1Value,
    premium2Value,
    numContractsValue,
    selectedContractType,
    sigma,
    currentPriceValue,
    pruValue,
    drawSigmaLines,
    interestRateValue,
    dividendYieldValue,
    theContract.type,
  ]);

  useEffect(() => {
    optionValueChart.createChart(theContract, sigma, currentPriceValue, numDaysValue);
    optionValueChart.drawTheta(currentPriceValue, interestRateValue, viATMValue, numDaysValue, dividendYieldValue);
    plChart.createChart(theContract, sigma, currentPriceValue);
    plChart.drawProfileForDaysLeft(theContract, viATMValue, numDaysValue);
    plChart.drawPLForDaysLeft(
      theContract,
      currentPriceValue,
      viATMValue,
      numDaysValue,
    );

    if (drawSigmaLines) {
      plChart.drawAllSigmaLines(theContract, sigma, currentPriceValue);
    }
  }, [
    theContract,
    plChart,
    sigma,
    currentPriceValue,
    drawSigmaLines,
    viATMValue,
    numDaysValue,
    dividendYieldValue,
    interestRateValue,
    optionValueChart
  ]);

  const displayShareContractTypes = () => {
    return (
      <Row>
        <Col xl={3} className="justify-content-md-left">
          Share
        </Col>
        <Col xl={7} className="justify-content-md-left">
          <Form>
            {["Short", "Long"].map((type) => (
              <Form.Check
                inline
                label={type}
                name="group1"
                type="radio"
                id={type}
                checked={type === selectedContractType}
                onChange={onContractTypeChange}
              />
            ))}
          </Form>
        </Col>
      </Row>
    );
  };
  const displayOneLegOptionContractTypes = (theContract:any) => {
    let monneyIndicator = "";
    if (
      selectedContractType === "Short Put" ||
      selectedContractType === "Long Put"
    ) {
      if (theContract.isATM(currentPriceValue)) {
        monneyIndicator = "ATM";
      } else if (theContract.isITM(currentPriceValue)) {
        monneyIndicator = "ITM";
      } else if (theContract.isOTM(currentPriceValue)) {
        monneyIndicator = "OTM";
      }
    }
    if (
      selectedContractType === "Short Call" ||
      selectedContractType === "Long Call" ||
      selectedContractType === "Covered Call"
    ) {
      if (theContract.isATM(currentPriceValue)) {
        monneyIndicator = "ATM";
      } else if (theContract.isITM(currentPriceValue)) {
        monneyIndicator = "ITM";
      } else if (theContract.isOTM(currentPriceValue)) {
        monneyIndicator = "OTM";
      }
    }
    return (
      <Row>
        <Col xl={3} className="justify-content-md-left">
          Option contracts with 1 leg
        </Col>
        <Col xl={8} className="justify-content-md-left">
          <Form>
            {[
              "Short Put",
              "Long Put",
              "Long Call",
              "Short Call",
              "Covered Call",
            ].map((type) => (
              <Form.Check
                inline
                label={type}
                name="group1"
                type="radio"
                id={type}
                checked={type === selectedContractType}
                onChange={onContractTypeChange}
              />
            ))}
          </Form>
        </Col>
        <Col xl={1} className="justify-content-md-left">
          <p className={monneyIndicator}>{monneyIndicator}</p>
        </Col>
      </Row>
    );
  };
  const setDefaultValue = () => {
    setLoadDefault(true);
  };

  const displayTwoLegsOptionContractTypes = () => {
    return (
      <Row>
        <Col xl={3} className="justify-content-md-left">
          Option contracts with 2 legs
        </Col>
        <Col xl={8} className="justify-content-md-left">
          <Form>
            {["CCS", "CPS", "DCS", "DPS"].map((type) => (
              <Form.Check
                inline
                label={type}
                name="group1"
                type="radio"
                id={type}
                checked={type === selectedContractType}
                onChange={onContractTypeChange}
              />
            ))}
          </Form>
        </Col>
        <Col xl={1} className="justify-content-md-left">
          <Button variant="outline-secondary" onClick={setDefaultValue}>
            Default
          </Button>
        </Col>
      </Row>
    );
  };
  const displayContractNumbers = () => {
    return (
      <Row className="bg-secondary">
        <Col xl={3} className="justify-content-md-left">
          Quantity
        </Col>
        <Col xl={2} className="text-sm-end param_text">
          #{numContractsValue}
        </Col>
        <Col xl={2} className="justify-content-md-left">
          <Form.Range
            min={1}
            max={10}
            step={1}
            value={numContractsValue}
            onChange={onNumContractsChange}
          ></Form.Range>
        </Col>
      </Row>
    );
  };
  const displayNoLegContractParameters = () => {
    return <div></div>;
  };
  const displayOneLegContractParameters = () => {
    return (
      <Row className="bg-secondary">
        <Col xl={3} className="text-sm-end param_text">
          {selectedContractType}
        </Col>
        <Col xl={1} className="text-sm-end param_text">
          Strike
        </Col>
        <Col xl={1} className="text-sm-left param_text">
          {strikeValue} USD
        </Col>
        <Col xl={2} className="justify-content-md-left">
          <Form.Range
            min={2}
            max={200}
            step={0.1}
            value={strikeValue}
            onChange={onStrikeChange}
          ></Form.Range>
        </Col>
        <Col xl={1} className="text-sm-end param_text">
          Premium
        </Col>
        <Col xl={1} className="text-sm-left param_text">
          {premiumValue} USD
        </Col>
        <Col xl={2} className="justify-content-md-left">
          <Form.Range
            min={0}
            max={10}
            step={0.01}
            value={premiumValue}
            onChange={onPremiumChange}
          ></Form.Range>
        </Col>
      </Row>
    );
  };
  const displayTwoLegsContractParameters = () => {
    return (
      <div>
        <Row className="bg-secondary">
          <Col xl={1} className="text-sm-end param_text">
            Leg1
          </Col>
          <Col xl={2} className="text-sm-end param_text">
            {selectedContractType === "CCS" || selectedContractType === "DPS"
              ? "Short "
              : "Long "}
            {selectedContractType === "CCS" || selectedContractType === "DCS"
              ? "Call"
              : "Put"}
          </Col>
          <Col xl={1} className="text-sm-end param_text">
            Strike1
          </Col>
          <Col xl={1} className="text-sm-left param_text">
            {strike1Value}
          </Col>
          <Col xl={2} className="justify-content-md-left">
            <Form.Range
              min={2}
              max={200}
              step={0.1}
              value={strike1Value}
              onChange={onStrike1Change}
            ></Form.Range>
          </Col>
          <Col xl={1} className="text-sm-end param_text">
            Premium1
          </Col>
          <Col xl={1} className="text-sm-left param_text">
            {premium1Value}
          </Col>
          <Col xl={2} className="justify-content-md-left">
            <Form.Range
              min={0}
              max={10}
              step={0.01}
              value={premium1Value}
              onChange={onPremium1Change}
            ></Form.Range>
          </Col>
        </Row>
        <Row className="bg-secondary">
          <Col xl={1} className="text-sm-end param_text">
            Leg2
          </Col>
          <Col xl={2} className="text-sm-end param_text">
            {selectedContractType === "CCS" || selectedContractType === "DPS"
              ? "Long "
              : "Short "}
            {selectedContractType === "CCS" || selectedContractType === "DCS"
              ? "Call"
              : "Put"}
          </Col>
          <Col xl={1} className="text-sm-end param_text">
            Strike2
          </Col>
          <Col xl={1} className="text-sm-left param_text">
            {strike2Value}
          </Col>
          <Col xl={2} className="justify-content-md-left">
            <Form.Range
              min={2}
              max={200}
              step={0.1}
              value={strike2Value}
              onChange={onStrike2Change}
            ></Form.Range>
          </Col>
          <Col xl={1} className="text-sm-end param_text">
            Premium2
          </Col>
          <Col xl={1} className="text-sm-left param_text">
            {premium2Value}
          </Col>
          <Col xl={2} className="justify-content-md-left">
            <Form.Range
              min={0}
              max={10}
              step={0.01}
              value={premium2Value}
              onChange={onPremium2Change}
            ></Form.Range>
          </Col>
        </Row>
      </div>
    );
  };
  const displayContractParameters = (contract: any) => {
    if (typeof contract === "boolean") {
      return <div></div>;
    }
    if (contract.getLegs() === 0) {
      return displayNoLegContractParameters();
    } else if (contract.getLegs() === 1) {
      return displayOneLegContractParameters();
    } else {
      return displayTwoLegsContractParameters();
    }
  };
  const displaySigmaLinesSelector = (contract: any) => {
    if (typeof contract === "boolean") {
      return <div></div>;
    }
    if (contract.getLegs() === 0) {
      return <div></div>;
    }

    return (
      <div>
        <Row>
          <Col xl={3} className="justify-content-md-left">
            VI ATM
          </Col>
          <Col xl={2} className="text-sm-end param_text">
            {(viATMValue * 100).toFixed(1)} %
          </Col>
          <Col xl={2} className="justify-content-md-left">
            <Form.Range
              min={0.01}
              max={1}
              step={0.001}
              value={viATMValue}
              onChange={onViATMChange}
            ></Form.Range>
          </Col>
        </Row>

        <Row>
          <Col xl={3} className="justify-content-md-left test">
            Number of days
          </Col>
          <Col xl={2} className="text-sm-end param_text ">
            {numDaysValue} day{numDaysValue > 1 ? "s" : ""} left
          </Col>
          <Col xl={2} className="justify-content-md-left">
            <Form.Range
              min={1}
              max={700}
              step={1}
              value={numDaysValue}
              onChange={onNumDaysChange}
            ></Form.Range>
          </Col>
        </Row>

        <Row>
          <Col xl={3} className="justify-content-md-left test">
            Interest Rate
          </Col>
          <Col xl={2} className="text-sm-end param_text ">
            {(interestRateValue * 100).toFixed(1)} %
          </Col>
          <Col xl={2} className="justify-content-md-left">
            <Form.Range
              min={0}
              max={1}
              step={0.001}
              value={interestRateValue}
              onChange={onInterestRateChange}
            ></Form.Range>
          </Col>
        </Row>

        <Row>
          <Col xl={3} className="justify-content-md-left test">
            Dividend Yield
          </Col>
          <Col xl={2} className="text-sm-end param_text ">
            {(dividendYieldValue * 100).toFixed(1)} %
          </Col>
          <Col xl={2} className="justify-content-md-left">
            <Form.Range
              min={0}
              max={1}
              step={0.001}
              value={dividendYieldValue}
              onChange={onDividendYieldChange}
            ></Form.Range>
          </Col>
        </Row>

        <Row>
          <Col xl={3} className="justify-content-md-left">
            <Form>
              <div key={`default-checkbox`} className="mb-3">
                <Form.Check // prettier-ignore
                  type="checkbox"
                  id={`default-checkbox`}
                  label="Draw sigma lines"
                  checked={drawSigmaLines}
                  onChange={onDrawSigmaLinesChange}
                />
              </div>
            </Form>
          </Col>
        </Row>
      </div>
    );
  };
  const displayPriceInfo = (contract: any) => {
    return (
      <div>
        <Row>
          <Col xl={3} className="justify-content-md-left">
            Underlying current price
          </Col>
          <Col xl={2} className="text-sm-end param_text">
            {currentPriceValue} USD
          </Col>
          <Col xl={2} className="justify-content-md-left">
            <Form.Range
              min={2}
              max={200}
              step={0.1}
              value={currentPriceValue}
              onChange={onCurrentPriceValueChange}
            ></Form.Range>
          </Col>
        </Row>
        {selectedContractType === "Short Put" ||
        selectedContractType === "Long Put" ||
        selectedContractType === "Short Call" ||
        selectedContractType === "Long Call" ? (
          <div>
            <Row>
              <Col xl={3} className="justify-content-md-left">
                GREEKS
              </Col>
            </Row>

            <Row>
              <Col xl={1} className="justify-content-md-left">
                &nbsp;
              </Col>
              <Col xl={2} className="justify-content-md-left">
                <a href="javascript:alert('price of the option.');">Options</a>
              </Col>
              <Col xl={3} className="justify-content-md-right">
                Price ={" "}
                {theContract
                  .getPrice(
                    currentPriceValue,
                    interestRateValue,
                    viATMValue,
                    numDaysValue,
                    dividendYieldValue,
                  )
                  .toFixed(3)}{" "}
                $
              </Col>
              <Col xl={3} className="justify-content-md-right">
                Price ={" "}
                {(
                  consts.NUM_SHARES_PER_CONTRACT *
                  theContract.getQty() *
                  theContract.getPrice(
                    currentPriceValue,
                    interestRateValue,
                    viATMValue,
                    numDaysValue,
                    dividendYieldValue,
                  )
                ).toFixed(0)}{" "}
                $
              </Col>
            </Row>

            <Row>
              <Col xl={1} className="justify-content-md-left">
                &nbsp;
              </Col>
              <Col xl={2} className="text-end">
                <a href="javascript:alert('(underlying price - strike) for ITM option.');">
                  Intrinsic value
                </a>
              </Col>
              <Col xl={3} className="align-items-end">
                Price ={" "}
                {theContract.isITM(currentPriceValue)
                  ? Math.abs(currentPriceValue - strikeValue).toFixed(3)
                  : 0}
                $
              </Col>
              <Col xl={3} className="justify-content-md-right">
                {" "}
              </Col>
            </Row>

            <Row>
              <Col xl={1} className="justify-content-md-left">
                &nbsp;
              </Col>
              <Col xl={2} className="text-end">
                <a href="javascript:alert('(option price - intrinsic value) for ITM option.');">
                  Time value
                </a>
              </Col>
              <Col xl={3} className="justify-content-md-right">
                Price ={" "}
                {Math.abs(
                  theContract.getPrice(
                    currentPriceValue,
                    interestRateValue,
                    viATMValue,
                    numDaysValue,
                    dividendYieldValue,
                  ) - Math.abs(currentPriceValue - strikeValue),
                ).toFixed(3)}{" "}
                $
              </Col>
              <Col xl={3} className="justify-content-md-right">
                {" "}
              </Col>
            </Row>

            <Row>
              <Col xl={1} className="justify-content-md-left">
                &nbsp;
              </Col>
              <Col xl={2} className="justify-content-md-left">
                <a href="javascript:alert('Delta is the rate of change on the option’s price with respect to changes in the price of the underlying asset.');">
                  DELTA
                </a>
              </Col>
              <Col xl={3} className="justify-content-md-right">
                Δ ={" "}
                {theContract
                  .getDelta(
                    currentPriceValue,
                    interestRateValue,
                    viATMValue,
                    numDaysValue,
                    dividendYieldValue,
                  )
                  .toFixed(3)}{" "}
                $ / $
              </Col>
              <Col xl={3} className="justify-content-md-right">
                Δ ={" "}
                {(
                  consts.NUM_SHARES_PER_CONTRACT *
                  theContract.getQty() *
                  theContract.getDelta(
                    currentPriceValue,
                    interestRateValue,
                    viATMValue,
                    numDaysValue,
                    dividendYieldValue,
                  )
                ).toFixed(0)}{" "}
                $ / $
              </Col>
            </Row>
            <Row>
              <Col xl={1} className="justify-content-md-left">
                &nbsp;
              </Col>
              <Col xl={2} className="justify-content-md-left">
                <a href="javascript:alert('Gamma is the rate of change of the option’s Delta with respect to changes in the underlying stock.');">
                  GAMMA
                </a>
              </Col>
              <Col xl={3} className="justify-content-md-right">
                Γ ={" "}
                {theContract
                  .getGamma(
                    currentPriceValue,
                    interestRateValue,
                    viATMValue,
                    numDaysValue,
                    dividendYieldValue,
                  )
                  .toFixed(3)}
              </Col>
            </Row>
            <Row>
              <Col xl={1} className="justify-content-md-left">
                &nbsp;
              </Col>
              <Col xl={2} className="justify-content-md-left">
                <a href="javascript:alert('Theta is the rate of change of the option premium with respect to time.');">
                  THETA
                </a>
              </Col>
              <Col xl={3} className="justify-content-md-right">
                Θ ={" "}
                {theContract
                  .getTheta(
                    currentPriceValue,
                    interestRateValue,
                    viATMValue,
                    numDaysValue,
                    dividendYieldValue,
                  )
                  .toFixed(3)}{" "}
                $ / day
              </Col>
              <Col xl={3} className="justify-content-md-right">
                Θ ={" "}
                {(
                  consts.NUM_SHARES_PER_CONTRACT *
                  theContract.getQty() *
                  theContract.getTheta(
                    currentPriceValue,
                    interestRateValue,
                    viATMValue,
                    numDaysValue,
                    dividendYieldValue,
                  )
                ).toFixed(0)}{" "}
                $ / day
              </Col>
            </Row>
            <Row>
              <Col xl={1} className="justify-content-md-left">
                &nbsp;
              </Col>
              <Col xl={2} className="justify-content-md-left">
                <a href="javascript:alert('Rho is the rate of change of the option premium with respect to the risk-free rate.');">
                  RHO
                </a>
              </Col>
              <Col xl={3} className="justify-content-md-right">
                ρ ={" "}
                {theContract
                  .getRho(
                    currentPriceValue,
                    interestRateValue,
                    viATMValue,
                    numDaysValue,
                    dividendYieldValue,
                  )
                  .toFixed(3)}
              </Col>
            </Row>
            <Row>
              <Col xl={1} className="justify-content-md-left">
                &nbsp;
              </Col>
              <Col xl={2} className="justify-content-md-left">
                <a href="javascript:alert('Vega is the rate of change of the option premium with respect to the volatility of the underlying asset.');">
                  VEGA
                </a>
              </Col>
              <Col xl={3} className="justify-content-md-right">
                V ={" "}
                {theContract
                  .getVega(
                    currentPriceValue,
                    interestRateValue,
                    viATMValue,
                    numDaysValue,
                    dividendYieldValue,
                  )
                  .toFixed(3)}
              </Col>
            </Row>
          </div>
        ) : (
          <div></div>
        )}
        {selectedContractType !== "Covered Call" &&
        selectedContractType !== "Short" &&
        selectedContractType !== "Long" ? (
          <div></div>
        ) : (
          <div>
            <Row>
              <Col xl={3} className="justify-content-md-left">
                Average buying price
              </Col>
              <Col xl={2} className="text-sm-end param_text">
                {pruValue} USD
              </Col>
              <Col xl={2} className="justify-content-md-left">
                <Form.Range
                  min={2}
                  max={200}
                  step={0.1}
                  value={pruValue}
                  onChange={onPruChange}
                ></Form.Range>
              </Col>
            </Row>
          </div>
        )}

        {contract.getLegs() === 0 ? (
          <></>
        ) : (
          <Row>
            <Col xl={3} className="justify-content-md-left">
              Sigma
            </Col>
            <Col xl={2} className="text-sm-end param_text">
              {sigma.toFixed(2)}
            </Col>
          </Row>
        )}
        {contract.getLegs() === 0 ? (
          <></>
        ) : (
          <Row>
            <Col xl={3} className="justify-content-md-left">
              Initial P&L
            </Col>
            <Col xl={2} className="text-sm-end param_text">
              {cost.toFixed(0)} USD
            </Col>
          </Row>
        )}
        <Row>
          <Col xl={2} className="justify-content-md-left">
            Break-even
          </Col>
          <Col xl={3} className="text-sm-end param_text">
            {breakEven.toFixed(2)} USD
          </Col>
        </Row>
        <Row>
          <Col xl={2} className="justify-content-md-left">
            P&L limits
          </Col>
          <Col xl={3} className="text-sm-end param_text">
            from {maxLost.toFixed(0)} USD to {maxProfit.toFixed(0)} USD
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          {displayShareContractTypes()}
          {displayOneLegOptionContractTypes(theContract)}
          {displayTwoLegsOptionContractTypes()}
          {displayContractNumbers()}
          {displayContractParameters(theContract)}
          {displaySigmaLinesSelector(theContract)}
        </Col>
        <Col>{displayPriceInfo(theContract)}</Col>
      </Row>
      <Row>
        <Col>
          <div id={plChartId}></div>
        </Col>
        <Col>{theContract.displayInfo()}</Col>
      </Row>
      <Row>
        <Col>
          <div id={optionValueChartId}></div>
        </Col>
      </Row>
    </Container>
  );
};
//                     {theContract.getLegs() > 0 ? displaySigmaLinesSelector() : <div></div>}
/*
      <Row>
        <Col>
          <div id={plChartId}></div>
        </Col>
        <Col>{theContract.displayInfo()}</Col>
      </Row>
      <Row>
        <Col>
          <div id={optionValueChartId}></div>
        </Col>
      </Row>

*/
export default Strategy;

