import {
  IContractRow,
  IOptionProfitAndLostData,
} from "../interfaces/datatypes";
import * as utils from "../services/utils";
import * as d3 from "d3";
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
}

export class Put extends OptionContract {
  constructor(contract: IContractRow[]) {
    super(contract);
    this.type = "Put";
    this.setLegs(1);
  }
  loadDefaultValues() {
    this.strike = 50.0;
    this.openPremium = 1.0;
    this.qty = 1;
  }
  getBreakEvenValue() {
    return this.getStrike() - this.getOpenPremium();
  }
  getMaxLost() {
    return this.getQty() < 0
      ? this.getStrike() * consts.NUM_SHARES_PER_CONTRACT * this.getQty()
      : -this.getOpenPremium() * consts.NUM_SHARES_PER_CONTRACT * this.getQty();
  }
  getMaxProfit() {
    return this.getQty() > 0
      ? this.getStrike() * consts.NUM_SHARES_PER_CONTRACT * this.getQty()
      : -this.getOpenPremium() * consts.NUM_SHARES_PER_CONTRACT * this.getQty();
  }
  getInitialCost() {
    return (
      -this.getOpenPremium() * consts.NUM_SHARES_PER_CONTRACT * this.getQty()
    );
  }
  getGaussianCurveDate(sigma: number, currentPriceValue: number) {
    let gdata = utils.computeGaussianData(sigma, currentPriceValue);
    let data_sigma = gdata[0] as number[][];
    let data_sigma_int = gdata[1] as number[][];
    if (this.getQty() < 0) {
      data_sigma_int = data_sigma_int.map((d) => [d[0], 1 - d[1]]);
    }
    let success_rate = utils.getSuccessRate(
      data_sigma,
      data_sigma_int,
      this.getStrike(),
    );
    return [data_sigma, data_sigma_int, success_rate];
  }
  getPLforPrice(price: number) {
    let v = 0;
    if (price >= this.getStrike()) {
      v = this.getOpenPremium();
    } else {
      v = this.getOpenPremium() - (this.getStrike() - price);
    }
    return -v * this.getQty() * consts.NUM_SHARES_PER_CONTRACT;
  }
  drawProfile(
    svg: any,
    x: any,
    y: any,
    yRight: any,
    clipPath: string,
    xmin: number,
    xmax: number,
  ) {
    const line = d3
      .line()
      .x((d: any) => x(d.price))
      .y((d: any) => y(d.pl));
    let data_pl_pos: IOptionProfitAndLostData[] = [];
    let data_pl_neg: IOptionProfitAndLostData[] = [];

    for (let price = xmin; price <= xmax; price += 0.05) {
      let p = this.getPLforPrice(price);
      if (p >= 0) data_pl_pos.push({ price: price, pl: p });
      else data_pl_neg.push({ price: price, pl: p });
    }

    svg
      .append("path")
      .datum(data_pl_pos)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 3)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
    svg
      .append("path")
      .datum(data_pl_neg)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 3)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
  }
  getPLforPriceForDaysLeft(
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
    let put_data = o[1];
    let put_price = put_data[0];
    let p_and_l: number = 0;
    p_and_l =
      this.getInitialCost() +
      this.getQty() * consts.NUM_SHARES_PER_CONTRACT * put_price;
    return p_and_l;
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
  ) {
    const interest_rate = 0;
    const dividend_yield = 0;

    let datax: number[] = [];
    let datay: number[] = [];
    let p_and_l: number = 0;
    for (let price = xmin; price < xmax; price += 0.2) {
      if (0) {
        const o = utils.computeOptionPrice(
          price,
          this.getStrike(),
          interest_rate,
          iv,
          dividend_yield,
          numDaysValue,
        );
        let put_data = o[1];
        let put_price = put_data[0];

        p_and_l =
          this.getInitialCost() +
          this.getQty() * consts.NUM_SHARES_PER_CONTRACT * put_price;
      } else {
        p_and_l = this.getPLforPriceForDaysLeft(
          price,
          interest_rate,
          iv,
          numDaysValue,
          dividend_yield,
        );
      }
      datax.push(price);
      datay.push(p_and_l);
    }
    let data: IOptionProfitAndLostData[] = [];
    for (let i = 0; i < datax.length; i++) {
      data.push({ price: datax[i], pl: datay[i] });
    }
    const line = d3
      .line()
      .x((d: any) => x(d.price))
      .y((d: any) => y(d.pl));

    svg
      .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 1)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
  }
}

