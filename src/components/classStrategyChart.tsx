import * as d3 from "d3";
import * as consts from "../services/constants";
import { v4 as uuidv4 } from "uuid";

export class StrategyChart {
  margin: { top: number; right: number; bottom: number; left: number };
  frame_width: number;
  frame_height: number;
  width: number;
  height: number;
  id: string;
  svg: any;
  x: any;
  y: any;
  yRight: any;
  xAxis: any;
  yAxis: any;
  yAxisRight: any;
  xmin: number = 0;
  xmax: number = 0;
  ymin: number = 0;
  ymax: number = 0;
  clipPath: string;

  constructor(id: string) {
    this.id = id;
    this.margin = consts.STRATEGY_CHART_DEFAULT_MARGIN;
    this.frame_width = consts.STRATEGY_CHART_DEFAULT_SIZE.width;
    this.frame_height = consts.STRATEGY_CHART_DEFAULT_SIZE.height;
    this.width = this.frame_width - this.margin.left - this.margin.right;
    this.height = this.frame_height - this.margin.top - this.margin.bottom;
    this.clipPath = uuidv4();
  }
  drawCurrentPLInfo(currentPriceValue: number = 0.0, contract: any) {
    this.svg
      .append("line")
      .attr("class", "gray-hashed-line")
      .attr("x1", this.x(this.xmin))
      .attr("y1", this.y(contract.getPLforPrice(currentPriceValue)))
      .attr("x2", this.x(currentPriceValue))
      .attr("y2", this.y(contract.getPLforPrice(currentPriceValue)));

    this.svg
      .append("rect")
      .attr(
        "class",
        contract.getPLforPrice(currentPriceValue) > 0
          ? "green-rectangle"
          : contract.getPLforPrice(currentPriceValue) < 0
            ? "red-rectangle"
            : "blue-rectangle",
      )
      .attr("visibility", "visible")
      .attr("x", this.x(this.xmin) - 50)
      .attr("y", this.y(contract.getPLforPrice(currentPriceValue)) - 10)
      .attr("width", 50)
      .attr("height", 20);

    this.svg
      .append("text")
      .attr("class", "white-text")
      .attr("x", this.x(this.xmin) - 25)
      .attr("y", this.y(contract.getPLforPrice(currentPriceValue)) + 4)
      .text(contract.getPLforPrice(currentPriceValue).toFixed(0).toString());

    this.svg
      .append("circle")
      .attr("r", 5)
      .attr("class", "circle-current-price")
      .attr("visibility", "visible")
      .attr("cx", this.x(currentPriceValue))
      .attr("cy", this.y(contract.getPLforPrice(currentPriceValue)));
  }
  drawFullVerticalGrayLine(price: number = 0.0) {
    this.svg
      .append("line")
      .attr("class", "gray-hashed-line")
      .attr("x1", this.x(price))
      .attr("y1", this.yRight(-1))
      .attr("x2", this.x(price))
      .attr("y2", this.yRight(+1));
  }
  drawFullVerticalDarkGrayLine(price: number = 0.0) {
    this.svg
      .append("line")
      .attr("class", "dark-gray-hashed-line")
      .attr("x1", this.x(price))
      .attr("y1", this.yRight(-1))
      .attr("x2", this.x(price))
      .attr("y2", this.yRight(+1));
  }
  drawCircleLeftScale(price: number = 0.0, pl: number = 0.0, cssClass: string) {
    this.svg
      .append("circle")
      .attr("r", 5)
      .attr("class", cssClass)
      .attr("cx", this.x(price))
      .attr("cy", this.y(pl));
  }
  drawCircleRightScale(
    price: number = 0.0,
    pl: number = 0.0,
    cssClass: string,
  ) {
    this.svg
      .append("circle")
      .attr("r", 5)
      .attr("class", cssClass)
      .attr("cx", this.x(price))
      .attr("cy", this.yRight(pl));
  }
  drawText(
    price: number = 0.0,
    pl: number = 0.0,
    cssClass: string,
    text: string,
    yOffset = 30,
  ) {
    this.svg
      .append("text")
      .attr("x", this.x(price))
      .attr("y", this.yRight(pl) + yOffset)
      .attr("class", cssClass)
      .attr("clip-path", "url(#" + this.clipPath + ")")
      .text(text);
  }
  drawCurrentPriceLine(currentPriceValue: number = 0.0) {
    this.svg
      .append("line")
      .attr("stroke", "gray")
      .attr("stroke-width", 0.8)
      .attr("x1", this.x(currentPriceValue))
      .attr("y1", this.yRight(-1))
      .attr("x2", this.x(currentPriceValue))
      .attr("y2", this.yRight(1))
      .style("stroke", "magenta")
      .attr("stroke-dasharray", "8,1");

    this.svg
      .append("text")
      .attr("x", this.x(currentPriceValue) + 5)
      .attr("y", this.yRight(-0.5) + 45)
      .attr(
        "transform",
        "rotate(90," +
          (this.x(currentPriceValue) + 5) +
          "," +
          (this.yRight(-0.5) + 45) +
          ")",
      )
      .attr("class", "strategy_text_magenta")
      .attr("clip-path", "url(#" + this.clipPath + ")")
      .text("CURRENT PRICE");
  }
  drawBreakEventPoint(breakevent: number = 0.0) {
    this.drawCircleLeftScale(breakevent, 0, "cyan-circle");
    this.drawText(breakevent, 0, "cyan-text", "BREAK-EVEN");
  }
  drawVerticalLineAtStrike(contract: any, currentPriceValue: number = 0.0) {
    if (contract.getType() === "Credit Call Spread") {
      this.drawFullVerticalGrayLine(contract.soldCall.getStrike());
      this.drawCircleLeftScale(
        contract.soldCall.getStrike(),
        contract.getMaxProfit(),
        "green-circle",
      );
      this.drawText(contract.soldCall.getStrike(), 0, "green-text", "STRIKE1");

      this.drawFullVerticalGrayLine(contract.boughtCall.getStrike());
      this.drawCircleLeftScale(
        contract.boughtCall.getStrike(),
        contract.getMaxLost(),
        "red-circle",
      );
      this.drawText(contract.boughtCall.getStrike(), 0, "red-text", "STRIKE2");
    } else if (contract.getType() === "Credit Put Spread") {
      this.drawFullVerticalGrayLine(contract.boughtPut.getStrike());
      this.drawCircleLeftScale(
        contract.boughtPut.getStrike(),
        contract.getMaxLost(),
        "red-circle",
      );
      this.drawText(contract.boughtPut.getStrike(), 0, "red-text", "STRIKE1");

      this.drawFullVerticalGrayLine(contract.soldPut.getStrike());
      this.drawCircleLeftScale(
        contract.soldPut.getStrike(),
        contract.getMaxProfit(),
        "green-circle",
      );
      this.drawText(contract.soldPut.getStrike(), 0, "green-text", "STRIKE2");
    } else if (contract.getType() === "Debit Call Spread") {
      this.drawFullVerticalGrayLine(contract.boughtCall.getStrike());
      this.drawCircleLeftScale(
        contract.boughtCall.getStrike(),
        contract.getMaxLost(),
        "red-circle",
      );
      this.drawText(contract.boughtCall.getStrike(), 0, "red-text", "STRIKE1");

      this.drawFullVerticalGrayLine(contract.soldCall.getStrike());
      this.drawCircleLeftScale(
        contract.soldCall.getStrike(),
        contract.getMaxProfit(),
        "green-circle",
      );
      this.drawText(contract.soldCall.getStrike(), 0, "green-text", "STRIKE2");
    } else if (contract.getType() === "Debit Put Spread") {
      this.drawFullVerticalGrayLine(contract.soldPut.getStrike());
      this.drawCircleLeftScale(
        contract.soldPut.getStrike(),
        contract.getMaxProfit(),
        "green-circle",
      );
      this.drawText(contract.soldPut.getStrike(), 0, "green-text", "STRIKE1");

      this.drawFullVerticalGrayLine(contract.boughtPut.getStrike());
      this.drawCircleLeftScale(
        contract.boughtPut.getStrike(),
        contract.getMaxLost(),
        "red-circle",
      );
      this.drawText(contract.boughtPut.getStrike(), 0, "red-text", "STRIKE2");
    } else if (
      contract.getType() === "Long" ||
      contract.getType() === "Short"
    ) {
    } else {
      this.drawFullVerticalGrayLine(contract.getStrike());
      this.drawCircleLeftScale(
        contract.getStrike(),
        contract.getInitialCost(),
        contract.getInitialCost() >= 0 ? "green-circle" : "red-circle",
      );
      this.drawText(contract.getStrike(), 0, "white-text", "STRIKE");
    }

    this.drawCurrentPLInfo(currentPriceValue, contract);
    this.drawBreakEventPoint(contract.getBreakEvenValue());
    this.drawCurrentPriceLine(currentPriceValue);
  }
  drawSigmaLines(
    data_sigma: number[][],
    data_sigma_int: number[][],
    contract: any,
    success_rate: number,
    currentPriceValue: number = 0.0,
    sigma: number = 0.0,
  ) {
    const line_sigma = d3
      .line()
      .x((d) => this.x(d[0]))
      .y((d) => this.yRight(d[1]));

    this.svg
      .append("path")
      .datum(data_sigma)
      .attr("class", "blue-hashed-line")
      .attr("visibility", "visible")
      .attr("clip-path", "url(#" + this.clipPath + ")")
      .attr("d", line_sigma as any);

    this.svg
      .append("path")
      .datum(data_sigma_int)
      .attr("class", "blue-line")
      .attr("clip-path", "url(#" + this.clipPath + ")")
      .attr("d", line_sigma as any);

    this.drawCircleLeftScale(currentPriceValue, 0, "black-circle");

    // success horizontal rate line
    this.svg
      .append("line")
      .attr("stroke", "gray")
      .attr("stroke-width", 0.5)
      .attr("x1", this.x(contract.getStrike()))
      .attr("y1", this.yRight(success_rate))
      .attr("x2", this.x(this.xmax))
      .attr("y2", this.yRight(success_rate))
      .attr("stroke-dasharray", "8,1");
    this.svg
      .append("rect")
      .attr("class", "crosshair_price_rect")
      .attr("visibility", "visible")
      .attr("x", this.x(this.xmax))
      .attr("y", this.yRight(success_rate) - 10)
      .attr("width", 50)
      .attr("height", 20);

    this.svg
      .append("text")
      .attr("class", "crosshair_date_text")
      .attr("x", this.x(this.xmax) + 20)
      .attr("y", this.yRight(success_rate) + 4)
      .text((100 * success_rate).toFixed(0).toString() + "%");

    this.drawCircleRightScale(
      contract.getStrike(),
      success_rate,
      "black-circle",
    );
    //this.drawFullVerticalGrayLine(currentPriceValue);
    for (let k = 1; k < 4; k++) {
      this.drawFullVerticalDarkGrayLine(currentPriceValue + k * sigma);
      this.drawFullVerticalDarkGrayLine(currentPriceValue - k * sigma);
      this.drawText(
        currentPriceValue - k * sigma,
        0,
        "white-text",
        "-" + k.toString() + "σ",
        -15,
      );
      this.drawText(
        currentPriceValue + k * sigma,
        0,
        "white-text",
        "+" + k.toString() + "σ",
        -15,
      );
    }
  }
  drawContractProfile(contract: any) {
    try {
      contract.drawProfile(
        this.svg,
        this.x,
        this.y,
        this.yRight,
        this.clipPath,
        this.xmin,
        this.xmax,
      );
    } catch (e) {
      console.log("drawContractProfile::e=", e);
    }
  }

