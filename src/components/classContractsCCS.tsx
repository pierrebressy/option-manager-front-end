import {
  IContractRow,
  IOptionProfitAndLostData,
} from "../interfaces/datatypes";
import * as utils from "../services/utils";
import * as d3 from "d3";
import * as consts from "../services/constants";
import { OptionContract } from "./classContracts";
import { Call } from "./classContractsCall";

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
    this.reverseGaussian = this.getQty() < 0;
    this.setLegs(2);
  }
  displayInfo = () => {
    return (
      <div>
        <p>Strategy stable &#8594; or bearish &#8600;</p>
        <p>
          <u>Contract summary</u>:
        </p>
        <p></p>
        <p>The trader will get the premium.</p>
        <p>
          The strategy consists of <b>selling a call option</b> and{" "}
          <b>buying a call option more OTM</b>.
        </p>
        <p>
          <u>At expiration</u>:
          <p>
            1) if the underlying is below the lower strike: the profit is
            maximum but limited ; we keep the premium &#128516;.
          </p>
          <p>
            2) if the underlying is above the higher strike: the lost is maximum
            but limited.
          </p>
        </p>
        <ul>
          <li>
            PRO:
            <ul>
              <li>Θ {">"} 0 : time with us</li>
              <li>Limited risk</li>
            </ul>
          </li>
          <li>
            CONS:
            <ul>
              <li>Limited profit</li>
            </ul>
          </li>
        </ul>
      </div>
    );
  };
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
  getYlimits() {
    let ymin = this.getMaxLost();
    ymin = ymin * 1.5;
    let ymax = -ymin;
    return [ymin, ymax];
  }

  getOpenTotalPremium() {
    return this.soldCall.getOpenPremium() - this.boughtCall.getOpenPremium();
  }
  getBreakEvenValue() {
    return this.soldCall.getStrike() + this.getOpenTotalPremium();
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
    return this.getInitialCost();
  }
  getInitialCost() {
    return (
      this.getOpenTotalPremium() *
      consts.NUM_SHARES_PER_CONTRACT *
      this.getQty()
    );
  }
  getStrike() {
    return this.soldCall.getStrike();
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
