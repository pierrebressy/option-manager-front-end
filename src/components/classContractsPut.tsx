import {
  IContractRow,
  IOptionProfitAndLostData,
} from "../interfaces/datatypes";
import * as utils from "../services/utils";
import * as d3 from "d3";
import * as consts from "../services/constants";
import * as contract from "./classContracts";

export class Put extends contract.OptionContract {
  constructor(contract: IContractRow[]) {
    super(contract);
    this.type = "Put";
    this.reverseGaussian = this.getQty() < 0;
    this.setLegs(1);
  }

  displayShortInfo = () => {
    return (
      <div>
        <div>
          <p>Strategy 1: bullish underlying &#8599;</p>
          <p>
            A short put option is a financial contract that give the seller{" "}
            <b> the obligation </b> to <b>buy</b> a stock at a specified price(
            <b>strike</b>) within a specific period. The contract automatically
            expires at the <b>expiration date</b>.
          </p>
          <p>The trader will get the premium.</p>
          <p>
            <u>At expiration</u>:
            <p>
              1) if the underlying is above the strike: the option expires
              worthless and we keep the premium &#128516;.
            </p>
            <p>
              2) if the underlying is below the strike: the option is exercised
              and we must <b>buy</b> the underlying at the strike price, which
              is higher than the real price &#128543;.
            </p>
          </p>
          <ul>
            <li>
              PRO:
              <ul>
                <li>Θ {">"} 0 : time with us</li>
              </ul>
            </li>
            <li>
              CONS:
              <ul>
                <li>Limited profit</li>
                <li>High risk if the underlying price falls</li>
              </ul>
            </li>
          </ul>
        </div>

        <div>
          <p>Strategy 2: cash-secured put</p>
          <p>
            The trader sells a put option and has enough cash to buy the stock.
            The strike price is ATM to be assigned and get the stock at a lower
            price, thanks to the premium.
          </p>
          <p>The trader will get the premium.</p>
          <p>
            <u>At expiration</u>:
            <p>
              1) if the underlying is above the strike: the option expires
              worthless and we keep the premium &#128516;.
            </p>
            <p>
              2) if the underlying is below the strike: the option is exercised
              and we <b>buy</b> the underlying at the strike price. The average
              buying price is equal to the strike price minus the premium
              &#128516;.
            </p>
          </p>
        </div>
      </div>
    );
  };

  displayLongInfo = () => {
    return (
      <div>
        <p>Strategy bearish &#8600;</p>
        <p>
          A long put option is a financial contract that give the buyer the
          right — but not the obligation — to <b>sell</b> a stock at a specified
          price (<b>strike</b>) within a specific period. The contract
          automatically expires at the <b>expiration date</b>.
        </p>
        <p>The trader must pay the premium.</p>
        <p>
          <u>At expiration</u>:
          <p>
            1) if the underlying is above the strike: the option expires
            worthless and the premium is lost &#128543;.
          </p>
          <p>
            2) if the underlying is below the strike: the option can be
            exercised and we can <b>sell</b> the underlying at the strike price
            which is higher than the real price &#128516;.
          </p>
        </p>
        <ul>
          <li>
            PRO:
            <ul>
              <li>Profit increases as the underlying price falls</li>
              <li>Limited risk</li>
            </ul>
          </li>

          <li>
            CONS:
            <ul>
              <li>Θ {"<"} 0 : time against us</li>
              <li>Quick fall of underlying price</li>
              <li>Need of a high potential of fall for the underlying price</li>
            </ul>
          </li>
        </ul>
      </div>
    );
  };

  displayInfo = () => {
    return (
      <div>
        {" "}
        <p>
          <u>Contract summary</u>
        </p>
        {this.qty > 0 ? this.displayLongInfo() : this.displayShortInfo()}
      </div>
    );
  };

  isITM(currentPriceValue: number) {
    if (this.getQty() < 0) return this.getStrike() < currentPriceValue;
    else return this.getStrike() > currentPriceValue;
  }

  isOTM(currentPriceValue: number) {
    if (this.getQty() < 0) return this.getStrike() > currentPriceValue;
    else return this.getStrike() < currentPriceValue;
  }

  loadDefaultValues() {
    this.strike = 49.0;
    this.openPremium = 1.0;
    this.qty = 1;
  }

  getBreakEvenValue() {
    return this.getStrike() - this.getOpenPremium();
  }

  getMaxLost() {
    return this.getQty() < 0
      ? this.getStrike() * consts.NUM_SHARES_PER_CONTRACT * this.getQty()
      : this.getInitialCost();
  }

  getMaxProfit() {
    return this.getQty() > 0
      ? this.getStrike() * consts.NUM_SHARES_PER_CONTRACT * this.getQty()
      : this.getInitialCost();
  }

  getInitialCost() {
    return (
      -this.getOpenPremium() * consts.NUM_SHARES_PER_CONTRACT * this.getQty()
    );
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

  getPLforPriceForDaysLeft(
    price: number,
    interest_rate: number,
    iv: number,
    numDaysValue: number,
    dividend_yield: number,
  ) {
    let p_and_l: number = 0;

    const data = this.getOptionsData(
      price,
      interest_rate,
      iv,
      numDaysValue,
      dividend_yield,
    );
    p_and_l =
      this.getInitialCost() +
      this.getQty() * consts.NUM_SHARES_PER_CONTRACT * data[0];

    return p_and_l;
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

    for (let days = 30; days >= 0; days -= 1) {
      let option_price = this.getPLforPriceForDaysLeft(50, 0, 0.17, days, 0);
      let option_theta = 100 * this.getTheta(50, 0, 0.17, days, 0);
    }
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