  displayInitialCostInfo(contract: any, currentPriceValue: number = 0.0) {
    if (contract.getLegs() > 0) {
      this.drawCircleLeftScale(
        this.xmin,
        contract.getInitialCost(),
        "black-circle",
      );

      this.svg
        .append("rect")
        .attr(
          "class",
          contract.getInitialCost() > 0
            ? "crosshair_price_rect_green"
            : "crosshair_price_rect_red",
        )
        .attr("visibility", "visible")
        .attr("x", this.x(this.xmin) - 50)
        .attr("y", this.y(contract.getInitialCost()) - 10)
        .attr("width", 50)
        .attr("height", 20);

      this.svg
        .append("text")
        .attr("class", "crosshair_price_text_white")
        .attr("x", this.x(this.xmin) - 25)
        .attr("y", this.y(contract.getInitialCost()) + 4)
        .text(contract.getInitialCost().toFixed(0).toString());
    } else if (0) {
      let currentPL = 0;

      if (contract.getType() === "Short")
        currentPL =
          -contract.getQty() * (contract.getPru() - currentPriceValue);
      else
        currentPL =
          -contract.getQty() * (currentPriceValue - contract.getPru());
      this.svg
        .append("line")
        .attr("stroke", "gray")
        .attr("stroke-width", 0.5)
        .attr("x1", this.x(this.xmin))
        .attr("y1", this.y(currentPL))
        .attr("x2", this.x(currentPriceValue))
        .attr("y2", this.y(currentPL))
        .attr("stroke-dasharray", "8,1");
      this.svg
        .append("rect")
        .attr(
          "class",
          currentPL > 0
            ? "crosshair_price_rect_green"
            : "crosshair_price_rect_red",
        )
        .attr("visibility", "visible")
        .attr("x", this.x(this.xmin) - 50)
        .attr("y", this.y(currentPL) - 10)
        .attr("width", 50)
        .attr("height", 20);
      this.svg
        .append("text")
        .attr("class", "crosshair_price_text_white")
        .attr("x", this.x(this.xmin) - 25)
        .attr("y", this.y(currentPL) + 4)
        .text(currentPL.toFixed(0).toString());
    }
  }

