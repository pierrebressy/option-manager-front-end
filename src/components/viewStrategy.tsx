// TODO: all contracts: add the value in the left axis of the current contract PL in orange at current price
// TODO: short and long: remove the VI and days left info
// TODO: short and long: don't display the right axis
// TODO: short: set current price @ 45$
// TODO: long: set current price @ 55$
// TODO: short put: set premium @ 4$
// TODO: short put: set current price @ 48$
// TODO: long put: set premium @ 4$
// TODO: long put: set current price @ 44$
// TODO: short call: set premium @ 4$
// TODO: short call: set current price @ 52$
// TODO: long call: set premium @ 4$
// TODO: long call: set current price @ 56$

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

const Strategy = (charId: string) => {
  const [chart] = useState(new StrategyChart(charId));
  const [loadDefault, setLoadDefault] = useState(true);
  const [drawSigmaLines, setDrawSigmaLines] = useState(false);
  const [numContractsValue, setNumContracts] = useState(
    consts.DEFAULT_STRATEGY_NUM_CONTRACTS,
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
    console.log(
      "onDrawSigmaLinesChange::event.target.checked=",
      event.target.checked,
    );
    setDrawSigmaLines(event.target.checked);
    //let dataFromClipboard = await pasteFromClipboard();
    //console.log('XXX dataFromClipboard=', dataFromClipboard);
  }

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
      contract = new Contract.Short([contractData] as IContractRow[]);
    } else if (selectedContractType === "Long") {
      contractData.type = "Long";
      contractData.qty = -numContractsValue;
      contract = new Contract.Long([contractData] as IContractRow[]);
    } else if (selectedContractType === "Covered Call") {
      contractData.type = "Covered Call";
      contractData.qty = -numContractsValue;
      contract = new Contract.CoveredCall([contractData] as IContractRow[]);
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
      contract = new Contract.Put([contractData] as IContractRow[]);
      if (loadDefault) {
        contract.loadDefaultValues();
        setLoadDefault(false);
        setPremiumValue(contract.getOpenPremium());
        setStrikeValue(contract.getStrike());
      }
    } else if (selectedContractType === "Long Put") {
      contractData.type = "Put";
      contractData.qty = numContractsValue;
      contract = new Contract.Put([contractData] as IContractRow[]);
      if (loadDefault) {
        contract.loadDefaultValues();
        setLoadDefault(false);
        setPremiumValue(contract.getOpenPremium());
        setStrikeValue(contract.getStrike());
      }
    } else if (selectedContractType === "Long Call") {
      contractData.type = "Call";
      contractData.qty = numContractsValue;
      contract = new Contract.Call([contractData] as IContractRow[]);
      if (loadDefault) {
        contract.loadDefaultValues();
        setLoadDefault(false);
        setPremiumValue(contract.getOpenPremium());
        setStrikeValue(contract.getStrike());
      }
    } else if (selectedContractType === "Short Call") {
      contractData.type = "Call";
      contractData.qty = -numContractsValue;
      contract = new Contract.Call([contractData] as IContractRow[]);
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
      contract = new Contract.CreditCallSpread(contractsData);
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
      contract = new Contract.DebitCallSpread(contractsData);
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
      contract = new Contract.CreditPutSpread(contractsData);
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
      contract = new Contract.DebitPutSpread(contractsData);
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
    theContract.type,
  ]);

  useEffect(() => {
    chart.createChart(theContract, sigma, currentPriceValue);
    chart.drawProfileForDaysLeft(theContract, viATMValue, numDaysValue);
    if (drawSigmaLines) {
      console.log("chart.createChart", theContract);
      chart.drawAllSigmaLines(theContract, sigma, currentPriceValue);
    }
  }, [
    theContract,
    chart,
    sigma,
    currentPriceValue,
    drawSigmaLines,
    viATMValue,
    numDaysValue,
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
  const displayOneLegOptionContractTypes = () => {
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
            Current price
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

        {selectedContractType !== "Covered Call" &&
        selectedContractType !== "Short" &&
        selectedContractType !== "Long" ? (
          <Row>
            <Col xl={3} className="justify-content-md-left">
              &nbsp;
            </Col>
          </Row>
        ) : (
          <Row>
            <Col xl={3} className="justify-content-md-left">
              PRU
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
          {displayOneLegOptionContractTypes()}
          {displayTwoLegsOptionContractTypes()}
          {displayContractNumbers()}
          {displayContractParameters(theContract)}
          {displaySigmaLinesSelector(theContract)}
        </Col>
        <Col>{displayPriceInfo(theContract)}</Col>
      </Row>
      <Row>
        <Col>
          <div id={charId}></div>
        </Col>
      </Row>
    </Container>
  );
};
//                     {theContract.getLegs() > 0 ? displaySigmaLinesSelector() : <div></div>}

export default Strategy;

/*

const Strategy2 = (charId: string) => {
    console.log('Strategy');
    const flag = useRef(false);
    const [testValue, setTestValue] = useState(0);
    const [drawSigmaLines, setDrawSigmaLines] = useState(false);
    const [numContractsValue, setNumContracts] = useState(consts.strategyDefaultNumContracts);
    const [strikeValue, setStrikeValue] = useState(consts.strategyDefaultStrike);
    const [strike1Value, setStrike1Value] = useState(consts.strategyDefaultStrike1);
    const [strike2Value, setStrike2Value] = useState(consts.strategyDefaultStrike2);
    const [premiumValue, setPremiumValue] = useState(consts.strategyDefaultPremium);
    const [premium1Value, setPremium1Value] = useState(consts.strategyDefaultPremium1);
    const [premium2Value, setPremium2Value] = useState(consts.strategyDefaultPremium2);
    const [viATMValue, setViatmValue] = useState(consts.strategyDefaultVIATM);
    const [numDaysValue, setNumDaysValue] = useState(consts.strategyDefaultNumDays);

    const [currentPriceValue, setCurrentPriceValue] = useState(consts.strategyDefaultCurrentPrice);
    const [pruValue, setPruValue] = useState(consts.strategyDefaultPRU);

    const [sigma, setSigmaValue] = useState(strikeValue * (viATMValue) * Math.sqrt(numDaysValue / 365));
    const [cost, setCost] = useState(0.0);
    const [breakEven, setBreakEven] = useState(0.0);
    const [maxLost, setMaxLost] = useState(0.0);
    const [maxProfit, setMaxProfit] = useState(0.0);

    const dummyContract = {
        id: 0,
        ticker: "None",
        type: "Put",
        strike: strikeValue.toString(),
        expiration: "",
        open_by: "",
        close_by: "",
        open_premium: premiumValue.toString(),
        close_premium: premiumValue.toString(),
        qty: numContractsValue.toString(),
    } as IContractRow;

    const [theContract, setTheContract] = useState<Contract.OptionContract>(new Contract.OptionContract([dummyContract] as IContractRow[]));

    console.log('Strategy: testValue=', testValue);

    useEffect(() => {
        console.log('useEffect');
        console.log('useEffect theContract.type', theContract.getType());

        if (testValue === 0) {
            console.log('useEffect testValue=', testValue);
            setTestValue(testValue + 1);

            const contractData = {
                id: 0,
                ticker: "None",
                type: "Put",
                strike: strikeValue.toString(),
                expiration: "",
                open_by: "",
                close_by: "",
                open_premium: premiumValue.toString(),
                close_premium: premiumValue.toString(),
                qty: numContractsValue.toString(),
                PRU: +pruValue,
            } as IContractRow;

            contractData.type = "Long";
            contractData.qty = (-numContractsValue).toString();
            setTheContract(new Contract.Long([contractData] as IContractRow[]))




        }
    }, [testValue]);


    return (
        <Container fluid>
            <Row>
                <Col>
                    charId= {charId}
                </Col>
            </Row>
        </Container>
    );
}

*/