export class Call extends OptionContract {
  constructor(contract: IContractRow[]) {
    super(contract);
    this.type = "Call";
    this.setLegs(1);
  }
  loadDefaultValues() {
    this.strike = 50.0;
    this.openPremium = 1.0;
    this.qty = 1;
  }
  getBreakEvenValue() {
    return this.getStrike() + this.getOpenPremium();
  }
  getMaxLost() {
    return this.getQty() < 0
      ? -Number.POSITIVE_INFINITY
      : -this.getOpenPremium() * consts.NUM_SHARES_PER_CONTRACT * this.getQty();
  }
  getMaxProfit() {
    return this.getQty() > 0
      ? Number.POSITIVE_INFINITY
      : -this.getOpenPremium() * consts.NUM_SHARES_PER_CONTRACT * this.getQty();
  }
  getInitialCost() {
    return (
      -this.getOpenPremium() * consts.NUM_SHARES_PER_CONTRACT * this.getQty()
    );
  }
  getGaussianCurveDate(sigma: number, currentPriceValue: number) {
    let gdata = utils.computeGaussianData(sigma, currentPriceValue);
    let data_sigma = gdata[0] as number[][];
    let data_sigma_int = gdata[1] as number[][];
    if (this.getQty() > 0) {
      data_sigma_int = data_sigma_int.map((d) => [d[0], 1 - d[1]]);
    }
    let success_rate = utils.getSuccessRate(
      data_sigma,
      data_sigma_int,
      this.getStrike(),
    );
    return [data_sigma, data_sigma_int, success_rate];
  }
  getPLforPrice(price: number) {
    let v = 0;
    if (price <= this.getStrike()) {
      v = this.getOpenPremium();
    } else {
      v = this.getOpenPremium() + (this.getStrike() - price);
    }
    return -v * this.getQty() * consts.NUM_SHARES_PER_CONTRACT;
  }
  drawProfile(
    svg: any,
    x: any,
    y: any,
    yRight: any,
    clipPath: string,
    xmin: number,
    xmax: number,
  ) {
    const line = d3
      .line()
      .x((d: any) => x(d.price))
      .y((d: any) => y(d.pl));
    let data_pl_pos: IOptionProfitAndLostData[] = [];
    let data_pl_neg: IOptionProfitAndLostData[] = [];

    for (let price = xmin; price <= xmax; price += 0.05) {
      let p = this.getPLforPrice(price);
      if (p >= 0) data_pl_pos.push({ price: price, pl: p });
      else data_pl_neg.push({ price: price, pl: p });
    }

    svg
      .append("path")
      .datum(data_pl_pos)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 3)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
    svg
      .append("path")
      .datum(data_pl_neg)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 3)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
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
  ) {
    const interest_rate = 0;
    const dividend_yield = 0;

    let datax: number[] = [];
    let datay: number[] = [];
    for (let price = xmin; price < xmax; price += 0.2) {
      const o = utils.computeOptionPrice(
        price,
        this.getStrike(),
        interest_rate,
        iv,
        dividend_yield,
        numDaysValue,
      );
      let call_data = o[0];
      let call_price = call_data[0];
      let p_and_l: number = 0;
      p_and_l =
        this.getInitialCost() +
        this.getQty() * consts.NUM_SHARES_PER_CONTRACT * call_price;
      datax.push(price);
      datay.push(p_and_l);
    }
    let data: IOptionProfitAndLostData[] = [];
    for (let i = 0; i < datax.length; i++) {
      data.push({ price: datax[i], pl: datay[i] });
    }
    const line = d3
      .line()
      .x((d: any) => x(d.price))
      .y((d: any) => y(d.pl));

    svg
      .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 1)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
  }
}