  prepareChartScales(
    contract: any,
    currentPriceValue: number = 0.0,
    sigma: number = 0.0,
  ) {
    //this.xmin = currentPriceValue - 5 * sigma
    //this.xmax = currentPriceValue + 5 * sigma
    this.xmin = currentPriceValue * (1 - 0.4);
    this.xmax = currentPriceValue * (1 + 0.4);
    let yLimits = [];
    if (contract.getLegs() > 0) {
      yLimits = contract.getYlimits();
    } else {
      yLimits = contract.getYlimits();
      yLimits = [this.xmin - currentPriceValue, this.xmax - currentPriceValue];
    }
    this.ymin = yLimits[0];
    this.ymax = yLimits[1];

    this.x = d3
      .scaleLinear()
      .domain([this.xmin, this.xmax])
      .range([0, this.width]);
    this.y = d3
      .scaleLinear()
      .domain([this.ymin, this.ymax] as [number, number])
      .range([this.height, 0]);

    this.xAxis = d3.axisBottom(this.x);
    this.yAxis = d3.axisLeft(this.y);
    this.yRight = d3
      .scaleLinear()
      .domain([0, +1] as [number, number])
      .range([this.height / 2, 0]);
    this.yAxisRight = d3.axisRight(this.yRight);
  }

  cleanChart() {
    const svg_tmp = d3.select("#" + this.id);
    svg_tmp.selectAll("*").remove();
  }

