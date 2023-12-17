import { area } from "d3";
import { I2DPoint, I2DSize } from "../interfaces/datatypes";

export class GraphicElement {
  data: any[];
  e: any;

  constructor(svg: any, x: any, y: any, data: any[]) {
    this.data = data;
  }
  update(x: any, y: any, clipPath: string, scale: number = 1) {}
}

export class GraphicElementVLine extends GraphicElement {
  constructor(svg: any, x: any, y: any, data: any[]) {
    super(svg, x, y, data);
    this.e = svg
      .append("line")
      .attr("class", "tooltip-line")
      .attr("id", "tooltip-line-y")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "6,2")
      .style("display", "block")
      .attr("x1", x(this.data[0]))
      .attr("x2", x(this.data[0]))
      .attr("y1", 0)
      .attr("y2", this.data[1]);
  }

  update(x: any, y: any, clipPath: string, scale: number = 1) {
    this.e
      .attr("clip-path", clipPath)
      .attr("x1", x(this.data[0]))
      .attr("x2", x(this.data[0]))
      .attr("y1", 0)
      .attr("y2", this.data[1])
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "6,2");
  }
}

export class GraphicElementLine extends GraphicElement {
  constructor(svg: any, x: any, y: any, data: any[]) {
    super(svg, x, y, data);
    this.e = svg
      .append("line")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .style("display", "block")
      .attr("x1", x(this.data[0]))
      .attr("y1", y(this.data[1]))
      .attr("x2", x(this.data[2]))
      .attr("y2", y(this.data[3]));
  }

  update(x: any, y: any, clipPath: string, scale: number = 1) {
    this.e
      .attr("clip-path", clipPath)
      .attr("x1", x(this.data[0]))
      .attr("y1", y(this.data[1]))
      .attr("x2", x(this.data[2]))
      .attr("y2", y(this.data[3]))
      .attr("stroke", "black")
      .attr("stroke-width", 1);
  }
}

export class GraphicElementCandleBlackLine extends GraphicElement {
  constructor(svg: any, x: any, y: any, data: any[]) {
    super(svg, x, y, data);
    this.e = svg
      .append("line")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .style("display", "block")
      .attr("x1", x(this.data[0]))
      .attr("y1", y(this.data[1]))
      .attr("x2", x(this.data[2]))
      .attr("y2", y(this.data[3]));
  }

  update(x: any, y: any, clipPath: string, scale: number = 1) {
    this.e
      .attr("clip-path", clipPath)
      .attr("x1", x(this.data[0]))
      .attr("y1", y(this.data[1]))
      .attr("x2", x(this.data[2]))
      .attr("y2", y(this.data[3]))
      .attr("stroke", "black")
      .attr("stroke-width", scale / 10);
  }
}

export class GraphicElementCandleWhiteLine extends GraphicElement {
  constructor(svg: any, x: any, y: any, data: any[]) {
    super(svg, x, y, data);
    this.e = svg
      .append("line")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .style("display", "block")
      .attr("x1", x(this.data[0]))
      .attr("y1", y(this.data[1]))
      .attr("x2", x(this.data[2]))
      .attr("y2", y(this.data[3]));
  }

  update(x: any, y: any, clipPath: string, scale: number = 1) {
    this.e
      .attr("clip-path", clipPath)
      .attr("x1", x(this.data[0]))
      .attr("y1", y(this.data[1]))
      .attr("x2", x(this.data[2]))
      .attr("y2", y(this.data[3]))
      .attr("stroke", "white")
      .attr("stroke-width", scale / 10);
  }
}


export class GraphicElementCandleGreenLine extends GraphicElement {
  constructor(svg: any, x: any, y: any, data: any[]) {
    super(svg, x, y, data);

    let position: I2DPoint = {
      x: x(this.data[0]),
      y: y(this.data[1]),
    };
    let areaSize: I2DSize = {
      width: x(this.data[2]) - x(this.data[0]),
      height: y(this.data[1]) - y(this.data[3]),
    };

    this.e = svg
      .append("rect")
      .attr("class", "green-candle")
      .attr("visibility", "visible")
      .attr("x", position.x)
      .attr("y", position.y)
      .attr("width", 2)
      .attr("height", areaSize.height)
      .attr("fill", "green")
      .attr("opacity", 1);
  }

  update(x: any, y: any, clipPath: string, scale: number = 1) {

    let position: I2DPoint = {
      x: x(this.data[0]),
      y: y(this.data[1]),
    };
    let areaSize: I2DSize = {
      width: x(this.data[2]) - x(this.data[0]),
      height: y(this.data[1]) - y(this.data[3]),
    };

    this.e
      .attr("clip-path", clipPath)
      .attr("class", "green-candle")
      .attr("x", position.x - scale / 2)
      .attr("y", position.y)
      .attr("width", 1 * scale)
      .attr("height", areaSize.height);
  }
}
export class GraphicElementCandleRedLine extends GraphicElement {
  constructor(svg: any, x: any, y: any, data: any[]) {
    super(svg, x, y, data);

    let position: I2DPoint = {
      x: x(this.data[0]),
      y: y(this.data[1]),
    };
    let areaSize: I2DSize = {
      width: x(this.data[2]) - x(this.data[0]),
      height: y(this.data[3]) - y(this.data[1]),
    };

    this.e = svg
      .append("rect")
      .attr("class", "red-candle")
      .attr("visibility", "visible")
      .attr("x", position.x)
      .attr("y", position.y)
      .attr("width", 2)
      .attr("height", areaSize.height)
      .attr("fill", "green")
      .attr("opacity", 1);
  }

