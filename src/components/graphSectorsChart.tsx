import * as d3 from "d3";
import { v4 as uuidv4 } from "uuid";

import {
  ITickerClosingData,
  ITickerPriceRow,
  ITickerCurveDescriptor,
} from "../interfaces/datatypes";
import * as utils from "../services/utils";
import * as graphic from "./graphGraphicElement";
import * as consts from "../services/constants";

import * as crossHair from "./graphCrossHair";
import * as TickerLine from "./classTickerLine";

export class SectorChart {
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
  close_path: any;
  high_path: any;
  sma20_path: any;
  sma50_path: any;
  sma200_path: any;
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

  yminimum: number;
  ymaximum: number;

  listOfCurves: ITickerCurveDescriptor[];

  listOfGreenRectanglesToUpdate: any[];
  listOfORangeRectanglesToUpdate: any[];
  listOfRedRectanglesToUpdate: any[];
  listOfVLinesToUpdate: any[];

  ge: graphic.GraphicElement[];
  crossHair: any;
  displayMode: string;
  tickerLines: TickerLine.TickerLine[];
  clipPath: string = "";

  constructor(id: string) {
    this.tickerLines = [] as TickerLine.TickerLine[];

    this.displayMode = "price";

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

    this.yminimum = 0;
    this.ymaximum = 300;
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

    this.mouseMoveCallback = this.mouseMoveCallback.bind(this);
    this.wheelCallback = this.wheelCallback.bind(this);
    this.contextMenuCallback = this.contextMenuCallback.bind(this);
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
    //        this.clipPath="clip" + this.id
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

    this.crossHair = new crossHair.crossHair(this.svg, this.width, this.height);
  }

  toggleTickerLineVisibility(ticker: string) {
    let index = this.tickerLines.findIndex((c) => c.ticker === ticker);
    if (index >= 0) {
      this.tickerLines[index].toggleLineVisibility();
      this.updateGraphicElements();
    }
  }

  addTickerLine(
    ticker: string,
    tickerPrices: ITickerPriceRow[],
    drawCandles: boolean = true,
    lineColor: string = "magenta",
  ) {
    const line = d3
      .line<ITickerClosingData>()
      .x((d) => this.x(d.date as Date))
      .y((d) => this.y(+d.close));

    let tl = new TickerLine.TickerLine(
      this.tickerLines.length,
      ticker,
      tickerPrices,
      this.clipPath,
    );

    let closeMaxValue = tl.getMaxValue();
    if (closeMaxValue) {
      for (let c of this.tickerLines) {
        let maxValue = c.getMaxValue();
        if (maxValue && maxValue > closeMaxValue) {
          closeMaxValue = maxValue;
        }
      }
      closeMaxValue = closeMaxValue * 1.15;
    }

    this.x = d3
      .scaleTime()
      .domain([
        this.currentLimitInfDisplayDate,
        this.currentLimitSupDisplayDate,
      ])
      .range([0, this.width]);
    this.y = d3
      .scaleLinear()
      .domain([0, closeMaxValue] as [number, number])
      .range([this.height, 0]);
    this.xAxis = d3.axisBottom(this.x);
    this.yAxis = d3.axisRight(this.y).tickFormat((d) => {
      return `${(+d).valueOf().toFixed(2)}`;
    });

    tl.drawLine(this.svg, line, this.displayMode);
    tl.createRectangles(this.svg);

    this.tickerLines.push(tl);

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

    this.svg.select("listening-rect").remove();
    this.listeningRect = this.svg
      .append("rect")
      .attr("class", "listening-rect")
      .attr("id", "listening-rect")
      .attr("opacity", 0)
      .attr("width", this.width)
      .attr("height", this.height);

    this.crossHair.activate(this);
  }

  getCrossHairPosition(event: MouseEvent) {
    let [xCoord, yCoord] = d3.pointer(event, this);
    xCoord = xCoord - this.svgXPos - consts.MARGIN.left;
    yCoord = yCoord - this.svgYPos - consts.MARGIN.top;
    let xPos = xCoord;
    let yPos = yCoord;
    return { xPos, yPos };
  }

