import * as d3 from "d3";
import { v4 as uuidv4 } from "uuid";
import {
  IContractRow,
  ITickerClosingData,
  ITickerPriceRow,
  ITickerCurveDescriptor,
} from "../interfaces/datatypes";
import { I2DPoint, I2DSize } from "../interfaces/datatypes";
import * as utils from "../services/utils";
import { CoveredCall } from "./classContractsCoveredCall";
import { CreditCallSpread } from "./classContractsCCS";
import { Call } from "./classContractsCall";
import { Put } from "./classContractsPut";

import * as graphic from "./graphGraphicElement";
import * as consts from "../services/constants";

export class MyChart {
  margin: { top: number; right: number; bottom: number; left: number };
  width: number;
  height: number;
  xPos: number;
  yPos: number;
  d0: ITickerClosingData;
  limitDataInfDate: Date;
  currentLimitInfDisplayDate: Date;
  maxDate: string;
  currentLimitSupDisplayDate: Date;
  currentxScaleFactor: number;
  open: ITickerClosingData[];
  close: ITickerClosingData[];
  low: ITickerClosingData[];
  high: ITickerClosingData[];
  sma20: ITickerClosingData[];
  sma50: ITickerClosingData[];
  sma200: ITickerClosingData[];
  svg: any;
  x: any;
  y: any;
  xAxis: any;
  yAxis: any;
  titleText: any;
  closePath: any;
  highPath: any;
  sma20Path: any;
  sma50Path: any;
  sma200Path: any;
  displaySma20: boolean;
  displaySma50: boolean;
  displaySma200: boolean;
  drawAsCandle: boolean;

  listeningRect: d3.Selection<SVGRectElement, unknown, HTMLElement, any>;
  circle: any;
  tooltipLineX: any;
  tooltipLineY: any;
  priceRect: any;
  priceText: any;
  dateRect: any;
  dateText: any;

  id: string;
  ticker: string;
  tickerPrices: ITickerPriceRow[];

  dragMouse: boolean;
  memoDateToShift: any;
  memoStartX: number;
  memoStartY: number;

  memoEndX: number;
  memoEndY: number;

  step: number;
  leftTime: number;
  rightTime: number;
  memoDate: string;
  memoYPos: number;

  svgXPos: number;
  svgYPos: number;

  yMinimum: number;
  yMaximum: number;

  listOfCurves: ITickerCurveDescriptor[];

  listOfLinesToUpdate: any[];
  listOfGreenRectanglesToUpdate: any[];
  listOfORangeRectanglesToUpdate: any[];
  listOfRedRectanglesToUpdate: any[];
  listOfVLinesToUpdate: any[];

  ge: graphic.GraphicElement[];
  clipPath: string;

  mouseMode: string;

  constructor(id: string) {
    this.mouseMode = "zoom";
    this.clipPath = "";

    this.ge = [];
    this.id = id;
    this.margin = consts.MARGIN;
    this.width = consts.GRAPH_WIDTH;
    this.height = consts.GRAPH_HEIGHT;
    this.currentxScaleFactor = consts.X_SCALE_FACTOR;
    this.xPos = 0;
    this.yPos = 0;
    this.d0 = {} as ITickerClosingData;
    this.limitDataInfDate = new Date("1970-01-01");
    this.currentLimitInfDisplayDate = new Date("2021-12-01");
    this.maxDate = utils.dateToYYYYYMMDD(new Date());
    this.currentLimitSupDisplayDate = new Date(this.maxDate); // now

    this.ticker = "";
    this.tickerPrices = [];
    this.close = [];
    this.open = [];
    this.close = [];
    this.low = [];
    this.high = [];
    this.sma20 = [];
    this.sma50 = [];
    this.sma200 = [];
    this.displaySma20 = true;
    this.displaySma50 = true;
    this.displaySma200 = true;
    this.drawAsCandle = true;
    this.dragMouse = false;
    this.memoDateToShift = null;
    this.memoStartX = 0;
    this.memoStartY = 0;
    this.memoEndX = 0;
    this.memoEndY = 0;
    this.step = 0;
    this.leftTime = 0;
    this.rightTime = 0;
    this.memoDate = "";
    this.memoYPos = 0;

    this.svgXPos = 0;
    this.svgYPos = 0;

    this.yMinimum = 0;
    this.yMaximum = 300;
    this.listOfLinesToUpdate = [];
    this.listOfGreenRectanglesToUpdate = [];
    this.listOfRedRectanglesToUpdate = [];
    this.listOfORangeRectanglesToUpdate = [];
    this.listOfVLinesToUpdate = [];

    this.listOfCurves = [];

    this.listeningRect = {} as d3.Selection<
      SVGRectElement,
      unknown,
      HTMLElement,
      any
    >;
  }

  createChartnew() {
    const box = document.getElementById(this.id) as HTMLDivElement | null;
    var rect = box?.getBoundingClientRect();

    this.svgXPos = rect?.x as number;
    this.svgYPos = rect?.y as number;

    this.x = d3
      .scaleTime()
      .domain([
        this.currentLimitInfDisplayDate,
        this.currentLimitSupDisplayDate,
      ])
      .range([0, this.width]);
    this.y = d3
      .scaleLinear()
      .domain([0, 100] as [number, number])
      .range([this.height, 0]);
    this.xAxis = d3.axisBottom(this.x);
    this.yAxis = d3.axisRight(this.y).tickFormat((d) => {
      return `${(+d).valueOf().toFixed(2)}`;
    });

    const svg_tmp = d3.select("#" + this.id);
    svg_tmp.selectAll("*").remove();

    this.svg = d3
      .select("#" + this.id)
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    this.svg
      .append("g")
      .attr("transform", `translate(0,${this.height})`)
      .call(this.xAxis);

    this.svg
      .append("g")
      .attr("id", "yAxis" + this.id)
      .attr("transform", `translate(${this.width},0)`)
      .call(this.yAxis);

    this.clipPath = uuidv4();
    this.svg
      .append("defs")
      .append("svg:clipPath")
      .attr("id", this.clipPath)
      .append("svg:rect")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("x", 0)
      .attr("y", 0);

    this.titleText = this.svg
      .append("text")
      .attr("class", "title_text")
      .attr("id", "idTitle")
      .attr("x", this.width / 2)
      .attr("y", -80)
      .text("NO DATA");
  }

  addCurve(
    ticker: string,
    tickerPrices: ITickerPriceRow[],
    drawCandles: boolean = true,
    lineColor: string = "magenta",
  ) {
    const curve: ITickerCurveDescriptor = {
      ticker,
      tickerPrices,
      lineColor: lineColor,
      visibility: "visible",
      value: [],
      ratio: [],
      element: null,
    };
    this.listOfCurves.push(curve);

    const preparedData = utils.prepareData(
      curve.tickerPrices,
      this.limitDataInfDate,
    );
    this.close = preparedData.close;

    this.x = d3
      .scaleTime()
      .domain([
        this.currentLimitInfDisplayDate,
        this.currentLimitSupDisplayDate,
      ])
      .range([0, this.width]);
    this.y = d3
      .scaleLinear()
      .domain([0, d3.max(this.close, (d) => +d.close * 1.15)] as [
        number,
        number,
      ])
      .range([this.height, 0]);
    this.xAxis = d3.axisBottom(this.x);
    this.yAxis = d3.axisRight(this.y).tickFormat((d) => {
      return `${(+d).valueOf().toFixed(2)}`;
    });

    const line = d3
      .line<ITickerClosingData>()
      .x((d) => this.x(d.date as Date))
      .y((d) => this.y(+d.close));

    const closing_path = this.svg
      .append("path")
      .datum(this.close)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", curve.lineColor)
      .attr("stroke-width", 3)
      .attr("clip-path", "url(#" + this.clipPath + ")")
      .attr("d", line as any);

    this.listOfLinesToUpdate.push(closing_path);

    let yAxis = d3.axisRight(this.y).tickFormat((d) => {
      return `${(+d).valueOf().toFixed(2)}`;
    });
    this.svg.select("#yAxis" + this.id).remove();
    this.svg
      .append("g")
      .attr("id", "yAxis" + this.id)
      .attr("transform", `translate(${this.width},0)`)
      .call(yAxis);
    this.updateGraphicElements();
    this.updateScaleDomain();
  }