export class CoveredCall extends OptionContract {
  constructor(contract: IContractRow[]) {
    super(contract);
    this.type = "Covered Call";
    this.setLegs(1);
  }
  loadDefaultValues() {
    this.strike = 55.0;
    this.openPremium = 1.0;
    this.qty = 1;
    this.pru = 50;
  }
  getBreakEvenValue() {
    return this.getPru() - this.getOpenPremium();
  }
  getStrikePointB() {
    return [
      this.getStrike(),
      -this.getQty() *
        consts.NUM_SHARES_PER_CONTRACT *
        (this.getStrike() - this.getBreakEvenValue()),
    ];
  }
  getMaxLost() {
    return (
      this.getBreakEvenValue() * consts.NUM_SHARES_PER_CONTRACT * this.getQty()
    );
  }
  getMaxProfit() {
    return (
      consts.NUM_SHARES_PER_CONTRACT *
      Math.abs(this.getQty()) *
      (this.getStrike() - this.getBreakEvenValue())
    );
  }
  getInitialCost() {
    return this.getMaxProfit();
  }
  getGaussianCurveDate(sigma: number, currentPriceValue: number) {
    let gdata = utils.computeGaussianData(sigma, currentPriceValue);
    let data_sigma = gdata[0] as number[][];
    let data_sigma_int = gdata[1] as number[][];
    if (this.getQty() > 0) {
      data_sigma_int = data_sigma_int.map((d) => [d[0], 1 - d[1]]);
    }
    let success_rate = utils.getSuccessRate(
      data_sigma,
      data_sigma_int,
      this.getStrike(),
    );
    return [data_sigma, data_sigma_int, success_rate];
  }
  getYlimits() {
    let ymin =
      -consts.NUM_SHARES_PER_CONTRACT *
      Math.abs(this.getQty()) *
      (this.getStrike() - this.getPru());
    ymin = ymin * 1.5;
    let ymax = -ymin;
    return [ymin, ymax];
  }
  getPLforPrice(price: number) {
    let v = 0;
    if (price <= this.getStrike()) {
      v = price - this.getPru() + this.getOpenPremium();
    } else {
      v = this.getStrike() - this.getPru() + this.getOpenPremium();
    }
    return -this.getQty() * v * consts.NUM_SHARES_PER_CONTRACT;
  }
  drawProfile(
    svg: any,
    x: any,
    y: any,
    yRight: any,
    clipPath: string,
    xmin: number,
    xmax: number,
  ) {
    const line = d3
      .line()
      .x((d: any) => x(d.price))
      .y((d: any) => y(d.pl));
    let data_pl_pos: IOptionProfitAndLostData[] = [];
    let data_pl_neg: IOptionProfitAndLostData[] = [];

    for (let price = xmin; price <= xmax; price += 0.05) {
      let p = this.getPLforPrice(price);
      if (p >= 0) data_pl_pos.push({ price: price, pl: p });
      else data_pl_neg.push({ price: price, pl: p });
    }
    svg
      .append("rect")
      .attr("x", x(xmin))
      .attr("y", yRight(1))
      .attr("width", x(this.getBreakEvenValue()) - x(xmin))
      .attr("height", yRight(-1) - yRight(1))
      .attr("class", "redzone-rect")
      .attr("visibility", "visible");
    svg
      .append("rect")
      .attr("x", x(2 * this.getStrike() - this.getBreakEvenValue()))
      .attr("y", yRight(1))
      .attr(
        "width",
        x(xmax) - x(2 * this.getStrike() - this.getBreakEvenValue()),
      )
      .attr("height", yRight(-1) - yRight(1))
      .attr("class", "redzone-rect")
      .attr("visibility", "visible");
    svg
      .append("path")
      .datum(data_pl_pos)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 3)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
    svg
      .append("path")
      .datum(data_pl_neg)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 3)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
  }
}

export class CreditCallSpread extends OptionContract {
  soldCall: Call;
  boughtCall: Call;

