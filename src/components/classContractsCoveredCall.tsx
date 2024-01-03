import {
  IContractRow,
  IOptionProfitAndLostData,
} from "../interfaces/datatypes";
import * as d3 from "d3";
import * as consts from "../services/constants";
import * as contract from "./classContracts";

export class CoveredCall extends contract.OptionContract {
  
  constructor(contract: IContractRow[]) {
    super(contract);
    this.type = "Covered Call";
    this.reverseGaussian = this.getQty() > 0;
    this.setLegs(1);
  }
  displayInfo = () => {
    return (
      <div>
        {" "}
        <p>
          <u>Contract summary</u>:
        </p>
        <p>
          A covered call is a strategy to generate income if we think that the
          underlying will not rise much further in the near future.
        </p>
        <p>The trader will get the premium.</p>
        <p>
          The strategy consists of <b>selling a call option</b> on an underlying
          that is already owned.
        </p>
        <p>
          <u>At expiration</u>:
          <p>
            1) if the underlying is below the strike: the option expires
            worthless and we keep the premium &#128516;.
          </p>
          <p>
            2) if the underlying is above the strike: the option is exercised
            and we must sell the underlying at the strike price.
          </p>
        </p>
        <ul>
          <li>
            Parameters:
            <ul>
              <li>Strike OTM</li>
              <li>Near expiration date (Θ {">"} 0 : time with us)</li>
            </ul>
          </li>
        </ul>
      </div>
    );
  };

  isITM(currentPriceValue: number) {
    if (this.getQty() < 0) return this.getStrike() > currentPriceValue;
    else return this.getStrike() < currentPriceValue;
  }
  isOTM(currentPriceValue: number) {
    if (this.getQty() < 0) return this.getStrike() < currentPriceValue;
    else return this.getStrike() > currentPriceValue;
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
    return this.getInitialCost();
  }
  getInitialCost() {
    return (
      consts.NUM_SHARES_PER_CONTRACT *
      Math.abs(this.getQty()) *
      (this.getStrike() - this.getBreakEvenValue())
    );
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