  addArea(
    position: I2DPoint,
    areaSize: I2DSize,
    color: string,
    opacity: number,
  ) {
    return this.svg
      .append("rect")
      .attr("class", "colored-rect")
      .attr("visibility", "visible")
      .attr("x", position.x)
      .attr("y", position.y)
      .attr("width", areaSize.width)
      .attr("height", areaSize.height)
      .attr("fill", color)
      .attr("opacity", opacity);
  }

  addCrosshair() {
    const circle = this.svg
      .append("circle")
      .attr("r", 4)
      .attr("fill", "black")
      .style("stroke", "white")
      .attr("opacity", 0.7)
      .attr("visibility", "hidden")
      .style("pointer-events", "none")
      .attr("cx", 50)
      .attr("cy", 50);

    this.svg.select("tooltip-line-x").remove();
    const tooltipLineX = this.svg
      .append("line")
      .attr("class", "tooltip-line")
      .attr("id", "tooltip-line-x")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");

    this.svg.select("tooltip-line-y").remove();
    const tooltipLineY = this.svg
      .append("line")
      .attr("class", "tooltip-line")
      .attr("id", "tooltip-line-y")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");

    const priceRect = this.svg
      .append("rect")
      .attr("class", "crosshair_price_rect")
      .attr("visibility", "hidden");

    const dateRect = this.svg
      .append("rect")
      .attr("class", "crosshair_date_rect")
      .attr("visibility", "hidden");

    const priceText = this.svg
      .append("text")
      .attr("class", "crosshair_price_text")
      .attr("x", 100)
      .attr("y", 100)
      .text("");

    const dateText = this.svg
      .append("text")
      .attr("class", "crosshair_date_text")
      .attr("x", -1000)
      .attr("y", 100)
      .text("");

    return {
      circle,
      tooltipLineX,
      tooltipLineY,
      priceRect,
      priceText,
      dateRect,
      dateText,
    };
  }

  setXDomain(dateMin: Date, dateMax: Date) {
    this.x.domain([dateMin, dateMax]);
  }

  isContractOpen(contract: IContractRow) {
    return contract.closedBy.length === 0;
  }

  displayContractInfo(contract: IContractRow) {
    let openingIndex = -1;
    let closingIndex = -1;

    // compute index of closing price at contract opening
    openingIndex = utils.findIndexByDate(
      new Date(contract.openedBy),
      this.close,
    );
    if (openingIndex === -1) {
      console.log(
        ">> drawChart::cannot find closing price at contract opening",
      );
      return;
    }

    if (contract.closedBy !== "") {
      // compute index of closing price at contract opening
      closingIndex = utils.findIndexByDate(
        new Date(contract.closedBy),
        this.close,
      );
      if (closingIndex === -1) {
        console.log(
          ">> drawChart::cannot find closing price at contract closing",
        );
        return;
      }
      console.log(">> drawChart::closingIndex=", closingIndex);
    }

    if (this.isContractOpen(contract)) {
      this.addArea(
        { x: -10, y: -60 } as I2DPoint,
        { width: 250, height: 190 } as I2DSize,
        "lightgray",
        0.9,
      );
      const priceValueOpen = +this.close[openingIndex].close;
      const textPriceAtOpen = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", -40);
      textPriceAtOpen.text(`Price at open: ${priceValueOpen.toFixed(2)}$`);

      const margeValueOpen =
        100 - (100 * +contract.strike) / +this.close[openingIndex].close;
      const textMargeAtOpen = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", -20);
      textMargeAtOpen.text(`Marge at open: ${margeValueOpen.toFixed(0)}%`);

      const priceCurrentValue = +this.close[this.close.length - 1].close;
      const textCurrentPrice = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", 0);
      textCurrentPrice.text(`Current price: ${priceCurrentValue.toFixed(2)}$`);

      const margeCurrentValue =
        100 -
        (100 * +contract.strike) / +this.close[this.close.length - 1].close;
      const textMargeCurrentValue = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", 20);
      textMargeCurrentValue.text(
        `Current marge: ${margeCurrentValue.toFixed(0)}%`,
      );

      const openPremiumValue = +contract.openPremium;
      const textOpenPremiumValue = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", 40);
      textOpenPremiumValue.text(
        `Open premium :  ${openPremiumValue.toFixed(2)}$`,
      );
      if (contract.type === "Long Put" || contract.type === "Long Call") {
        textOpenPremiumValue.text(
          `Open premium :  ${-openPremiumValue.toFixed(2)}$`,
        );
        textOpenPremiumValue.attr("class", "title_marge_red");
      } else {
        textOpenPremiumValue.text(
          `Open premium :  +${openPremiumValue.toFixed(2)}$`,
        );
        textOpenPremiumValue.attr("class", "title_marge_green");
      }

      const lastPremiumValue = +contract.closePremium;
      const textLastPremiumValue = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", 60);
      textLastPremiumValue.text(
        `Close premium: ${lastPremiumValue.toFixed(2)}$`,
      );
      if (contract.type === "Long Put" || contract.type === "Long Call") {
        textLastPremiumValue.text(
          `Open premium :  ${lastPremiumValue.toFixed(2)}$`,
        );
        textLastPremiumValue.attr("class", "title_marge_green");
      } else {
        textLastPremiumValue.text(
          `Open premium :  ${lastPremiumValue.toFixed(2)}$`,
        );
        textLastPremiumValue.attr("class", "title_marge_red");
      }

      const daysLefValue =
        (new Date(contract.expiration).getTime() - new Date().getTime()) /
        84600000;
      const textDaysLeftValue = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", 100);
      textDaysLeftValue.text(`Days left: ${daysLefValue.toFixed(0)}`);
    } else {
      this.addArea(
        { x: -10, y: -60 } as I2DPoint,
        { width: 250, height: 190 } as I2DSize,
        "lightgray",
        0.9,
      );
      const priceValueOpen = +this.close[openingIndex].close;
      const textPriceAtOpen = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", -40);
      textPriceAtOpen.text(`Price at open: ${priceValueOpen.toFixed(2)}$`);

      const margeValueOpen =
        100 - (100 * +contract.strike) / +this.close[openingIndex].close;
      const textMargeAtOpen = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", -20);
      textMargeAtOpen.text(`Marge at open: ${margeValueOpen.toFixed(0)}%`);

      const priceCurrentValue = +this.close[this.close.length - 1].close;
      const textCurrentPrice = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", 0);
      textCurrentPrice.text(`Current price: ${priceCurrentValue.toFixed(2)}$`);

      const margeCurrentValue =
        100 -
        (100 * +contract.strike) / +this.close[this.close.length - 1].close;
      const textMargeCurrentValue = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", 20);
      textMargeCurrentValue.text(
        `Current marge: ${margeCurrentValue.toFixed(0)}%`,
      );

      const openPremiumValue = +contract.openPremium;
      const textOpenPremiumValue = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", 40);
      textOpenPremiumValue.text(
        `Open premium :  ${openPremiumValue.toFixed(2)}$`,
      );
      if (contract.type === "Long Put" || contract.type === "Long Call") {
        textOpenPremiumValue.text(
          `Open premium :  ${-openPremiumValue.toFixed(2)}$`,
        );
        textOpenPremiumValue.attr("class", "title_marge_red");
      } else {
        textOpenPremiumValue.text(
          `Open premium :  +${openPremiumValue.toFixed(2)}$`,
        );
        textOpenPremiumValue.attr("class", "title_marge_green");
      }

      const lastPremiumValue = +contract.closePremium;
      const textLastPremiumValue = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", 60);
      if (lastPremiumValue === 0) {
        textLastPremiumValue.text(
          `Close premium: ${lastPremiumValue.toFixed(2)}$`,
        );
      } else {
        if (contract.type === "Covered Call") {
          textLastPremiumValue.text(
            `Close premium: -${lastPremiumValue.toFixed(2)}$`,
          );
          textLastPremiumValue.attr("class", "title_marge_red");
        }
        if (contract.type === "Long Call" || contract.type === "Long Put") {
          textLastPremiumValue.text(
            `Close premium: +${lastPremiumValue.toFixed(2)}$`,
          );
          textLastPremiumValue.attr("class", "title_marge_green");
        }
        if (contract.type === "Short Put" || contract.type === "Short Call") {
          textLastPremiumValue.text(
            `Close premium: -${lastPremiumValue.toFixed(2)}$`,
          );
          textLastPremiumValue.attr("class", "title_marge_red");
        }
      }

      const balance = +contract.openPremium - +contract.closePremium;
      const pl = balance * -100 * +contract.qty;
      const textBalance = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", 100);
      if (balance === 0) {
        textBalance.text(`Balance: ${balance.toFixed(2)}$`);
      } else {
        if (balance > 0) {
          if (contract.type === "Long Put" || contract.type === "Long Call") {
            textBalance.text(
              `Balance: ${-balance.toFixed(2)}$ (${pl.toFixed(2)})`,
            );
            textBalance.attr("class", "title_marge_red");
          } else {
            textBalance.text(
              `Balance: +${balance.toFixed(2)}$ (${pl.toFixed(2)})`,
            );
            textBalance.attr("class", "title_marge_green");
          }
        } else {
          if (contract.type === "Long Put" || contract.type === "Long Call") {
            textBalance.text(
              `Balance: +${-balance.toFixed(2)}$ (${pl.toFixed(2)})`,
            );
            textBalance.attr("class", "title_marge_green");
          } else {
            textBalance.text(
              `Balance: ${balance.toFixed(2)}$ (${pl.toFixed(2)})`,
            );
            textBalance.attr("class", "title_marge_red");
          }
        }
      }
    }
  }

