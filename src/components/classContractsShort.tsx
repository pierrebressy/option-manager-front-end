import {
  IContractRow,
  IOptionProfitAndLostData,
} from "../interfaces/datatypes";
import * as d3 from "d3";
import * as contract from "./classContracts";

export class Short extends contract.OptionContract {
  constructor(contract: IContractRow[]) {
    super(contract);
    this.type = "Short";
    this.pru = contract[0].pru;
    this.setLegs(0);
  }
  displayInfo = () => {
    return (
      <div>
        <p>
          <u>Summary</u>
        </p>
        <p>Strategy bearish &#8600;</p>
        <p>The trader sell the stock at the average buying price.</p>
        <p>
          The idea is to buy the stock when the price is <b>lower</b> than the
          average buying price.
        </p>
        <ul>
          <li>
            PRO:
            <ul>
              <li>No risk due to stock in portfolio.</li>
            </ul>
          </li>
          <li>
            CONS:
            <ul>
              <li>No dividends.</li>
              <li>Margin needed.</li>
            </ul>
          </li>
        </ul>
      </div>
    );
  };
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
