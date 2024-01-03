import * as d3 from "d3";
import * as consts from "../services/constants";
import { v4 as uuidv4 } from "uuid";

export interface IOptionData {
  date: Date | null;
  value: number;
}

export class OptionValueChart {
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
  xmin: Date = new Date();
  xmax: Date = new Date();
  ymin: Number = 0;
  ymax: Number = 0;
  numDaysValue: number = 0;
  contract: any;
  clipPath: string;

  constructor(id: string) {
    this.id = id;
    this.margin = consts.STRATEGY_CHART_DEFAULT_MARGIN;
    this.frame_width = consts.STRATEGY_CHART_DEFAULT_SIZE.width;
    this.frame_height = 0.75 * consts.STRATEGY_CHART_DEFAULT_SIZE.height;
    this.width = this.frame_width - this.margin.left - this.margin.right;
    this.height = this.frame_height - this.margin.top - this.margin.bottom;
    this.clipPath = uuidv4();
  }

  createChart(
    contract: any,
    sigma: number = 0.0,
    currentPriceValue: number = 0.0,
    numDaysValue: number = 0.0,
  ) {
    this.numDaysValue = numDaysValue;
    this.contract = contract;
    this.prepareChartScales(contract, currentPriceValue, sigma, numDaysValue);
    this.cleanChart();
    this.setupChart();
    this.addAxis();
  }
  prepareChartScales(
    contract: any,
    currentPriceValue: number = 0.0,
    sigma: number = 0.0,
    numDaysValue: number = 0.0,
  ) {
    this.xmin = new Date();
    this.xmax = new Date();
    this.xmax.setDate(this.xmin.getDate() + numDaysValue);
    this.ymin = -10;
    this.ymax = 10;

    this.x = d3
      .scaleTime()
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
      .attr("transform", `translate(0,${this.height})`)
      .call(this.xAxis);

    this.svg
      .append("g")
      .attr("id", "yAxis" + this.id)
      .attr("transform", `translate(0,0)`)
      .call(this.yAxis);
  }
  updateYAxis() {
    this.y = d3
      .scaleLinear()
      .domain([this.ymin, this.ymax] as [number, number])
      .range([this.height, 0]);
    this.yAxis = d3.axisLeft(this.y);
    this.svg.select("#yAxis" + this.id).remove();
    this.svg
      .append("g")
      .attr("id", "yAxis" + this.id)
      .attr("transform", `translate(0,0)`)
      .call(this.yAxis);
  }
  drawTheta(
    price: number,
    interest_rate: number,
    iv: number,
    numDaysValue: number,
    dividend_yield: number,
  ) {
      
    let data1: IOptionData[] = [];
    let data2: IOptionData[] = [];
    
      for (let i = 0; i < numDaysValue; i += 1) {
      let d0 = new Date();
      d0.setDate(this.xmin.getDate() + i);
      let daysLeft = numDaysValue - i;
      let v = this.contract.getPrice(
        price,
        interest_rate,
        iv,
        daysLeft,
        dividend_yield,
      );
      data1.push({ date: d0, value: v });
    }
      
    let contractValue = this.contract.getPrice(
      price,
      interest_rate,
      iv,
      numDaysValue,
      dividend_yield,
    );

      let step=1
    for (let i = 0; i < numDaysValue; i += step) {
      let d0 = new Date();
      d0.setDate(this.xmin.getDate() + i);
      let daysLeft = numDaysValue - i;
      contractValue -= -step*this.contract.getTheta(
        price,
        interest_rate,
        iv,
        daysLeft,
        dividend_yield,
      );
      data2.push({ date: d0, value: contractValue });
    }
      
      
      
    this.ymin = 0; //d3.min(data, (d: any) => d.value);
    this.ymax = 3; //d3.max(data, (d: any) => d.value);
    this.updateYAxis();

    const theta = d3
      .line()
      .x((d: any) => this.x(d.date))
      .y((d: any) => this.y(d.value));

    this.svg
      .append("path")
      .datum(data1)
      .attr("class", "option-line")
      .attr("clip-path", "url(#" + this.clipPath + ")")
      .attr("d", theta);

    this.svg
      .append("path")
      .datum(data2)
      .attr("class", "option-line-2")
      .attr("clip-path", "url(#" + this.clipPath + ")")
      .attr("d", theta);
  }
}