  displayContractsInfo(contracts: IContractRow[]) {
    let openingIndex = -1;
    let closingIndex = -1;

    let contract = contracts[0];

    // compute index of closing price at contract opening
    openingIndex = utils.findIndexByDate(
      new Date(contract.openedBy),
      this.close,
    );
    if (openingIndex === -1) {
      console.log(
        ">> drawChart::cannot find closing price at contract opening",
      );
      return;
    }
    console.log(">> drawChart::openingIndex=", openingIndex);

    if (contract.closedBy !== "") {
      // compute index of closing price at contract opening
      closingIndex = utils.findIndexByDate(
        new Date(contract.closedBy),
        this.close,
      );
      if (closingIndex === -1) {
        console.log(
          ">> drawChart::cannot find closing price at contract closing",
        );
        return;
      }
      console.log(">> drawChart::closingIndex=", closingIndex);
    }

    if (this.isContractOpen(contract)) {
      this.addArea(
        { x: -10, y: -60 } as I2DPoint,
        { width: 250, height: 190 } as I2DSize,
        "lightgray",
        0.9,
      );
      const priceValueOpen = +this.close[openingIndex].close;
      const textPriceAtOpen = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", -40);
      textPriceAtOpen.text(`Price at open: ${priceValueOpen.toFixed(2)}$`);

      const margeValueOpen =
        100 - (100 * +contract.strike) / +this.close[openingIndex].close;
      const textMargeAtOpen = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", -20);
      textMargeAtOpen.text(`Marge at open: ${margeValueOpen.toFixed(0)}%`);

      const priceCurrentValue = +this.close[this.close.length - 1].close;
      const textCurrentPrice = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", 0);
      textCurrentPrice.text(`Current price: ${priceCurrentValue.toFixed(2)}$`);

      const margeCurrentValue =
        100 -
        (100 * +contract.strike) / +this.close[this.close.length - 1].close;
      const textMargeCurrentValue = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", 20);
      textMargeCurrentValue.text(
        `Current marge: ${margeCurrentValue.toFixed(0)}%`,
      );

      const openPremiumValue =
        +contracts[0].openPremium - +contracts[1].openPremium;
      const textOpenPremiumValue = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", 40);
      textOpenPremiumValue.text(
        `Open premium :  ${openPremiumValue.toFixed(2)}$`,
      );
      textOpenPremiumValue.attr("class", "title_marge_green");

      const lastPremiumValue =
        +contracts[0].closePremium - +contracts[1].closePremium;
      const textLastPremiumValue = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", 60);
      textLastPremiumValue.text(
        `Close premium: ${lastPremiumValue.toFixed(2)}$`,
      );
      textLastPremiumValue.attr("class", "title_marge_red");

      const daysLefValue =
        (new Date(contract.expiration).getTime() - new Date().getTime()) /
        84600000;
      const textDaysLeftValue = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", 100);
      textDaysLeftValue.text(`Days left: ${daysLefValue.toFixed(0)}`);
    } else {
      this.addArea(
        { x: -10, y: -60 } as I2DPoint,
        { width: 250, height: 190 } as I2DSize,
        "lightgray",
        0.9,
      );
      const priceValueOpen = +this.close[openingIndex].close;
      const textPriceAtOpen = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", -40);
      textPriceAtOpen.text(`Price at open: ${priceValueOpen.toFixed(2)}$`);

      const margeValueOpen =
        100 - (100 * +contract.strike) / +this.close[openingIndex].close;
      const textMargeAtOpen = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", -20);
      textMargeAtOpen.text(`Marge at open: ${margeValueOpen.toFixed(0)}%`);

      const priceCurrentValue = +this.close[this.close.length - 1].close;
      const textCurrentPrice = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", 0);
      textCurrentPrice.text(`Current price: ${priceCurrentValue.toFixed(2)}$`);

      const margeCurrentValue =
        100 -
        (100 * +contract.strike) / +this.close[this.close.length - 1].close;
      const textMargeCurrentValue = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", 20);
      textMargeCurrentValue.text(
        `Current marge: ${margeCurrentValue.toFixed(0)}%`,
      );

      const openPremiumValue = +contract.openPremium;
      const textOpenPremiumValue = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", 40);
      textOpenPremiumValue.text(
        `Open premium :  ${openPremiumValue.toFixed(2)}$`,
      );
      if (contract.type === "Long Put" || contract.type === "Long Call") {
        textOpenPremiumValue.text(
          `Open premium :  ${-openPremiumValue.toFixed(2)}$`,
        );
        textOpenPremiumValue.attr("class", "title_marge_red");
      } else {
        textOpenPremiumValue.text(
          `Open premium :  +${openPremiumValue.toFixed(2)}$`,
        );
        textOpenPremiumValue.attr("class", "title_marge_green");
      }

      const lastPremiumValue = +contract.closePremium;
      const textLastPremiumValue = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", 60);
      if (lastPremiumValue === 0) {
        textLastPremiumValue.text(
          `Close premium: ${lastPremiumValue.toFixed(2)}$`,
        );
      } else {
        if (contract.type === "Covered Call") {
          textLastPremiumValue.text(
            `Close premium: -${lastPremiumValue.toFixed(2)}$`,
          );
          textLastPremiumValue.attr("class", "title_marge_red");
        }
        if (contract.type === "Long Call" || contract.type === "Long Put") {
          textLastPremiumValue.text(
            `Close premium: +${lastPremiumValue.toFixed(2)}$`,
          );
          textLastPremiumValue.attr("class", "title_marge_green");
        }
        if (contract.type === "Short Put" || contract.type === "Short Call") {
          textLastPremiumValue.text(
            `Close premium: -${lastPremiumValue.toFixed(2)}$`,
          );
          textLastPremiumValue.attr("class", "title_marge_red");
        }
      }

      const balance = +contract.openPremium - +contract.closePremium;
      const pl = -balance * consts.NUM_SHARES_PER_CONTRACT * +contract.qty;
      const textBalance = this.svg
        .append("text")
        .attr("class", "title_marge")
        .attr("x", 0)
        .attr("y", 100);
      if (balance === 0) {
        textBalance.text(`Balance: ${balance.toFixed(2)}$`);
      } else {
        if (balance > 0) {
          if (contract.type === "Long Put" || contract.type === "Long Call") {
            textBalance.text(
              `Balance: ${-balance.toFixed(2)}$ (${pl.toFixed(2)})`,
            );
            textBalance.attr("class", "title_marge_red");
          } else {
            textBalance.text(
              `Balance: +${balance.toFixed(2)}$ (${pl.toFixed(2)})`,
            );
            textBalance.attr("class", "title_marge_green");
          }
        } else {
          if (contract.type === "Long Put" || contract.type === "Long Call") {
            textBalance.text(
              `Balance: +${-balance.toFixed(2)}$ (${pl.toFixed(2)})`,
            );
            textBalance.attr("class", "title_marge_green");
          } else {
            textBalance.text(
              `Balance: ${balance.toFixed(2)}$ (${pl.toFixed(2)})`,
            );
            textBalance.attr("class", "title_marge_red");
          }
        }
      }
    }
  }