  constructor(contracts: IContractRow[]) {
    super(contracts);
    this.soldCall = new Call([contracts[0]] as IContractRow[]);
    this.boughtCall = new Call([contracts[1]] as IContractRow[]);
    this.type = this.soldCall.getType();
    this.strike = [this.soldCall.getStrike(), this.boughtCall.getStrike()];
    this.expiration = this.soldCall.getExpiration();
    this.openedBy = this.soldCall.getOpenBy();
    this.closedBy = this.soldCall.getCloseBy();
    this.openPremium =
      this.soldCall.getOpenPremium() - this.boughtCall.getOpenPremium();
    this.closePremium =
      this.soldCall.getClosePremium() - this.boughtCall.getClosePremium();
    this.qty = Math.abs(this.soldCall.getQty());
    this.ticker = this.soldCall.getTicker();
    this.type = "Credit Call Spread";
    this.setLegs(2);
  }
  loadDefaultValues() {
    this.soldCall.strike = 60.0;
    this.boughtCall.strike = 65.0;
    this.soldCall.openPremium = 4;
    this.boughtCall.openPremium = 2;
    this.qty = 1;
  }
  getTitle() {
    return `${this.qty} x ${this.type} ${
      this.ticker
    }, Strike ${this.soldCall.getStrike()} / ${this.boughtCall.getStrike()}, Exp. ${utils.dateToYYYYYMMDD(
      this.expiration,
    )} `;
  }
  getOpenTotalPremium() {
    return this.soldCall.getOpenPremium() - this.boughtCall.getOpenPremium();
  }
  getBreakEvenValue() {
    return this.soldCall.getStrike() + this.getOpenTotalPremium();
  }
  getYlimits() {
    let ymin = this.getMaxLost();
    ymin = ymin * 1.5;
    let ymax = -ymin;
    return [ymin, ymax];
  }
  getMaxLost() {
    return (
      (this.soldCall.getStrike() -
        this.boughtCall.getStrike() +
        this.getOpenTotalPremium()) *
      consts.NUM_SHARES_PER_CONTRACT *
      this.getQty()
    );
  }
  getMaxProfit() {
    return (
      this.getOpenTotalPremium() *
      consts.NUM_SHARES_PER_CONTRACT *
      this.getQty()
    );
  }
  getInitialCost() {
    return this.getMaxProfit();
  }
  getStrike() {
    return this.soldCall.getStrike();
  }
  getGaussianCurveDate(sigma: number, currentPriceValue: number) {
    let gdata = utils.computeGaussianData(sigma, currentPriceValue);
    let data_sigma = gdata[0] as number[][];
    let data_sigma_int = gdata[1] as number[][];
    if (this.getQty() < 0) {
      data_sigma_int = data_sigma_int.map((d) => [d[0], 1 - d[1]]);
    }
    let success_rate = utils.getSuccessRate(
      data_sigma,
      data_sigma_int,
      this.getStrike(),
    );

    return [data_sigma, data_sigma_int, success_rate];
  }
  getPLforPrice(price: number) {
    let p1 = this.soldCall.getPLforPrice(price);
    let p2 = this.boughtCall.getPLforPrice(price);
    let p = p2 - p1;
    return p;
  }
  drawProfile(
    svg: any,
    x: any,
    y: any,
    yRight: any,
    clipPath: string,
    xmin: number,
    xmax: number,
  ) {
    const line = d3
      .line()
      .x((d: any) => x(d.price))
      .y((d: any) => y(d.pl));
    let data_pl_pos: IOptionProfitAndLostData[] = [];
    let data_pl_neg: IOptionProfitAndLostData[] = [];

    for (let price = xmin; price <= xmax; price += 0.05) {
      let p1 = this.soldCall.getPLforPrice(price);
      let p2 = this.boughtCall.getPLforPrice(price);
      let p = p2 - p1;
      if (p >= 0) data_pl_pos.push({ price: price, pl: p });
      else data_pl_neg.push({ price: price, pl: p });
    }

    svg
      .append("path")
      .datum(data_pl_pos)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 3)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
    svg
      .append("path")
      .datum(data_pl_neg)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 3)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
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
  ) {
    const interest_rate = 0;
    const dividend_yield = 0;

    let datax: number[] = [];
    let datay1: number[] = [];
    for (let price = xmin; price < xmax; price += 0.2) {
      const o = utils.computeOptionPrice(
        price,
        this.soldCall.getStrike(),
        interest_rate,
        iv,
        dividend_yield,
        numDaysValue,
      );
      let option_data = o[0];
      let option_price = option_data[0];
      let p_and_l: number = 0;
      p_and_l =
        this.getInitialCost() -
        this.getQty() * consts.NUM_SHARES_PER_CONTRACT * option_price;
      datax.push(price);
      datay1.push(p_and_l);
    }
    let data1: IOptionProfitAndLostData[] = [];
    for (let i = 0; i < datax.length; i++) {
      data1.push({ price: datax[i], pl: datay1[i] });
    }

    let datay2: number[] = [];
    for (let price = xmin; price < xmax; price += 0.2) {
      const o = utils.computeOptionPrice(
        price,
        this.boughtCall.getStrike(),
        interest_rate,
        iv,
        dividend_yield,
        numDaysValue,
      );
      let option_data = o[0];
      let option_price = option_data[0];
      let p_and_l: number = 0;
      p_and_l = this.getQty() * consts.NUM_SHARES_PER_CONTRACT * option_price;
      datay2.push(p_and_l);
    }
    let data2: IOptionProfitAndLostData[] = [];
    for (let i = 0; i < datax.length; i++) {
      data2.push({ price: datax[i], pl: datay2[i] });
    }
    let data: IOptionProfitAndLostData[] = [];
    for (let i = 0; i < datax.length; i++) {
      data.push({ price: datax[i], pl: datay1[i] + datay2[i] });
    }
    const line = d3
      .line()
      .x((d: any) => x(d.price))
      .y((d: any) => y(d.pl));

    svg
      .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 1)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
  }
}

export class CreditPutSpread extends OptionContract {
  soldPut: Put;
  boughtPut: Put;

  constructor(contracts: IContractRow[]) {
    super(contracts);
    this.boughtPut = new Put([contracts[0]] as IContractRow[]);
    this.soldPut = new Put([contracts[1]] as IContractRow[]);
    this.type = this.soldPut.getType();
    this.strike = [this.soldPut.getStrike(), this.boughtPut.getStrike()];
    this.expiration = this.soldPut.getExpiration();
    this.openedBy = this.soldPut.getOpenBy();
    this.closedBy = this.soldPut.getCloseBy();
    this.openPremium =
      this.soldPut.getOpenPremium() - this.boughtPut.getOpenPremium();
    this.closePremium =
      this.soldPut.getClosePremium() - this.boughtPut.getClosePremium();
    this.qty = Math.abs(this.soldPut.getQty());
    this.ticker = this.soldPut.getTicker();
    this.type = "Credit Put Spread";
    this.setLegs(2);
  }
  loadDefaultValues() {
    this.boughtPut.strike = 45.0;
    this.soldPut.strike = 50.0;
    this.boughtPut.openPremium = 2;
    this.soldPut.openPremium = 4;
    this.qty = 1;
  }