  setupChart() {
    this.svg = d3
      .select("#" + this.id)
      .append("svg")
      .attr("width", this.frame_width)
      .attr("height", this.frame_height)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    this.svg
      .append("defs")
      .append("svg:clipPath")
      .attr("id", this.clipPath)
      .append("svg:rect")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("x", 0)
      .attr("y", 0);
  }

  addAxis() {
    this.svg
      .append("g")
      .attr("transform", `translate(0,${this.height / 2})`)
      .call(this.xAxis);

    this.svg
      .append("g")
      .attr("id", "yAxis" + this.id)
      .attr("transform", `translate(0,0)`)
      .call(this.yAxis);

    this.svg
      .append("g")
      .attr("id", "yAxisRight" + this.id)
      .attr("transform", `translate(${this.width},0)`)
      .call(this.yAxisRight);

    this.svg
      .append("text")
      .attr("x", 0)
      .attr("y", -10)
      .attr("class", "white-text")
      .text("P/L");
    this.svg
      .append("text")
      .attr("x", this.width)
      .attr("y", -10)
      .attr("class", "white-text")
      .text("% success");
  }

  createChart(
    contract: any,
    sigma: number = 0.0,
    currentPriceValue: number = 0.0,
  ) {
    this.prepareChartScales(contract, currentPriceValue, sigma);
    this.cleanChart();
    this.setupChart();
    this.addAxis();
    this.drawContractProfile(contract);
    this.drawVerticalLineAtStrike(contract, currentPriceValue);
    this.displayInitialCostInfo(contract, currentPriceValue);
  }

  drawProfileForDaysLeft(contract: any, iv: number, numDaysValue: number) {
    contract.drawProfileForDaysLeft(
      this.svg,
      this.x,
      this.y,
      this.clipPath,
      this.xmin,
      this.xmax,
      iv,
      numDaysValue,
    );
  }

  drawPLForDaysLeft(
    contract: any,
    price: number,
    iv: number,
    numDaysValue: number,
  ) {
    let interest_rate = 0.0;
    let dividend_yield = 0.0;
    let p_and_l = contract.getPLforPriceForDaysLeft(
      price,
      interest_rate,
      iv,
      numDaysValue,
      dividend_yield,
    );

    this.svg
      .append("line")
      .attr("stroke", "gray")
      .attr("stroke-width", 0.5)
      .attr("x1", this.x(price))
      .attr("y1", this.y(p_and_l))
      .attr("x2", this.x(this.xmin))
      .attr("y2", this.y(p_and_l))
      .attr("stroke-dasharray", "8,1");
    this.svg
      .append("rect")
      .attr("class", "orange-rectangle")
      .attr("visibility", "visible")
      .attr("x", this.x(this.xmin) - 50)
      .attr("y", this.y(p_and_l) - 10)
      .attr("width", 50)
      .attr("height", 20);
    this.drawCircleLeftScale(price, p_and_l, "orange-circle");

    this.svg
      .append("text")
      .attr("class", "crosshair_date_text")
      .attr("x", this.x(this.xmin) - 30)
      .attr("y", this.y(p_and_l) + 4)
      .text(p_and_l.toFixed(0).toString());
  }

  drawAllSigmaLines(
    contract: any,
    sigma: number = 0.0,
    currentPriceValue: number = 0.0,
  ) {
    const gdata = contract.getGaussianCurveDate(sigma, currentPriceValue);
    const data_sigma = gdata[0];
    const data_sigma_int = gdata[1];
    const success_rate = gdata[2];
    this.drawSigmaLines(
      data_sigma,
      data_sigma_int,
      contract,
      success_rate,
      currentPriceValue,
      sigma,
    );
  }
}