  drawCoveredCall(c: CoveredCall) {
    this.ge.push(
      new graphic.GraphicElementVLine(this.svg, this.x, this.y, [
        c.getOpenBy(),
        this.height,
      ]),
    );

    this.ge.push(
      new graphic.GraphicElementVLine(this.svg, this.x, this.y, [
        c.getCloseBy(),
        this.height,
      ]),
    );

    this.ge.push(
      new graphic.GraphicElementVLine(this.svg, this.x, this.y, [
        c.getExpiration(),
        this.height,
      ]),
    );

    this.ge.push(
      new graphic.GraphicElementRectangle(this.svg, this.x, this.y, [
        c.getOpenBy(), // 0:x1
        this.yMaximum, // 1:y1
        c.getContractEndDate(), // 2:x2
        c.getStrike(),
        this.yMaximum, // 3:y2
        "red",
        0.3,
      ]),
    );

    this.ge.push(
      new graphic.GraphicElementRectangle(this.svg, this.x, this.y, [
        c.getOpenBy(), // 0:x1
        c.getStrike(),
        c.getContractEndDate(), // 2:x2
        this.yMinimum,
        c.getStrike(),
        "green",
        0.3,
      ]),
    );

    //this.displayContractInfo(contract);
    this.setXDomain(this.currentLimitInfDisplayDate, c.getExpiration());
  }

  drawLongPut(c: Put) {
    this.ge.push(
      new graphic.GraphicElementVLine(this.svg, this.x, this.y, [
        c.getOpenBy(),
        this.height,
      ]),
    );

    this.ge.push(
      new graphic.GraphicElementVLine(this.svg, this.x, this.y, [
        c.getCloseBy(),
        this.height,
      ]),
    );

    this.ge.push(
      new graphic.GraphicElementVLine(this.svg, this.x, this.y, [
        c.getExpiration(),
        this.height,
      ]),
    );

    this.ge.push(
      new graphic.GraphicElementRectangle(this.svg, this.x, this.y, [
        c.getOpenBy(), // 0:x1
        this.yMaximum, // 1:y1
        c.getContractEndDate(), // 2:x2
        c.getStrike(),
        this.yMaximum, // 3:y2
        "red",
        0.3,
      ]),
    );

    this.ge.push(
      new graphic.GraphicElementRectangle(this.svg, this.x, this.y, [
        c.getOpenBy(), // 0:x1
        c.getStrike(),
        c.getContractEndDate(), // 2:x2
        this.yMinimum,
        c.getStrike(),
        "lightgreen",
        0.4,
      ]),
    );

    //this.displayContractInfo(contract);
    this.setXDomain(this.currentLimitInfDisplayDate, c.getExpiration());
  }

  drawShortPut(c: Put) {
    let PL = c.getPLforPrice(this.close[this.close.length - 1].close);
    console.log("=> Price=", this.close[this.close.length - 1].close);
    console.log("=> PL=", PL);
    this.ge.push(
      new graphic.GraphicElementVLine(this.svg, this.x, this.y, [
        c.getOpenBy(),
        this.height,
      ]),
    );

    this.ge.push(
      new graphic.GraphicElementVLine(this.svg, this.x, this.y, [
        c.getCloseBy(),
        this.height,
      ]),
    );

    this.ge.push(
      new graphic.GraphicElementVLine(this.svg, this.x, this.y, [
        c.getExpiration(),
        this.height,
      ]),
    );

    this.ge.push(
      new graphic.GraphicElementRectangle(this.svg, this.x, this.y, [
        c.getOpenBy(), // 0:x1
        this.yMaximum, // 1:y1
        c.getContractEndDate(), // 2:x2
        c.getStrike(),
        this.yMaximum, // 3:y2
        "lightgreen",
        0.4,
      ]),
    );

    this.ge.push(
      new graphic.GraphicElementRectangle(this.svg, this.x, this.y, [
        c.getOpenBy(), // 0:x1
        c.getStrike(),
        c.getContractEndDate(), // 2:x2
        this.yMinimum,
        c.getStrike(),
        "red",
        0.3,
      ]),
    );

    //this.displayContractInfo(contract);
    this.setXDomain(this.currentLimitInfDisplayDate, c.getExpiration());
  }

  drawLongCall(c: Call) {
    this.ge.push(
      new graphic.GraphicElementVLine(this.svg, this.x, this.y, [
        c.getOpenBy(),
        this.height,
      ]),
    );

    this.ge.push(
      new graphic.GraphicElementVLine(this.svg, this.x, this.y, [
        c.getCloseBy(),
        this.height,
      ]),
    );

    this.ge.push(
      new graphic.GraphicElementVLine(this.svg, this.x, this.y, [
        c.getExpiration(),
        this.height,
      ]),
    );

    this.ge.push(
      new graphic.GraphicElementRectangle(this.svg, this.x, this.y, [
        c.getOpenBy(), // 0:x1
        this.yMaximum, // 1:y1
        c.getContractEndDate(), // 2:x2
        c.getStrike(),
        this.yMaximum, // 3:y2
        "lightgreen",
        0.4,
      ]),
    );

    this.ge.push(
      new graphic.GraphicElementRectangle(this.svg, this.x, this.y, [
        c.getOpenBy(), // 0:x1
        c.getStrike(),
        c.getContractEndDate(), // 2:x2
        this.yMinimum,
        c.getStrike(),
        "red",
        0.3,
      ]),
    );

    //this.displayContractInfo(contract);
    this.setXDomain(this.currentLimitInfDisplayDate, c.getExpiration());
  }

