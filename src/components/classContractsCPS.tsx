import {
  IContractRow,
  IOptionProfitAndLostData,
} from "../interfaces/datatypes";
import * as utils from "../services/utils";
import * as d3 from "d3";
import * as consts from "../services/constants";
import { OptionContract } from "./classContracts";
import { Put } from "./classContractsPut";

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
    this.reverseGaussian = this.getQty() < 0;
    this.setLegs(2);
  }
  displayInfo = () => {
    return (
      <div>
        <p>Strategy stable &#8594; or bullish &#8599;</p>
        <p>
          <u>Contract summary</u>:
        </p>
        <p></p>
        <p>The trader will get the premium.</p>
        <p>
          The strategy consists of <b>selling a put option</b> and{" "}
          <b>buying a put option more OTM</b>.
        </p>
        <p>
          <u>At expiration</u>:
          <p>
            1) if the underlying is above the higher strike: the profit is
            maximum but limited ; we keep the premium &#128516;.
          </p>
          <p>
            2) if the underlying is below the lower strike: the lost is maximum
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
    return this.getInitialCost();
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
    let v =
      this.getOpenTotalPremium() *
      consts.NUM_SHARES_PER_CONTRACT *
      this.getQty();
    return v;
  }
  getStrike() {
    return this.soldPut.getStrike();
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
