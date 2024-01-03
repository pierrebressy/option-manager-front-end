import {
  IContractRow,
  IOptionProfitAndLostData,
} from "../interfaces/datatypes";
import * as d3 from "d3";
import * as contract from "./classContracts";

export class Long extends contract.OptionContract {
  constructor(contract: IContractRow[]) {
    super(contract);
    this.type = "Long";
    this.pru = contract[0].pru;
    this.setLegs(0);
  }
  displayInfo = () => {
    return (
      <div>
        <p>
          <u>Summary</u>
        </p>
        <p>Strategy bullish &#8599;</p>
        <p>The trader buy the stock at the average buying price.</p>
        <p>
          The idea is to keep the stock to gets the dividends and sell the stock
          when the price is <b>higher</b> than the average buying price.
        </p>
        <ul>
          <li>
            PRO:
            <ul>
              <li>Dividends.</li>
            </ul>
          </li>
          <li>
            CONS:
            <ul>
              <li>Full risk is stock price falls.</li>
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