  contextMenuCallback(event: MouseEvent) {
    if (this.displayMode === "price") this.displayMode = "%";
    else this.displayMode = "price";

    console.log("processing contextMenu...");
    let pos = this.getCrossHairPosition(event);
    this.xPos = pos.xPos;
    this.yPos = pos.yPos;
    let theRefDate = this.x.invert(this.xPos);
    let yMin = 0;
    let yMax = 0;

    for (let index in d3.range(0, this.tickerLines.length)) {
      const preparedData = utils.prepareData(
        this.tickerLines[index].tickerPrices,
        this.limitDataInfDate,
      );
      this.close = preparedData.close;
      let theIndex = utils.findIndexByDate(theRefDate, this.close);
      let closeRefValue = +this.tickerLines[index].tickerPrices[theIndex].close;
      this.tickerLines[index].setRefValues(closeRefValue);
      console.log(
        this.tickerLines[index].ticker,
        "theIndex=",
        theIndex,
        "closeRefValue=",
        this.tickerLines[index].refValue,
      );

      let line = d3
        .line<ITickerClosingData>()
        .x((d) => this.x(d.date as Date))
        .y((d) => this.y(+d.close));

      this.tickerLines[index].drawLine(this.svg, line, this.displayMode);
      let yLimits: any;
      yLimits = this.tickerLines[index].drawLine(
        this.svg,
        line,
        this.displayMode,
      );
      yMin = Math.min(yMin, yLimits.yMin) as number;
      yMax = Math.max(yMax, yLimits.yMax) as number;
      //let dataToDisplay: csvData[] = [];
      //dataToDisplay = this.tickerLines[index].getdataToDisplay(this.displayMode)
      //console.log("contextMenuCallback : dataToDisplay = ", this.displayMode, dataToDisplay)
    }
    yMin = yMin * 0.9;
    yMax = yMax * 1.1;
    //console.log("updateGraphicElements : yMin=", yMin, "yMax=", yMax)

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

    /*
                for (let c of this.listOfCurves) {
                    const preparedData = utils.prepareData(c.tickerPrices, this.limitDataInfDate);
                    this.close = preparedData.close
                    let theIndex = utils.findIndexByDate(theRefDate, this.close)
                    let closeRefValue = c.tickerPrices[theIndex].close
                    console.log(c.ticker, "theIndex=", theIndex, "closeRefValue=", closeRefValue)
                    console.log(c.ticker, "closeRefValue=", closeRefValue)
                    for (let k in d3.range(0, c.tickerPrices.length)) {
                        let d = c.tickerPrices[k]
                        let percent = (+d.close - +closeRefValue) / +closeRefValue * 100
                        c.value[k] = +d.close
                        c.ratio[k] = percent
                    }
        
                    yMin = d3.min(c.tickerPrices, d => +d.close) as number;
                    console.log(c.ticker, "contextMenuCallback yMin", yMin)
                    yMax = d3.max(c.tickerPrices, d => +d.close) as number;
                    console.log(c.ticker, "contextMenuCallback yMax", yMax)
        
                }
        
                yMin = yMin * 0.9
                yMax = yMax * 1.1
        
                this.y = d3.scaleLinear().domain([yMin, yMax] as [number, number]).range([this.height, 0]);
                let yAxis = d3.axisRight(this.y).tickFormat(d => {
                    return `${(+d).valueOf().toFixed(2)}`;
                });
                this.svg.select("#yAxis" + this.id).remove();
                this.svg.append("g")
                    .attr("id", "yAxis" + this.id)
                    .attr("transform", `translate(${this.width},0)`)
                    .call(yAxis);
        */
    this.updateGraphicElements();
    event.preventDefault();
  }

  mouseMoveCallback(event: MouseEvent) {
    let pos = this.getCrossHairPosition(event);
    this.xPos = pos.xPos;
    this.yPos = pos.yPos;

    if (this.displayMode === "price" || this.displayMode === "%") {
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
        this.crossHair.move(this.xPos, this.yPos);
        let thedate = this.x.invert(this.xPos);
        this.crossHair.setDateText(this.xPos, thedate.toLocaleDateString());
        this.crossHair.setPriceText(
          this.yPos,
          this.y.invert(this.yPos).toFixed(2).toString(),
        );
      }
    }

