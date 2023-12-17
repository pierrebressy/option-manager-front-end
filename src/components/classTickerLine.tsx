import * as d3 from "d3";
import { ITickerClosingData, ITickerPriceRow } from "../interfaces/datatypes";

export class TickerLine {
  id: number = 0;
  ticker: string = "";
  lineColor: string = "black";
  visibility: boolean = true;
  tickerPrices: ITickerPriceRow[] = [];
  clipPath: string = "";

  values: number[] = [];
  ratios: number[] = [];
  refValue: number = 0;

  element: any = null;

  constructor(
    id: number,
    ticker: string,
    tickerPrices: ITickerPriceRow[],
    clipPath: string,
  ) {
    this.id = id;
    this.ticker = ticker;
    this.tickerPrices = tickerPrices;
    this.lineColor = this.getLineColorForCurve(id);
    this.clipPath = clipPath;

    for (let index in d3.range(0, this.tickerPrices.length)) {
      this.values.push(+this.tickerPrices[index].close);
      this.ratios.push(0);
    }
  }

  setRefValues(refValues: number) {
    this.refValue = refValues;
  }

  toggleLineVisibility() {
    this.visibility = !this.visibility;
  }

  getMaxValue() {
    return d3.max(this.values);
  }

  getMinValue() {
    return d3.min(this.values);
  }

  getMaxRatio() {
    return d3.max(this.ratios);
  }

  getMinRatio() {
    return d3.min(this.ratios);
  }

  getLineColorForCurve(index: number) {
    const colorList = [
      "red",
      "green",
      "blue",
      "orange",
      "magenta",
      "cyan",
      "black",
    ];
    return colorList[index % colorList.length];
  }

  getLineID() {
    return "closing_path-" + this.id + "-" + this.ticker;
  }

  drawLine(svg: any, line: any, displayMode: string) {
    svg.select("#" + this.getLineID()).remove();

    let dataToDisplay: ITickerClosingData[] =
      this.getdataToDisplay(displayMode);
    let yMin = d3.min(dataToDisplay, (d) => +d.close) as number;
    let yMax = d3.max(dataToDisplay, (d) => +d.close) as number;

    this.element = svg
      .append("path")
      .datum(dataToDisplay)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", this.lineColor)
      .attr("stroke-width", 3)
      .attr("clip-path", "url(#" + this.clipPath + ")")
      .attr("id", this.getLineID())
      .attr("visibility", this.visibility ? "visible" : "hidden")
      .attr("d", line as any);

    return { yMin, yMax };
  }

  createRectangles(svg: any) {
    svg
      .append("rect")
      .attr("id", "rect" + this.id + this.lineColor)
      .attr("x", this.id * 50)
      .attr("y", -25)
      .attr("width", 48)
      .attr("height", 20)
      .attr("fill", this.lineColor)
      .attr("opacity", 0.5);
    svg
      .append("text")
      .attr("id", "text" + this.id + this.lineColor)
      .attr("x", this.id * 50 + 5)
      .attr("y", -25 + 15)
      .attr("fill", "black")
      .text(this.ticker);
  }

  getdataToDisplay(displayMode: string) {
    let dataToDisplay: ITickerClosingData[] = [];
    for (let k in d3.range(0, this.tickerPrices.length)) {
      let tmp: ITickerClosingData = {} as ITickerClosingData;
      tmp.date = new Date(this.tickerPrices[k].date);
      if (displayMode === "price") {
        tmp.close = this.values[k];
      } else {
        this.ratios[k] =
          ((this.values[k] - this.refValue) / this.values[k]) * 100;
        tmp.close = this.ratios[k];
      }
      dataToDisplay.push(tmp);
    }
    return dataToDisplay;
  }
}
