export class crossHair {
  circle: any;
  tooltipLineX: any;
  tooltipLineY: any;
  priceRect: any;
  priceText: any;
  dateRect: any;
  dateText: any;
  listeningRect: any;
  svg: any;
  width: number;
  height: number;

  constructor(svg: any, width: number, height: number) {
    this.svg = svg;
    this.width = width;
    this.height = height;

    this.svg.select("crosshair-circle").remove();
    this.circle = this.svg
      .append("circle")
      .attr("r", 4)
      .attr("id", "crosshair-circle")
      .attr("fill", "black")
      .style("stroke", "white")
      .attr("opacity", 0.7)
      .attr("visibility", "hidden")
      .style("pointer-events", "none")
      .attr("cx", 50)
      .attr("cy", 50);

    this.svg.select("crosshair-line-x").remove();
    this.tooltipLineX = this.svg
      .append("line")
      .attr("class", "tooltip-line")
      .attr("id", "crosshair-line-x");

    this.svg.select("crosshair-line-y").remove();
    this.tooltipLineY = this.svg
      .append("line")
      .attr("class", "tooltip-line")
      .attr("id", "crosshair-line-Y");

    this.priceRect = this.svg
      .append("rect")
      .attr("class", "crosshair_price_rect")
      .attr("visibility", "hidden");

    this.dateRect = this.svg
      .append("rect")
      .attr("class", "crosshair_date_rect")
      .attr("visibility", "hidden");

    this.priceText = this.svg
      .append("text")
      .attr("class", "crosshair_price_text")
      .attr("x", 100)
      .attr("y", 100)
      .text("");

    this.dateText = this.svg
      .append("text")
      .attr("class", "crosshair_date_text")
      .attr("x", -1000)
      .attr("y", 100)
      .text("");
  }

  activate(context: any) {
    this.svg.select("listening-rect").remove();
    this.listeningRect = this.svg
      .append("rect")
      .attr("class", "listening-rect")
      .attr("opacity", 0)
      .attr("width", this.width)
      .attr("height", this.height);

    this.listeningRect.on("wheel", context.wheelCallback);
    this.listeningRect.on("mousemove", context.mouseMoveCallback);
    this.listeningRect.on("mousedown", context.mouseDownCallback);
    this.listeningRect.on("contextmenu", context.contextMenuCallback);
  }

  deactivate() {
    this.svg.select("listening-rect").remove();
  }

  move(xPos: number, yPos: number) {
    this.circle.attr("cx", xPos).attr("cy", yPos).attr("visibility", "visible");

    this.tooltipLineX
      .style("display", "block")
      .attr("x1", xPos)
      .attr("x2", xPos)
      .attr("y1", 0)
      .attr("y2", this.height);
    this.tooltipLineY
      .style("display", "block")
      .attr("y1", yPos)
      .attr("y2", yPos)
      .attr("x1", 0)
      .attr("x2", this.width);
    this.priceRect
      .attr("x", this.width)
      .attr("y", yPos - 10)
      .attr("opacity", 0.8)
      .attr("visibility", "visible");
    this.dateRect
      .attr("x", xPos - 35)
      .attr("y", this.height + 5)
      .attr("opacity", 0.8)
      .attr("visibility", "visible");
  }

  setPriceText(yPos: number, text: string) {
    this.priceText
      .attr("x", this.width + 25)
      .attr("y", yPos + 4)
      .text(text)
      .attr("opacity", 0.8)
      .attr("visibility", "visible");
  }
  setDateText(xPos: number, text: string) {
    this.dateText
      .attr("x", xPos)
      .attr("y", this.height + 5 + 13)
      .text(text)
      .attr("opacity", 0.8)
      .attr("visibility", "visible");
  }
}

/*


        if (this.mouseMode === "line") {
            
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

        }

        }

        }

        event.preventDefault();
    });

    this.updateScaleDomain()
}
*/
