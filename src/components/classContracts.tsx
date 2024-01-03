import { IContractRow } from "../interfaces/datatypes";
import * as utils from "../services/utils";
import * as consts from "../services/constants";

export class OptionContract {
  type: string;
  strike: any;
  expiration: Date;
  openedBy: Date;
  closedBy: Date;
  openPremium: number;
  closePremium: number;
  qty: number;
  pru: number = 0;
  ticker: string;
  legs: number = 0;
  reverseGaussian: boolean = false;

  constructor(contract: IContractRow[]) {
    this.type = contract[0].type;
    this.strike = +contract[0].strike;
    this.expiration = new Date(contract[0].expiration);
    this.openedBy = new Date(contract[0].openedBy);
    this.closedBy = new Date(contract[0].closedBy);
    this.openPremium = +contract[0].openPremium;
    this.closePremium = +contract[0].closePremium;
    this.qty = +contract[0].qty;
    this.ticker = contract[0].ticker;
  }

  displayShortInfo = () => {
    return <p></p>;
  };

  displayLongInfo = () => {
    return <p></p>;
  };

  displayInfo = () => {
    return (
      <div>
        {" "}
        <p>
          <u>Contract summary</u>
        </p>
        {this.qty > 0 ? this.displayLongInfo() : this.displayShortInfo()}
        <p> Contract Type: {this.type}</p>
        <p> Quantity: {this.qty}</p>
      </div>
    );
  };

  isATM(currentPriceValue: number) {
    return this.getStrike() === currentPriceValue;
  }

  isITM(currentPriceValue: number) {
    return false;
  }

  isOTM(currentPriceValue: number) {
    return false;
  }

  getLegs() {
    return this.legs;
  }

  setLegs(legs: number) {
    this.legs = legs;
  }

  isContractClosed() {
    return !isNaN(this.closedBy.getTime());
  }

  isContractOpened() {
    return !isNaN(this.openedBy.getTime());
  }

  getContractEndDate() {
    return this.isContractClosed() ? this.closedBy : this.expiration;
  }

  getType() {
    return this.type;
  }

  getStrike() {
    return this.strike;
  }

  getExpiration() {
    return this.expiration;
  }

  getOpenBy() {
    return this.openedBy;
  }

  getCloseBy() {
    return this.closedBy;
  }

  getOpenPremium() {
    return this.openPremium;
  }

  getClosePremium() {
    return this.closePremium;
  }

  getQty() {
    return this.qty;
  }

  getTicker() {
    return this.ticker;
  }

  getTitle() {
    return `${this.qty} x ${this.type} ${this.ticker}, Strike ${
      this.strike
    }, Exp. ${utils.dateToYYYYYMMDD(this.expiration)} `;
  }

  getOpenTotalPremium() {
    return (
      consts.NUM_SHARES_PER_CONTRACT * this.getOpenPremium() * this.getQty()
    );
  }

  setPru(pru: number) {
    this.pru = pru;
  }

  getPru() {
    return this.pru;
  }

  getBreakEvenValue() {
    return 0;
  }

  getMaxLost() {
    return 0;
  }

  getMaxProfit() {
    return 0;
  }

  getInitialCost() {
    return 0;
  }

  getYlimits() {
    let ymin =
      -consts.NUM_SHARES_PER_CONTRACT *
      Math.abs(this.getQty()) *
      (1 + Math.floor(this.getOpenPremium() / 1));
    let ymax = -ymin;
    return [ymin, ymax];
  }

  drawProfileForDaysLeft(
    svg: any,
    x: any,
    y: any,
    clipPath: string,
    xmin: number,
    xmax: number,
    iv: number,
    numDaysValue: number,
  ) {}

  getPLforPrice(price: number) {
    return 0;
  }

  getPLforPriceForDaysLeft(
    price: number,
    interest_rate: number,
    iv: number,
    numDaysValue: number,
    dividend_yield: number,
  ) {
    return 0;
  }

  getPrice(
    price: number,
    interest_rate: number,
    iv: number,
    numDaysValue: number,
    dividend_yield: number,
  ) {
    let data = this.getOptionsData(
      price,
      interest_rate,
      iv,
      numDaysValue,
      dividend_yield,
    );
    return data[0];
  }

  getDelta(
    price: number,
    interest_rate: number,
    iv: number,
    numDaysValue: number,
    dividend_yield: number,
  ) {
    const data = this.getOptionsData(
      price,
      interest_rate,
      iv,
      numDaysValue,
      dividend_yield,
    );
    return data[1];
  }

  getGamma(
    price: number,
    interest_rate: number,
    iv: number,
    numDaysValue: number,
    dividend_yield: number,
  ) {
    const data = this.getOptionsData(
      price,
      interest_rate,
      iv,
      numDaysValue,
      dividend_yield,
    );
    return data[2];
  }

  getTheta(
    price: number,
    interest_rate: number,
    iv: number,
    numDaysValue: number,
    dividend_yield: number,
  ) {
    const data = this.getOptionsData(
      price,
      interest_rate,
      iv,
      numDaysValue,
      dividend_yield,
    );
    return data[3];
  }

  getRho(
    price: number,
    interest_rate: number,
    iv: number,
    numDaysValue: number,
    dividend_yield: number,
  ) {
    const data = this.getOptionsData(
      price,
      interest_rate,
      iv,
      numDaysValue,
      dividend_yield,
    );
    return data[4];
  }

  getVega(
    price: number,
    interest_rate: number,
    iv: number,
    numDaysValue: number,
    dividend_yield: number,
  ) {
    const data = this.getOptionsData(
      price,
      interest_rate,
      iv,
      numDaysValue,
      dividend_yield,
    );
    return data[5];
  }

  getOptionsData(
    price: number,
    interest_rate: number,
    iv: number,
    numDaysValue: number,
    dividend_yield: number,
  ) {
    const o = utils.computeOptionPrice(
      price,
      this.getStrike(),
      interest_rate,
      iv,
      dividend_yield,
      numDaysValue,
    );
    return o[this.getType() === "Call" ? 0 : 1];
  }

  getGaussianCurveDate(sigma: number, currentPriceValue: number) {
    let gdata = utils.computeGaussianData(sigma, currentPriceValue);
    let data_sigma = gdata[0] as number[][];
    let data_sigma_int = gdata[1] as number[][];
    if (this.reverseGaussian) {
      data_sigma_int = data_sigma_int.map((d) => [d[0], 1 - d[1]]);
    }
    let success_rate = utils.getSuccessRate(
      data_sigma,
      data_sigma_int,
      this.getStrike(),
    );
    return [data_sigma, data_sigma_int, success_rate];
  }
}