    /*if (event.buttons === 2 && this.displayMode === "contextMenu") {
            console.log("processing contextMenu...")

        }
        if (event.buttons === 0 && this.displayMode=== "contextMenu")
        {
            this.displayMode="price"
            console.log("end of contextMenu")
        }
*/

    if (event.buttons === 0) {
      this.crossHair.move(this.xPos, this.yPos);
      let thedate = this.x.invert(this.xPos);
      this.crossHair.setDateText(this.xPos, thedate.toLocaleDateString());
      this.crossHair.setPriceText(
        this.yPos,
        this.y.invert(this.yPos).toFixed(2).toString(),
      );
    }
    event.preventDefault();
  }

  wheelCallback(event: WheelEvent) {
    let pos = this.getCrossHairPosition(event);
    this.xPos = pos.xPos;
    this.yPos = pos.yPos;

    let theDate = this.x.invert(this.xPos);

    const centerDate = new Date(theDate);
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
    /*this.svg.select("#scale-factor-text").remove();
        this.svg.append("text")
            .attr("id", "scale-factor-text")
            .attr("x", 0)
            .attr("y", 0)
            .text(this.currentxScaleFactor.toFixed(2).toString());*/

    this.updateScaleDomain();

    event.preventDefault();
  }

  setXDomain(dateMin: Date, dateMax: Date) {
    this.x.domain([dateMin, dateMax]);
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
      let line = d3
        .line<ITickerClosingData>()
        .x((d) => this.x(d.date as Date))
        .y((d) => this.y(+d.close));

      this.svg.select("g").call(this.xAxis as any); // add 'as any' to fix the type error

      let yMin = +Infinity;
      let yMax = -Infinity;

      for (let index in d3.range(0, this.tickerLines.length)) {
        this.svg.select("#" + this.tickerLines[index].getLineID()).remove();
        let yLimits: any;

        yLimits = this.tickerLines[index].drawLine(
          this.svg,
          line,
          this.displayMode,
        );
        yMin = Math.min(yMin, yLimits.yMin) as number;
        yMax = Math.max(yMax, yLimits.yMax) as number;
      }

      yMin = yMin * 0.9;
      yMax = yMax * 1.1;
      //console.log("updateGraphicElements : yMin=", yMin, "yMax=", yMax)

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

      this.svg.select("#yLabel" + this.id).remove();
      let ylabel = this.svg
        .append("text")
        .attr("id", "yLabel" + this.id)
        .attr("text-anchor", "end")
        .attr("y", this.width + 50)
        .attr("x", -this.height / 2)
        .attr("transform", "rotate(-90)")
        .text("USD");

      if (this.displayMode === "price") ylabel.text("USD");
      else ylabel.text("%");

      /*
                        for (let index in d3.range(0, this.listOfCurves.length)) {
                            let curve = this.listOfCurves[index]
                            let dataToDisplay: csvData[] = []
                            for (let k in d3.range(0, curve.tickerPrices.length)) {
                                let tmp: csvData = {} as csvData;
                                tmp.date = new Date(curve.tickerPrices[k].date)
                                if (this.displayMode === "price") {
                                    tmp.close = curve.value[k].toFixed(2).toString();
                                }
                                else {
                                    tmp.close = curve.ratio[k].toFixed(2).toString();
                                }
                                dataToDisplay.push(tmp)
                            }
            
            
                            this.svg.select("#closing_path-" + this.id + "-" + curve.ticker).remove();
                            console.log("updateGraphicElements : curve.ticker=", curve.ticker, "curve.visibility=", curve.visibility)
                            this.svg.append("path")
                                .datum(dataToDisplay)
                                .attr("class", "line")
                                .attr("fill", "none")
                                .attr("stroke", curve.lineColor)
                                .attr("stroke-width", 3)
                                .attr("clip-path", "url(#clip" + this.id + ")")
                                .attr("id", "closing_path-" + this.id + "-" + curve.ticker)
                                .attr("visibility", curve.visibility)
                                .attr("d", line as any);
                        }
            
                        for (let element of this.ge) {
                            element.update(this.x, this.y,
                                "url(#clip" + this.id + ")", this.currentxScaleFactor);
                        }
                    */
    } catch (e) {
      console.log(e);
    }
    this.crossHair.activate(this);
  }
}