  getTitle() {
    return `${this.qty} x ${this.type} ${
      this.ticker
    }, Strike ${this.soldPut.getStrike()} / ${this.boughtPut.getStrike()}, Exp. ${utils.dateToYYYYYMMDD(
      this.expiration,
    )} `;
  }
  getOpenTotalPremium() {
    return this.soldPut.getOpenPremium() - this.boughtPut.getOpenPremium();
  }
  getBreakEvenValue() {
    let v = this.soldPut.getStrike() - this.getOpenTotalPremium();
    return v;
  }
  getYlimits() {
    let ymin = this.getMaxLost();
    ymin = ymin * 1.5;
    let ymax = -ymin;
    return [ymin, ymax];
  }
  getMaxProfit() {
    let v =
      this.getOpenTotalPremium() *
      consts.NUM_SHARES_PER_CONTRACT *
      this.getQty();
    return v;
  }
  getMaxLost() {
    let v =
      -(
        this.soldPut.getStrike() -
        this.boughtPut.getStrike() -
        this.getOpenTotalPremium()
      ) *
      consts.NUM_SHARES_PER_CONTRACT *
      this.getQty();
    return v;
  }
  getInitialCost() {
    return this.getMaxProfit();
  }
  getStrike() {
    return this.soldPut.getStrike();
  }
  getGaussianCurveDate(sigma: number, currentPriceValue: number) {
    let gdata = utils.computeGaussianData(sigma, currentPriceValue);
    let data_sigma = gdata[0] as number[][];
    let data_sigma_int = gdata[1] as number[][];
    if (this.getQty() < 0) {
      data_sigma_int = data_sigma_int.map((d) => [d[0], 1 - d[1]]);
    }
    let success_rate = utils.getSuccessRate(
      data_sigma,
      data_sigma_int,
      this.getStrike(),
    );

    return [data_sigma, data_sigma_int, success_rate];
  }
  getPLforPrice(price: number) {
    let p1 = this.soldPut.getPLforPrice(price);
    let p2 = this.boughtPut.getPLforPrice(price);
    let p = p2 - p1;
    return p;
  }
  drawProfile(
    svg: any,
    x: any,
    y: any,
    yRight: any,
    clipPath: string,
    xmin: number,
    xmax: number,
  ) {
    const line = d3
      .line()
      .x((d: any) => x(d.price))
      .y((d: any) => y(d.pl));
    let data_pl_pos: IOptionProfitAndLostData[] = [];
    let data_pl_neg: IOptionProfitAndLostData[] = [];

    for (let price = xmin; price <= xmax; price += 0.05) {
      let p1 = this.soldPut.getPLforPrice(price);
      let p2 = this.boughtPut.getPLforPrice(price);
      let p = p2 - p1;
      if (p >= 0) data_pl_pos.push({ price: price, pl: p });
      else data_pl_neg.push({ price: price, pl: p });
    }

    svg
      .append("path")
      .datum(data_pl_pos)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 3)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
    svg
      .append("path")
      .datum(data_pl_neg)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 3)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
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
  ) {
    const interest_rate = 0;
    const dividend_yield = 0;

    let datax: number[] = [];
    let datay1: number[] = [];
    for (let price = xmin; price < xmax; price += 0.2) {
      const o = utils.computeOptionPrice(
        price,
        this.soldPut.getStrike(),
        interest_rate,
        iv,
        dividend_yield,
        numDaysValue,
      );
      let put_data = o[1];
      let put_price = put_data[0];
      let p_and_l: number = 0;
      p_and_l =
        this.getInitialCost() -
        this.getQty() * consts.NUM_SHARES_PER_CONTRACT * put_price;
      datax.push(price);
      datay1.push(p_and_l);
    }
    let data1: IOptionProfitAndLostData[] = [];
    for (let i = 0; i < datax.length; i++) {
      data1.push({ price: datax[i], pl: datay1[i] });
    }

    let datay2: number[] = [];
    for (let price = xmin; price < xmax; price += 0.2) {
      const o = utils.computeOptionPrice(
        price,
        this.boughtPut.getStrike(),
        interest_rate,
        iv,
        dividend_yield,
        numDaysValue,
      );
      let put_data = o[1];
      let put_price = put_data[0];
      let p_and_l: number = 0;
      p_and_l = this.getQty() * consts.NUM_SHARES_PER_CONTRACT * put_price;
      datay2.push(p_and_l);
    }
    let data2: IOptionProfitAndLostData[] = [];
    for (let i = 0; i < datax.length; i++) {
      data2.push({ price: datax[i], pl: datay2[i] });
    }
    let data: IOptionProfitAndLostData[] = [];
    for (let i = 0; i < datax.length; i++) {
      data.push({ price: datax[i], pl: datay1[i] + datay2[i] });
    }
    const line = d3
      .line()
      .x((d: any) => x(d.price))
      .y((d: any) => y(d.pl));

    svg
      .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 1)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
  }
}

export class DebitCallSpread extends OptionContract {
  soldCall: Call;
  boughtCall: Call;