  drawCCS(c: CreditCallSpread) {
    this.ge.push(
      new graphic.GraphicElementVLine(this.svg, this.x, this.y, [
        c.getOpenBy(),
        this.height,
      ]),
    );

    this.ge.push(
      new graphic.GraphicElementVLine(this.svg, this.x, this.y, [
        c.getCloseBy(),
        this.height,
      ]),
    );

    this.ge.push(
      new graphic.GraphicElementVLine(this.svg, this.x, this.y, [
        c.getExpiration(),
        this.height,
      ]),
    );

    this.ge.push(
      new graphic.GraphicElementRectangle(this.svg, this.x, this.y, [
        c.getOpenBy(), // 0:x1
        this.yMaximum, // 1:y1
        c.getContractEndDate(), // 2:x2
        Math.max(c.soldCall.getStrike(), c.boughtCall.getStrike()),
        this.yMaximum, // 3:y2
        "red",
        0.3,
      ]),
    );

    this.ge.push(
      new graphic.GraphicElementRectangle(this.svg, this.x, this.y, [
        c.getOpenBy(), // 0:x1
        Math.max(c.soldCall.getStrike(), c.boughtCall.getStrike()),
        c.getContractEndDate(), // 2:x2
        Math.min(c.soldCall.getStrike(), c.boughtCall.getStrike()),
        Math.max(c.soldCall.getStrike(), c.boughtCall.getStrike()),
        "orange",
        0.4,
      ]),
    );

    this.ge.push(
      new graphic.GraphicElementRectangle(this.svg, this.x, this.y, [
        c.getOpenBy(), // 0:x1
        Math.min(c.soldCall.getStrike(), c.boughtCall.getStrike()),
        c.getContractEndDate(), // 2:x2
        this.yMinimum,
        Math.min(c.soldCall.getStrike(), c.boughtCall.getStrike()),
        "lightgreen",
        0.4,
      ]),
    );

    //this.displayContractsInfo(contracts);

    this.setXDomain(this.currentLimitInfDisplayDate, c.getExpiration());
  }

  addContractsToDisplay(contracts: IContractRow[]) {
    let title: string = "No title";

    if (contracts && contracts[0].type === "Covered Call") {
      let c = new CoveredCall([contracts[0]] as IContractRow[]);
      title = c.getTitle();
      this.drawCoveredCall(c);
      this.currentLimitSupDisplayDate = c.getExpiration();
    } else if (contracts && contracts[0].type === "Long Put") {
      let c = new Put([contracts[0]] as IContractRow[]);
      title = c.getTitle();
      this.drawLongPut(c);
      this.currentLimitSupDisplayDate = c.getExpiration();
    } else if (contracts && contracts[0].type === "Short Put") {
      let c = new Put([contracts[0]] as IContractRow[]);
      title = c.getTitle();
      this.drawShortPut(c);
      this.currentLimitSupDisplayDate = c.getExpiration();
    } else if (contracts && contracts[0].type === "Long Call") {
      let c = new Call([contracts[0]] as IContractRow[]);
      title = c.getTitle();
      this.drawLongCall(c);
      this.currentLimitSupDisplayDate = c.getExpiration();
    } else if (contracts && contracts[0].type === "Credit Call Spread") {
      let c = new CreditCallSpread(contracts);
      title = c.getTitle();
      this.drawCCS(c);
      this.currentLimitSupDisplayDate = c.getExpiration();
    }

    this.titleText.text(title);
    this.updateScaleDomain();
  }