  update(x: any, y: any, clipPath: string, scale: number = 1) {
    /*this.e
      .attr("clip-path", clipPath)
      .attr("x1", x(this.data[0]))
      .attr("y1", y(this.data[1]))
      .attr("x2", x(this.data[2]))
      .attr("y2", y(this.data[3]))
      .attr("stroke", "green")
      .attr("stroke-width", scale);*/

    let position: I2DPoint = {
      x: x(this.data[0]),
      y: y(this.data[1]),
    };
    let areaSize: I2DSize = {
      width: x(this.data[2]) - x(this.data[0]),
      height: y(this.data[3]) - y(this.data[1]),
    };

    this.e
      .attr("clip-path", clipPath)
      .attr("class", "red-candle")
      .attr("x", position.x - scale / 2)
      .attr("y", position.y)
      .attr("width", 1 * scale)
      .attr("height", areaSize.height);
  }
}


export class GraphicElementCandleGreenLine_UNUSED extends GraphicElement {
  constructor(svg: any, x: any, y: any, data: any[]) {
    super(svg, x, y, data);
    /*  this.e = svg
      .append("line")
      .attr("stroke", "green")
      .attr("stroke-width", 3)
      .style("display", "block")
      .attr("x1", x(this.data[0]))
      .attr("y1", y(this.data[1]))
      .attr("x2", x(this.data[2]))
      .attr("y2", y(this.data[3]));*/

    let position: I2DPoint = {
      x: x(this.data[0]),
      y: y(this.data[1]),
    };
    let areaSize: I2DSize = {
      width: x(this.data[2]) - x(this.data[0]),
      height: y(this.data[1]) - y(this.data[3]),
    };

    this.e = svg
      .append("rect")
      .attr("class", "colored-rect")
      .attr("visibility", "visible")
      .attr("x", position.x)
      .attr("y", position.y)
      .attr("width", 2)
      .attr("height", areaSize.height)
      .attr("fill", "green")
      .attr("opacity", 1);
  }

  update(x: any, y: any, clipPath: string, scale: number = 1) {
    /*this.e
      .attr("clip-path", clipPath)
      .attr("x1", x(this.data[0]))
      .attr("y1", y(this.data[1]))
      .attr("x2", x(this.data[2]))
      .attr("y2", y(this.data[3]))
      .attr("stroke", "green")
      .attr("stroke-width", scale);*/

    let position: I2DPoint = {
      x: x(this.data[0]),
      y: y(this.data[1]),
    };
    let areaSize: I2DSize = {
      width: x(this.data[2]) - x(this.data[0]),
      height: y(this.data[1]) - y(this.data[3]),
    };

    this.e
      .attr("clip-path", clipPath)
      .attr("class", "green-candle")
      .attr("x", position.x - scale / 2)
      .attr("y", position.y)
      .attr("width", 1 * scale)
      .attr("height", areaSize.height);
  }
}

export class GraphicElementCandleRedLine_UNUSED extends GraphicElement {
  constructor(svg: any, x: any, y: any, data: any[]) {
    super(svg, x, y, data);
    this.e = svg
      .append("line")
      .attr("stroke", "red")
      .attr("stroke-width", 3)
      .style("display", "block")
      .attr("x1", x(this.data[0]))
      .attr("y1", y(this.data[1]))
      .attr("x2", x(this.data[2]))
      .attr("y2", y(this.data[3]));
  }

  update(x: any, y: any, clipPath: string, scale: number = 1) {
    this.e
      .attr("clip-path", clipPath)
      .attr("x1", x(this.data[0]))
      .attr("y1", y(this.data[1]))
      .attr("x2", x(this.data[2]))
      .attr("y2", y(this.data[3]))
      .attr("stroke", "red")
      .attr("stroke-width", scale);
  }
}


export class GraphicElementBlueLine extends GraphicElement {
  constructor(svg: any, x: any, y: any, data: any[]) {
    super(svg, x, y, data);
    this.e = svg
      .append("line")
      .attr("stroke", "blue")
      .attr("stroke-width", 1)
      .style("display", "block")
      .attr("x1", x(this.data[0]))
      .attr("y1", y(this.data[1]))
      .attr("x2", x(this.data[2]))
      .attr("y2", y(this.data[3]));
  }

  update(x: any, y: any, clipPath: string, scale: number = 1) {
    this.e
      .attr("clip-path", clipPath)
      .attr("x1", x(this.data[0]))
      .attr("y1", y(this.data[1]))
      .attr("x2", x(this.data[2]))
      .attr("y2", y(this.data[3]))
      .attr("stroke", "blue")
      .attr("stroke-width", 1);
  }
}

export class GraphicElementRectangle extends GraphicElement {
  constructor(svg: any, x: any, y: any, data: any[]) {
    super(svg, x, y, data);
    this.e = svg
      .append("rect")
      .attr("class", "colored-rect")
      .attr("visibility", "visible")
      .attr("x", x(this.data[0]))
      .attr("y", y(this.data[1]))
      .attr("width", x(this.data[2]) - x(this.data[0]))
      .attr("height", y(this.data[3]) - y(this.data[4]))
      .attr("fill", this.data[5])
      .attr("opacity", this.data[6]);
  }

  update(x: any, y: any, clipPath: string, scale: number = 1) {
    this.e
      .attr("clip-path", clipPath)
      .attr("class", ".colored-rect")
      .attr("x", x(this.data[0]))
      .attr("y", y(this.data[1]))
      .attr("width", x(this.data[2]) - x(this.data[0]))
      .attr("height", y(this.data[3]) - y(this.data[4]))
      .attr("fill", this.data[5])
      .attr("opacity", this.data[6]);
  }
}