  constructor(contracts: IContractRow[]) {
    super(contracts);
    this.boughtCall = new Call([contracts[0]] as IContractRow[]);
    this.soldCall = new Call([contracts[1]] as IContractRow[]);
    this.type = this.soldCall.getType();
    this.strike = [this.soldCall.getStrike(), this.boughtCall.getStrike()];
    this.expiration = this.soldCall.getExpiration();
    this.openedBy = this.soldCall.getOpenBy();
    this.closedBy = this.soldCall.getCloseBy();
    this.openPremium =
      this.soldCall.getOpenPremium() - this.boughtCall.getOpenPremium();
    console.log("this.open_premium=", this.openPremium);
    this.closePremium =
      this.soldCall.getClosePremium() - this.boughtCall.getClosePremium();
    this.qty = Math.abs(this.soldCall.getQty());
    this.ticker = this.soldCall.getTicker();
    this.type = "Debit Call Spread";
    this.setLegs(2);
  }
  loadDefaultValues() {
    this.boughtCall.strike = 50.0;
    this.soldCall.strike = 60.0;
    this.boughtCall.openPremium = 7.5;
    this.soldCall.openPremium = 2.5;
    this.qty = 1;
  }

  getTitle() {
    return `${this.qty} x ${this.type} ${
      this.ticker
    }, Strike ${this.soldCall.getStrike()} / ${this.boughtCall.getStrike()}, Exp. ${utils.dateToYYYYYMMDD(
      this.expiration,
    )} `;
  }
  getOpenTotalPremium() {
    return this.soldCall.getOpenPremium() - this.boughtCall.getOpenPremium();
  }
  getBreakEvenValue() {
    return this.boughtCall.getStrike() - this.getOpenTotalPremium();
  }
  getYlimits() {
    let ymin = this.getMaxLost();
    ymin = ymin * 1.5;
    let ymax = -ymin;
    return [ymin, ymax];
  }
  getMaxLost() {
    return (
      this.getOpenTotalPremium() *
      consts.NUM_SHARES_PER_CONTRACT *
      this.getQty()
    );
  }
  getMaxProfit() {
    return (
      this.getMaxLost() +
      (this.soldCall.getStrike() - this.boughtCall.getStrike()) *
        consts.NUM_SHARES_PER_CONTRACT *
        this.getQty()
    );
  }
  getInitialCost() {
    return this.getMaxLost();
  }
  getStrike() {
    return this.soldCall.getStrike();
  }
  getGaussianCurveDate(sigma: number, currentPriceValue: number) {
    let gdata = utils.computeGaussianData(sigma, currentPriceValue);
    let data_sigma = gdata[0] as number[][];
    let data_sigma_int = gdata[1] as number[][];
    if (this.getQty() < 0) {
      data_sigma_int = data_sigma_int.map((d) => [d[0], 1 - d[1]]);
    }
    let success_rate = utils.getSuccessRate(
      data_sigma,
      data_sigma_int,
      this.getStrike(),
    );

    return [data_sigma, data_sigma_int, success_rate];
  }
  getPLforPrice(price: number) {
    let p1 = this.soldCall.getPLforPrice(price);
    let p2 = this.boughtCall.getPLforPrice(price);
    let p = p2 - p1;
    return p;
  }
  drawProfile(
    svg: any,
    x: any,
    y: any,
    yRight: any,
    clipPath: string,
    xmin: number,
    xmax: number,
  ) {
    const line = d3
      .line()
      .x((d: any) => x(d.price))
      .y((d: any) => y(d.pl));
    let data_pl_pos: IOptionProfitAndLostData[] = [];
    let data_pl_neg: IOptionProfitAndLostData[] = [];

    for (let price = xmin; price <= xmax; price += 0.05) {
      let p1 = this.soldCall.getPLforPrice(price);
      let p2 = this.boughtCall.getPLforPrice(price);
      let p = p2 - p1;
      if (p >= 0) data_pl_pos.push({ price: price, pl: p });
      else data_pl_neg.push({ price: price, pl: p });
    }

    svg
      .append("path")
      .datum(data_pl_pos)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 3)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
    svg
      .append("path")
      .datum(data_pl_neg)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 3)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
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
  ) {
    const interest_rate = 0;
    const dividend_yield = 0;

    let datax: number[] = [];
    let datay1: number[] = [];
    for (let price = xmin; price < xmax; price += 0.2) {
      const o = utils.computeOptionPrice(
        price,
        this.soldCall.getStrike(),
        interest_rate,
        iv,
        dividend_yield,
        numDaysValue,
      );
      let option_data = o[0];
      let option_price = option_data[0];
      let p_and_l: number = 0;
      p_and_l =
        this.getInitialCost() -
        this.getQty() * consts.NUM_SHARES_PER_CONTRACT * option_price;
      datax.push(price);
      datay1.push(p_and_l);
    }
    let data1: IOptionProfitAndLostData[] = [];
    for (let i = 0; i < datax.length; i++) {
      data1.push({ price: datax[i], pl: datay1[i] });
    }

    let datay2: number[] = [];
    for (let price = xmin; price < xmax; price += 0.2) {
      const o = utils.computeOptionPrice(
        price,
        this.boughtCall.getStrike(),
        interest_rate,
        iv,
        dividend_yield,
        numDaysValue,
      );
      let option_data = o[0];
      let option_price = option_data[0];
      let p_and_l: number = 0;
      p_and_l = this.getQty() * consts.NUM_SHARES_PER_CONTRACT * option_price;
      datay2.push(p_and_l);
    }
    let data2: IOptionProfitAndLostData[] = [];
    for (let i = 0; i < datax.length; i++) {
      data2.push({ price: datax[i], pl: datay2[i] });
    }
    let data: IOptionProfitAndLostData[] = [];
    for (let i = 0; i < datax.length; i++) {
      data.push({ price: datax[i], pl: datay1[i] + datay2[i] });
    }
    const line = d3
      .line()
      .x((d: any) => x(d.price))
      .y((d: any) => y(d.pl));

    svg
      .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 1)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
  }
}