  createChart() {
    let x = d3
      .scaleTime()
      .domain([
        this.currentLimitInfDisplayDate,
        this.currentLimitSupDisplayDate,
      ])
      .range([0, this.width]);
    let y = d3
      .scaleLinear()
      .domain([0, d3.max(this.close, (d) => +d.close * 1.15)] as [
        number,
        number,
      ])
      .range([this.height, 0]);
    let xAxis = d3.axisBottom(x);
    let yAxis = d3.axisRight(y).tickFormat((d) => {
      return `${(+d).valueOf().toFixed(2)}`;
    });

    const svg_tmp = d3.select("#" + this.id);
    svg_tmp.selectAll("*").remove();

    let svg = d3
      .select("#" + this.id)
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    svg
      .append("g")
      .attr("transform", `translate(0,${this.height})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("id", "yAxis" + this.id)
      .attr("transform", `translate(${this.width},0)`)
      .call(yAxis);

    this.clipPath = uuidv4();
    svg
      .append("defs")
      .append("svg:clipPath")
      .attr("id", this.clipPath)
      .append("svg:rect")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("x", 0)
      .attr("y", 0);

    let titleText = svg
      .append("text")
      .attr("class", "title_text")
      .attr("id", "idTitle")
      .attr("x", this.width / 2)
      .attr("y", -80);

    return { svg, x, y, xAxis, yAxis, titleText };
  }

  drawClosingAndSma() {
    const line = d3
      .line<ITickerClosingData>()
      .x((d) => this.x(d.date as Date))
      .y((d) => this.y(+d.close));

    const closing_path = this.svg
      .append("path")
      .datum(this.close)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 3)
      .attr("clip-path", "url(#" + this.clipPath + ")")
      .attr("d", line as any);

    const sma20_path = this.svg
      .append("path")
      .datum(this.sma20)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", 2)
      .attr("d", line as any)
      .attr("clip-path", "url(#" + this.clipPath + ")")
      .attr("stroke-dasharray", "2,2");

    const sma50_path = this.svg
      .append("path")
      .datum(this.sma50)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 2)
      .attr("d", line as any)
      .attr("clip-path", "url(#" + this.clipPath + ")")
      .attr("stroke-dasharray", "2,2");

    const sma200_path = this.svg
      .append("path")
      .datum(this.sma200)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("d", line as any)
      .attr("clip-path", "url(#" + this.clipPath + ")")
      .attr("stroke-dasharray", "2,2");

    return { closing_path, sma20_path, sma50_path, sma200_path };
  }

  drawSma() {
    const line = d3
      .line<ITickerClosingData>()
      .x((d) => this.x(d.date as Date))
      .y((d) => this.y(+d.close));

    const sma20_path = this.svg
      .append("path")
      .datum(this.sma20)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", 1)
      .attr("d", line as any)
      .attr("clip-path", "url(#" + this.clipPath + ")")
      .attr("stroke-dasharray", "2,2");

    const sma50_path = this.svg
      .append("path")
      .datum(this.sma50)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "green")
      .attr("stroke-width", 1)
      .attr("d", line as any)
      .attr("clip-path", "url(#" + this.clipPath + ")")
      .attr("stroke-dasharray", "2,2");

    const sma200_path = this.svg
      .append("path")
      .datum(this.sma200)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 1)
      .attr("d", line as any)
      .attr("clip-path", "url(#" + this.clipPath + ")")
      .attr("stroke-dasharray", "2,2");

    return { sma20_path, sma50_path, sma200_path };
  }

  drawCandles() {
    for (let index = 0; index < this.close.length - 1; index++) {
      this.ge.push(
        new graphic.GraphicElementCandleWhiteLine(this.svg, this.x, this.y, [
          this.close[index].date,
          +this.high[index].close,
          this.close[index].date,
          +this.low[index].close,
        ]),
      );

      if (+this.open[index].close < +this.close[index].close) {
        this.ge.push(
          new graphic.GraphicElementCandleGreenLine(this.svg, this.x, this.y, [
            this.close[index].date,
            +this.open[index].close,
            this.close[index].date,
            +this.close[index].close,
          ]),
        );
      } else {
        this.ge.push(
          new graphic.GraphicElementCandleRedLine(this.svg, this.x, this.y, [
            this.close[index].date,
            +this.open[index].close,
            this.close[index].date,
            +this.close[index].close,
          ]),
        );
      }
    }
    return;
  }

  draw(
    ticker: string,
    tickerPrices: ITickerPriceRow[],
    drawCandles: boolean = true,
  ) {
    const box = document.getElementById(this.id) as HTMLDivElement | null;
    var rect = box?.getBoundingClientRect();

    this.svgXPos = rect?.x as number;
    this.svgYPos = rect?.y as number;

    this.ticker = ticker;
    this.tickerPrices = tickerPrices;
    const preparedData = utils.prepareData(tickerPrices, this.limitDataInfDate);
    this.close = preparedData.close;
    this.open = preparedData.open;
    this.close = preparedData.close;
    this.low = preparedData.low;
    this.high = preparedData.high;
    this.sma20 = preparedData.sma20;
    this.sma50 = preparedData.sma50;
    this.sma200 = preparedData.sma200;

    const chartObjects = this.createChart();
    this.svg = chartObjects.svg;
    this.x = chartObjects.x;
    this.y = chartObjects.y;
    this.xAxis = chartObjects.xAxis;
    this.yAxis = chartObjects.yAxis;
    this.titleText = chartObjects.titleText;

    if (drawCandles) {
      this.drawCandles();
      const drawedPaths = this.drawSma();
      this.sma20Path = drawedPaths.sma20_path;
      this.sma50Path = drawedPaths.sma50_path;
      this.sma200Path = drawedPaths.sma200_path;
      this.listOfLinesToUpdate.push(this.sma20Path);
      this.listOfLinesToUpdate.push(this.sma50Path);
      this.listOfLinesToUpdate.push(this.sma200Path);
    } else {
      const drawedPaths = this.drawClosingAndSma();
      this.closePath = drawedPaths.closing_path;
      this.sma20Path = drawedPaths.sma20_path;
      this.sma50Path = drawedPaths.sma50_path;
      this.sma200Path = drawedPaths.sma200_path;

      this.listOfLinesToUpdate.push(this.closePath);
      this.listOfLinesToUpdate.push(this.sma20Path);
      this.listOfLinesToUpdate.push(this.sma50Path);
      this.listOfLinesToUpdate.push(this.sma200Path);
    }

    const crosshairStuff = this.addCrosshair();
    this.circle = crosshairStuff.circle;
    this.tooltipLineX = crosshairStuff.tooltipLineX;
    this.tooltipLineY = crosshairStuff.tooltipLineY;
    this.priceRect = crosshairStuff.priceRect;
    this.priceText = crosshairStuff.priceText;
    this.dateRect = crosshairStuff.dateRect;
    this.dateText = crosshairStuff.dateText;

    this.titleText.text(`${this.ticker}`);
  }

  activate_time_selector() {
    let xPos = 600;
    let yPos = 650;

    this.svg
      .append("text")
      .attr("x", xPos + 20)
      .attr("y", yPos - 6)
      .attr("class", "chart_button_text")
      .text("5Y");
    this.svg
      .append("rect")
      .attr("class", "listening-rect-time-selection")
      .attr("x", xPos)
      .attr("y", yPos - 20)
      .attr("width", 40)
      .attr("height", 20)
      .on("mousedown", (event: MouseEvent) => {
        this.currentLimitSupDisplayDate = new Date();
        this.currentLimitInfDisplayDate = new Date();
        this.currentLimitInfDisplayDate.setFullYear(
          this.currentLimitInfDisplayDate.getFullYear() - 5,
        );
        this.updateScaleDomain();
        this.updateGraphicElements();
      });

    xPos += 50;
    this.svg
      .append("text")
      .attr("x", xPos + 20)
      .attr("y", yPos - 6)
      .attr("class", "chart_button_text")
      .text("1Y");
    this.svg
      .append("rect")
      .attr("class", "listening-rect-time-selection")
      .attr("x", xPos)
      .attr("y", yPos - 20)
      .attr("width", 40)
      .attr("height", 20)
      .on("mousedown", (event: MouseEvent) => {
        this.currentLimitSupDisplayDate = new Date();
        this.currentLimitInfDisplayDate = new Date();
        this.currentLimitInfDisplayDate.setFullYear(
          this.currentLimitSupDisplayDate.getFullYear() - 1,
        );
        this.updateScaleDomain();
        this.updateGraphicElements();
      });

    xPos += 50;
    this.svg
      .append("text")
      .attr("x", xPos + 20)
      .attr("y", yPos - 6)
      .attr("class", "chart_button_text")
      .text("YTD");
    this.svg
      .append("rect")
      .attr("class", "listening-rect-time-selection")
      .attr("x", xPos)
      .attr("y", yPos - 20)
      .attr("width", 40)
      .attr("height", 20)
      .on("mousedown", (event: MouseEvent) => {
        this.currentLimitSupDisplayDate = new Date();
        this.currentLimitInfDisplayDate = new Date("2023-01-01");
        this.currentLimitInfDisplayDate.setFullYear(
          this.currentLimitSupDisplayDate.getFullYear() - 1,
        );
        this.updateScaleDomain();
        this.updateGraphicElements();
      });

    xPos += 50;
    this.svg
      .append("text")
      .attr("x", xPos + 20)
      .attr("y", yPos - 6)
      .attr("class", "chart_button_text")
      .text("6M");
    this.svg
      .append("rect")
      .attr("class", "listening-rect-time-selection")
      .attr("x", xPos)
      .attr("y", yPos - 20)
      .attr("width", 40)
      .attr("height", 20)
      .on("mousedown", (event: MouseEvent) => {
        this.currentLimitSupDisplayDate = new Date();
        this.currentLimitInfDisplayDate = new Date();
        this.currentLimitInfDisplayDate.setMonth(
          this.currentLimitInfDisplayDate.getMonth() - 6,
        );
        this.updateScaleDomain();
        this.updateGraphicElements();
      });

    xPos += 50;
    this.svg
      .append("text")
      .attr("x", xPos + 20)
      .attr("y", yPos - 6)
      .attr("class", "chart_button_text")
      .text("3M");
    this.svg
      .append("rect")
      .attr("class", "listening-rect-time-selection")
      .attr("x", xPos)
      .attr("y", yPos - 20)
      .attr("width", 40)
      .attr("height", 20)
      .on("mousedown", (event: MouseEvent) => {
        this.currentLimitSupDisplayDate = new Date();
        this.currentLimitInfDisplayDate = new Date();
        this.currentLimitInfDisplayDate.setMonth(
          this.currentLimitInfDisplayDate.getMonth() - 3,
        );
        this.updateScaleDomain();
        this.updateGraphicElements();
      });

    xPos += 50;
    this.svg
      .append("text")
      .attr("x", xPos + 20)
      .attr("y", yPos - 6)
      .attr("class", "chart_button_text")
      .text("1M");
    this.svg
      .append("rect")
      .attr("class", "listening-rect-time-selection")
      .attr("x", xPos)
      .attr("y", yPos - 20)
      .attr("width", 40)
      .attr("height", 20)
      .on("mousedown", (event: MouseEvent) => {
        this.currentLimitSupDisplayDate = new Date();
        this.currentLimitInfDisplayDate = new Date();
        this.currentLimitInfDisplayDate.setMonth(
          this.currentLimitInfDisplayDate.getMonth() - 1,
        );
        this.updateScaleDomain();
        this.updateGraphicElements();
      });

    xPos += 100;
    this.svg
      .append("text")
      .attr("x", xPos + 20)
      .attr("y", yPos - 6)
      .attr("class", "chart_button_text")
      .text("Y axis");
    this.svg
      .append("rect")
      .attr("class", "listening-rect-time-selection")
      .attr("x", xPos)
      .attr("y", yPos - 20)
      .attr("width", 40)
      .attr("height", 20)
      .on("mousedown", (event: MouseEvent) => {
        let yMin = d3.min(this.close, (d) => +d.close) as number;
        let yMax = d3.max(this.close, (d) => +d.close) as number;

        let minDateIndex = utils.findIndexByDate(
          this.currentLimitInfDisplayDate,
          this.close,
        );
        let maxDateIndex = utils.findIndexByDate(
          this.currentLimitSupDisplayDate,
          this.close,
        );
        yMin = d3.min(
          this.close.slice(minDateIndex, maxDateIndex),
          (d) => +d.close,
        ) as number;
        yMax = d3.max(
          this.close.slice(minDateIndex, maxDateIndex),
          (d) => +d.close,
        ) as number;
        yMin = yMin * 0.9;
        yMax = yMax * 1.1;
        //this.y.domain([yMin, yMax ])
        //this.updateGraphicElements();

        this.y = d3
          .scaleLinear()
          .domain([yMin, yMax] as [number, number])
          .range([this.height, 0]);
        let yAxis = d3.axisRight(this.y).tickFormat((d) => {
          return `${(+d).valueOf().toFixed(2)}`;
        });
        this.svg.select("#yAxis" + this.id).remove();
        this.svg
          .append("g")
          .attr("id", "yAxis" + this.id)
          .attr("transform", `translate(${this.width},0)`)
          .call(yAxis);
        this.updateGraphicElements();
      });
  }

  activate_smas() {
    let xPos = 800;
    let yPos = 0;
    /*this.svg.append("text")
            .attr("x", xPos + 30)
            .attr("y", yPos - 10)
            .attr("alignment-baseline", "middle")
            .attr("text-anchor", "middle")
            .attr("stroke", "white")
            .text("SMA20");*/
    this.svg
      .append("text")
      .attr("x", xPos + 30)
      .attr("y", yPos - 6)
      .attr("class", "chart_button_text")
      .text("SMA20");
    this.svg
      .append("rect")
      .attr("id", "sma20-button")
      .attr("class", "listening-rect-button-sma-on")
      .attr("x", xPos)
      .attr("y", yPos - 20)
      .attr("width", 60)
      .attr("height", 20)
      .on("mousedown", (event: MouseEvent) => {
        this.displaySma20 = !this.displaySma20;
        if (this.displaySma20) {
          this.svg
            .select("#sma20-button")
            .attr("class", "listening-rect-button-sma-on");
          this.sma20Path.attr("visibility", "visible");
        } else {
          this.svg
            .select("#sma20-button")
            .attr("class", "listening-rect-button-sma-off");
          this.sma20Path.attr("visibility", "hidden");
        }
      });

    xPos += 70;
    this.svg
      .append("text")
      .attr("x", xPos + 30)
      .attr("y", yPos - 6)
      .attr("class", "chart_button_text")
      .text("SMA50");
    this.svg
      .append("rect")
      .attr("id", "sma50-button")
      .attr("class", "listening-rect-button-sma-on")
      .attr("x", xPos)
      .attr("y", yPos - 20)
      .attr("width", 60)
      .attr("height", 20)
      .on("mousedown", (event: MouseEvent) => {
        this.displaySma50 = !this.displaySma50;
        if (this.displaySma50) {
          this.svg
            .select("#sma50-button")
            .attr("class", "listening-rect-button-sma-on");
          this.sma50Path.attr("visibility", "visible");
        } else {
          this.svg
            .select("#sma50-button")
            .attr("class", "listening-rect-button-sma-off");
          this.sma50Path.attr("visibility", "hidden");
        }
      });

    xPos += 70;
    this.svg
      .append("text")
      .attr("x", xPos + 30)
      .attr("y", yPos - 6)
      .attr("class", "chart_button_text")
      .text("SMA200");
    this.svg
      .append("rect")
      .attr("id", "sma200-button")
      .attr("class", "listening-rect-button-sma-on")
      .attr("x", xPos)
      .attr("y", yPos - 20)
      .attr("width", 60)
      .attr("height", 20)
      .on("mousedown", (event: MouseEvent) => {
        this.displaySma200 = !this.displaySma200;
        if (this.displaySma200) {
          this.svg
            .select("#sma200-button")
            .attr("class", "listening-rect-button-sma-on");
          this.sma200Path.attr("visibility", "visible");
        } else {
          this.svg
            .select("#sma200-button")
            .attr("class", "listening-rect-button-sma-off");
          this.sma200Path.attr("visibility", "hidden");
        }
      });

    xPos += 70;
    this.svg
      .append("text")
      .attr("x", xPos + 20)
      .attr("y", yPos - 6)
      .attr("class", "chart_button_text")
      .text("Candles");
    this.svg
      .append("rect")
      .attr("id", "candle-button")
      .attr("class", "listening-rect-button-candle-on")
      .attr("x", xPos)
      .attr("y", yPos - 20)
      .attr("width", 60)
      .attr("height", 20)
      .on("mousedown", (event: MouseEvent) => {
        this.drawAsCandle = !this.drawAsCandle;
        if (this.drawAsCandle) {
          this.svg
            .select("#candle-button")
            .attr("class", "listening-rect-button-candle-on");
          //this.close_path.attr("visibility", "visible")
        } else {
          this.svg
            .select("#candle-button")
            .attr("class", "listening-rect-button-candle-off");
          //this.close_path.attr("visibility", "hidden")
        }
      });
  }

  activate_drawing_tools() {
    let xPos = 600;
    let yPos = 0;

    this.svg
      .append("text")
      .attr("x", xPos + 20)
      .attr("y", yPos - 6)
      .attr("class", "chart_button_text")
      .text("Line");
    this.svg
      .append("rect")
      .attr("id", "line-button")
      .attr("class", "listening-rect-button-off")
      .attr("x", xPos)
      .attr("y", yPos - 20)
      .attr("width", 40)
      .attr("height", 20)
      .on("mousedown", (event: MouseEvent) => {
        if (this.mouseMode === "zoom") {
          this.mouseMode = "line";
          this.svg
            .select("#line-button")
            .attr("class", "listening-rect-button-on");
        } else {
          this.mouseMode = "zoom";
          this.svg
            .select("#line-button")
            .attr("class", "listening-rect-button-off");
        }
      });
  }

  activate_crosshair() {
    const crosshairStuff = this.addCrosshair();
    this.circle = crosshairStuff.circle;
    this.tooltipLineX = crosshairStuff.tooltipLineX;
    this.tooltipLineY = crosshairStuff.tooltipLineY;
    this.priceRect = crosshairStuff.priceRect;
    this.priceText = crosshairStuff.priceText;
    this.dateRect = crosshairStuff.dateRect;
    this.dateText = crosshairStuff.dateText;

    this.activate_drawing_tools();
    this.activate_time_selector();
    this.activate_smas();

    this.listeningRect = this.svg
      .append("rect")
      .attr("class", "listening-rect")
      .attr("opacity", 0)
      .attr("width", this.width)
      .attr("height", this.height);

    if (1)
      this.listeningRect.on("wheel", (event: WheelEvent) => {
        let xCoord = event.clientX - this.svgXPos - 10;
        let x0 = this.x.invert(xCoord);
        const i = utils.findIndexByDate(x0, this.close);
        this.d0 = this.close[i];

        const centerDate = new Date(this.d0.date as Date);
        const leftTime = this.currentLimitInfDisplayDate.getTime();
        const rightTime = this.currentLimitSupDisplayDate.getTime();
        const centerTime = centerDate.getTime();
        const leftDelta = centerTime - leftTime;
        const rightDelta = rightTime - centerTime;

        if (event.deltaY > 0) {
          // zoom out
          this.currentxScaleFactor /= consts.X_SCALE_FACTOR;
          let newLeftTime = centerTime - leftDelta * consts.X_SCALE_FACTOR;
          let newRightTime = centerTime + rightDelta * consts.X_SCALE_FACTOR;
          this.currentLimitInfDisplayDate = new Date(newLeftTime);
          this.currentLimitSupDisplayDate = new Date(newRightTime);
        }
        if (event.deltaY < 0) {
          // zoom in
          this.currentxScaleFactor *= consts.X_SCALE_FACTOR;
          let newLeftTime = centerTime - leftDelta / consts.X_SCALE_FACTOR;
          let newRightTime = centerTime + rightDelta / consts.X_SCALE_FACTOR;
          this.currentLimitInfDisplayDate = new Date(newLeftTime);
          this.currentLimitSupDisplayDate = new Date(newRightTime);
        }
        this.svg.select("#scale-factor-text").remove();
        this.svg
          .append("text")
          .attr("id", "scale-factor-text")
          .attr("x", 0)
          .attr("y", 0)
          .text(this.currentxScaleFactor.toFixed(2).toString());

        this.updateScaleDomain();
        event.preventDefault();
      });

    if (1)
      this.listeningRect.on("mousemove", (event: MouseEvent) => {
        let [xCoord, yCoord] = d3.pointer(event, this);
        xCoord = xCoord - this.svgXPos - consts.MARGIN.left;
        yCoord = yCoord - this.svgYPos - consts.MARGIN.top;

        let x0 = this.x.invert(xCoord);
        const i = utils.findIndexByDate(x0, this.close);

        this.d0 = this.close[i];
        if (this.d0 && this.d0.date) {
          this.xPos = this.x(this.d0.date);
        }
        if (0) {
          if (this.d0 && this.d0.close) {
            this.yPos = this.y(+this.d0.close);
          }
        } else {
          this.yPos = yCoord;
        }

        if (this.mouseMode === "line") {
          /*
                if (this.dragMouse === false && event.buttons === 1) { // store the beginning of the line
                    this.dragMouse = true
                    this.memoStartX = this.xPos
                    this.memoStartY = this.yPos;
                    console.log(">> this.memoStart X-Y", this.memoStartX, this.memoStartY)
                    this.svg.append("line")
                        .attr("id", "tmp-line")
                        .attr("stroke", "blue")
                        .attr("stroke-width", 1)
                        .attr("x1", (this.memoStartX))
                        .attr("y1", (this.memoStartY))
                        .attr("x2", (this.xPos))
                        .attr("y2", (this.yPos))

                }
                if (this.dragMouse === true && event.buttons === 0) { // store the end of the line 
                    this.dragMouse = false

                    this.memoEndX = this.xPos;
                    this.memoEndY = this.yPos;
                    this.ge.push(new graphic.GraphicElementBlueLine(
                        this.svg, this.x, this.y,
                        [
                            this.x.invert(this.memoStartX), this.y.invert(this.memoStartY),
                            this.x.invert(this.memoEndX), this.y.invert(this.memoEndY),
                        ]));
                    console.log(">> this.memoEnd X-Y", this.memoStartX, this.memoStartY)
                    this.svg.select("#tmp-line").remove()
                }
                if (this.dragMouse && event.buttons === 1) { // line is being drawn
                    this.svg.select("#tmp-line").remove()
                    this.svg.select("#tmp-value-rect").remove()
                    this.svg.select("#tmp-value-txt").remove()
                    this.svg.append("line")
                        .attr("id", "tmp-line")
                        .attr("stroke", "blue")
                        .attr("stroke-width", 1)
                        .attr("x1", (this.memoStartX))
                        .attr("y1", (this.memoStartY))
                        .attr("x2", (this.xPos))
                        .attr("y2", (this.yPos))

                    this.svg.append("rect")
                        .attr("id", "tmp-value-rect")
                        .attr("class", "crosshair_price_rect")
                        .attr("visibility", "visible")
                        .attr("x", this.xPos)
                        .attr("y", this.yPos)

                    let temp_value = (this.y.invert(yCoord) - this.y.invert(this.memoStartY)) / this.y.invert(this.memoStartY) * 100;
                    this.svg.append("text")
                        .attr("id", "tmp-value-txt")
                        .attr("class", "crosshair_price_text")
                        .attr("x", this.xPos + 27)
                        .attr("y", this.yPos + 15)
                        .text(temp_value.toFixed(2).toString() + "%");
                }
*/
        } else if (this.mouseMode === "zoom") {
          if (this.dragMouse === false && event.buttons === 1) {
            // store the date to shift
            this.memoDateToShift = new Date(this.d0.date as Date);
            this.memoStartX = event.clientX;
            this.memoYPos = this.yPos;
            this.leftTime = this.currentLimitInfDisplayDate.getTime();
            this.rightTime = this.currentLimitSupDisplayDate.getTime();
            this.step = (this.rightTime - this.leftTime) / this.width;
            this.dragMouse = true;
          }
          if (this.dragMouse === true && event.buttons === 0) {
            // end of shift
            this.dragMouse = false;
          }
          if (this.dragMouse && event.buttons === 1) {
            // shift the chart

            let delta = event.clientX - this.memoStartX;

            let newLeftTime = this.leftTime - delta * this.step;
            let newRightTime = this.rightTime - delta * this.step;
            this.currentLimitInfDisplayDate = new Date(newLeftTime);
            this.currentLimitSupDisplayDate = new Date(newRightTime);
            this.updateScaleDomain();
            /*this.circle.attr("cx", this.xPos).attr("cy", this.memoYPos)
                        .attr("visibility", "visible");

                    this.tooltipLineX.style("display", "block").attr("x1", this.xPos).attr("x2", this.xPos).attr("y1", 0).attr("y2", this.height);
                    this.tooltipLineY.style("display", "block").attr("y1", this.memoYPos).attr("y2", this.memoYPos).attr("x1", 0).attr("x2", this.width);
                    this.dateRect.attr("x", this.xPos - 35)
                        .attr("y", this.height + 5)
                        .attr("opacity", 0.8)
                        .attr("visibility", "visible");

                    if (this.d0 && this.d0.date)
                        this.dateText.attr("x", this.xPos).attr("y", this.height + 20 + 13).text(this.memoDate).attr("opacity", 0.8)
                            .attr("visibility", "visible");
                    */
          }
        }

        // crosshair stuff
        if (event.buttons === 0 || 1) {
          this.circle
            .attr("cx", this.xPos)
            .attr("cy", this.yPos)
            .attr("visibility", "visible");

          this.tooltipLineX
            .style("display", "block")
            .attr("x1", this.xPos)
            .attr("x2", this.xPos)
            .attr("y1", 0)
            .attr("y2", this.height);
          this.tooltipLineY
            .style("display", "block")
            .attr("y1", this.yPos)
            .attr("y2", this.yPos)
            .attr("x1", 0)
            .attr("x2", this.width);

          this.priceRect
            .attr("x", this.width)
            .attr("y", this.yPos - 10)
            .attr("opacity", 0.8)
            .attr("visibility", "visible");

          if (this.d0 && this.d0.close) {
            //const close = +this.d0.close
            //const close_txt = close.toFixed(2).toString();
            const close_txt = this.y.invert(yCoord).toFixed(2).toString();
            this.priceText
              .attr("x", this.width + 25)
              .attr("y", this.yPos + 4)
              .text(close_txt)
              .attr("opacity", 0.8)
              .attr("visibility", "visible");
          }

          this.dateRect
            .attr("x", this.xPos - 35)
            .attr("y", this.height + 5)
            .attr("opacity", 0.8)
            .attr("visibility", "visible");

          if (this.d0 && this.d0.date) {
            this.memoDate = this.d0.date.toLocaleDateString();

            this.dateText
              .attr("x", this.xPos)
              .attr("y", this.height + 5 + 13)
              .text(this.memoDate)
              .attr("opacity", 0.8)
              .attr("visibility", "visible");
          }
        }

        event.preventDefault();
      });

    this.updateScaleDomain();
  }

  updateScaleDomain() {
    this.x.domain([
      this.currentLimitInfDisplayDate,
      this.currentLimitSupDisplayDate,
    ]);
    this.updateGraphicElements();
  }

  updateGraphicElements() {
    try {
      this.svg.select("g").call(this.xAxis as any); // add 'as any' to fix the type error

      for (let element of this.listOfLinesToUpdate) {
        element.attr("clip-path", "url(#" + this.clipPath + ")").attr(
          "d",
          d3
            .line<ITickerClosingData>()
            .x((d) => this.x(d.date as Date))
            .y((d) => this.y(+d.close)) as any,
        );
      }

      for (let element of this.ge) {
        element.update(
          this.x,
          this.y,
          "url(#" + this.clipPath + ")",
          this.currentxScaleFactor,
        );
      }
    } catch (e) {
      console.log(e);
    }
  }
}