export class DebitPutSpread extends OptionContract {
  soldPut: Call;
  boughtPut: Call;

  constructor(contracts: IContractRow[]) {
    super(contracts);
    this.soldPut = new Put([contracts[0]] as IContractRow[]);
    this.boughtPut = new Put([contracts[1]] as IContractRow[]);
    this.type = this.soldPut.getType();
    this.strike = [this.soldPut.getStrike(), this.boughtPut.getStrike()];
    this.expiration = this.soldPut.getExpiration();
    this.openedBy = this.soldPut.getOpenBy();
    this.closedBy = this.soldPut.getCloseBy();
    this.openPremium =
      this.soldPut.getOpenPremium() - this.boughtPut.getOpenPremium();
    console.log("this.open_premium=", this.openPremium);
    this.closePremium =
      this.soldPut.getClosePremium() - this.boughtPut.getClosePremium();
    this.qty = Math.abs(this.soldPut.getQty());
    this.ticker = this.soldPut.getTicker();
    this.type = "Debit Put Spread";
    this.setLegs(2);
  }
  loadDefaultValues() {
    this.soldPut.strike = 50.0;
    this.boughtPut.strike = 60.0;
    this.soldPut.openPremium = 2.5;
    this.boughtPut.openPremium = 7.5;
    this.qty = 1;
  }
  getTitle() {
    return `${this.qty} x ${this.type} ${
      this.ticker
    }, Strike ${this.soldPut.getStrike()} / ${this.boughtPut.getStrike()}, Exp. ${utils.dateToYYYYYMMDD(
      this.expiration,
    )} `;
  }
  getOpenTotalPremium() {
    return this.boughtPut.getOpenPremium() - this.soldPut.getOpenPremium();
  }
  getBreakEvenValue() {
    return this.boughtPut.getStrike() - this.getOpenTotalPremium();
  }
  getYlimits() {
    let ymin = this.getMaxLost();
    ymin = ymin * 1.5;
    let ymax = -ymin;
    return [ymin, ymax];
  }
  getMaxProfit() {
    return (
      this.getMaxLost() +
      (this.boughtPut.getStrike() - this.soldPut.getStrike()) *
        consts.NUM_SHARES_PER_CONTRACT *
        this.getQty()
    );
  }
  getMaxLost() {
    return (
      -this.getOpenTotalPremium() *
      consts.NUM_SHARES_PER_CONTRACT *
      this.getQty()
    );
  }
  getInitialCost() {
    return this.getMaxLost();
  }
  getStrike() {
    return this.soldPut.getStrike();
  }
  getGaussianCurveDate(sigma: number, currentPriceValue: number) {
    let gdata = utils.computeGaussianData(sigma, currentPriceValue);
    let data_sigma = gdata[0] as number[][];
    let data_sigma_int = gdata[1] as number[][];
    if (this.getQty() < 0) {
      data_sigma_int = data_sigma_int.map((d) => [d[0], 1 - d[1]]);
    }
    let success_rate = utils.getSuccessRate(
      data_sigma,
      data_sigma_int,
      this.getStrike(),
    );

    return [data_sigma, data_sigma_int, success_rate];
  }
  getPLforPrice(price: number) {
    let p1 = this.soldPut.getPLforPrice(price);
    let p2 = this.boughtPut.getPLforPrice(price);
    let p = p2 - p1;
    return p;
  }
  drawProfile(
    svg: any,
    x: any,
    y: any,
    yRight: any,
    clipPath: string,
    xmin: number,
    xmax: number,
  ) {
    const line = d3
      .line()
      .x((d: any) => x(d.price))
      .y((d: any) => y(d.pl));
    let data_pl_pos: IOptionProfitAndLostData[] = [];
    let data_pl_neg: IOptionProfitAndLostData[] = [];

    for (let price = xmin; price <= xmax; price += 0.05) {
      let p1 = this.soldPut.getPLforPrice(price);
      let p2 = this.boughtPut.getPLforPrice(price);
      let p = p2 - p1;
      if (p >= 0) data_pl_pos.push({ price: price, pl: p });
      else data_pl_neg.push({ price: price, pl: p });
    }

    svg
      .append("path")
      .datum(data_pl_pos)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 3)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
    svg
      .append("path")
      .datum(data_pl_neg)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 3)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
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
  ) {
    const interest_rate = 0;
    const dividend_yield = 0;

    let datax: number[] = [];
    let datay1: number[] = [];
    for (let price = xmin; price < xmax; price += 0.2) {
      const o = utils.computeOptionPrice(
        price,
        this.soldPut.getStrike(),
        interest_rate,
        iv,
        dividend_yield,
        numDaysValue,
      );
      let option_data = o[1];
      let option_price = option_data[0];
      let p_and_l: number = 0;
      p_and_l =
        this.getInitialCost() -
        this.getQty() * consts.NUM_SHARES_PER_CONTRACT * option_price;
      datax.push(price);
      datay1.push(p_and_l);
    }
    let data1: IOptionProfitAndLostData[] = [];
    for (let i = 0; i < datax.length; i++) {
      data1.push({ price: datax[i], pl: datay1[i] });
    }

    let datay2: number[] = [];
    for (let price = xmin; price < xmax; price += 0.2) {
      const o = utils.computeOptionPrice(
        price,
        this.boughtPut.getStrike(),
        interest_rate,
        iv,
        dividend_yield,
        numDaysValue,
      );
      let option_data = o[1];
      let option_price = option_data[0];
      let p_and_l: number = 0;
      p_and_l = this.getQty() * consts.NUM_SHARES_PER_CONTRACT * option_price;
      datay2.push(p_and_l);
    }
    let data2: IOptionProfitAndLostData[] = [];
    for (let i = 0; i < datax.length; i++) {
      data2.push({ price: datax[i], pl: datay2[i] });
    }
    let data: IOptionProfitAndLostData[] = [];
    for (let i = 0; i < datax.length; i++) {
      data.push({ price: datax[i], pl: datay1[i] + datay2[i] });
    }
    const line = d3
      .line()
      .x((d: any) => x(d.price))
      .y((d: any) => y(d.pl));

    svg
      .append("path")
      .datum(data)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "orange")
      .attr("stroke-width", 1)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
  }
}

export class Short extends OptionContract {
  constructor(contract: IContractRow[]) {
    super(contract);
    this.type = "Short";
    this.pru = contract[0].pru;
    this.setLegs(0);
  }
  getBreakEvenValue() {
    return this.getPru();
  }
  getMaxLost() {
    return Number.NEGATIVE_INFINITY;
  }
  getMaxProfit() {
    return this.getBreakEvenValue() * -this.getQty();
  }
  getYlimits() {
    let ymin = -100;
    let ymax = 100;
    return [ymin, ymax];
  }
  getPLforPrice(price: number) {
    return this.getQty() * (price - this.getPru());
  }
  drawProfile(
    svg: any,
    x: any,
    y: any,
    yRight: any,
    clipPath: string,
    xmin: number,
    xmax: number,
  ) {
    const line = d3
      .line()
      .x((d: any) => x(d.price))
      .y((d: any) => y(d.pl));
    let data_pl_pos: IOptionProfitAndLostData[] = [];
    let data_pl_neg: IOptionProfitAndLostData[] = [];

    for (let price = xmin; price <= xmax; price += 0.05) {
      let p = this.getPLforPrice(price);
      if (p >= 0) data_pl_pos.push({ price: price, pl: p });
      else data_pl_neg.push({ price: price, pl: p });
    }

    svg
      .append("path")
      .datum(data_pl_pos)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 3)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
    svg
      .append("path")
      .datum(data_pl_neg)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 3)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
  }
}

export class Long extends OptionContract {
  constructor(contract: IContractRow[]) {
    super(contract);
    this.type = "Long";
    this.pru = contract[0].pru;
    this.setLegs(0);
  }
  getBreakEvenValue() {
    return this.getPru();
  }
  getMaxLost() {
    return this.getBreakEvenValue() * this.getQty();
  }
  getMaxProfit() {
    return Number.POSITIVE_INFINITY;
  }
  getYlimits() {
    let ymin = -100;
    let ymax = 100;
    return [ymin, ymax];
  }
  getPLforPrice(price: number) {
    return this.getQty() * (this.getPru() - price);
  }
  drawProfile(
    svg: any,
    x: any,
    y: any,
    yRight: any,
    clipPath: string,
    xmin: number,
    xmax: number,
  ) {
    const line = d3
      .line()
      .x((d: any) => x(d.price))
      .y((d: any) => y(d.pl));
    let data_pl_pos: IOptionProfitAndLostData[] = [];
    let data_pl_neg: IOptionProfitAndLostData[] = [];

    for (let price = xmin; price <= xmax; price += 0.05) {
      let p = this.getPLforPrice(price);
      if (p >= 0) data_pl_pos.push({ price: price, pl: p });
      else data_pl_neg.push({ price: price, pl: p });
    }

    svg
      .append("path")
      .datum(data_pl_pos)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 3)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
    svg
      .append("path")
      .datum(data_pl_neg)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 3)
      .attr("clip-path", "url(#" + clipPath + ")")
      .attr("visibility", "visible")
      .attr("d", line as any);
  }
}
