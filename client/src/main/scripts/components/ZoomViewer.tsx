import * as React from "react";
import { TimeRange } from "./Video";
import { alertErr } from "../utils/functions";
import NumberLineTransform from "../utils/numberLineTransform";

interface ZoomViewerProps {
  zoomRange: TimeRange;
  duration: number;
}
interface ZoomViewerState {
  numberLineTransform: NumberLineTransform;
}

class ZoomViewer extends React.Component<ZoomViewerProps, ZoomViewerState> {
  private width: number;
  private height: number;
  private canvas: HTMLCanvasElement;
  constructor(props: ZoomViewerProps) {
    super(props);
    this.width = 540;
    this.height = 40;

    const numberLineTransform = new NumberLineTransform();
    numberLineTransform.setBefore(0, props.duration);
    numberLineTransform.setAfter(0, this.width);

    this.state = {
      numberLineTransform: numberLineTransform
    };
  }
  updateCanvas = () => {
    const zoomRange = this.props.zoomRange;
    if (zoomRange.end) {
      const ctx = this.canvas.getContext("2d");
      if (ctx) {
        const nlt = this.state.numberLineTransform;
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, "#758aa8");
        gradient.addColorStop(1, "#d3dae3");
        ctx.fillStyle = gradient;

        // Go through path once to create the fill
        ctx.strokeStyle = "#2c4770";
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.beginPath();
        ctx.moveTo(nlt.toAfter(zoomRange.start), 0);
        ctx.lineTo(0, this.height);
        ctx.lineTo(this.width, this.height);
        ctx.lineTo(nlt.toAfter(zoomRange.end), 0);
        ctx.fill();

        // Go through again to stroke where we need it
        ctx.beginPath();
        ctx.moveTo(nlt.toAfter(zoomRange.start), 0);
        ctx.lineTo(0, this.height);
        ctx.moveTo(this.width, this.height);
        ctx.lineTo(nlt.toAfter(zoomRange.end), 0);
        ctx.stroke();
      } else {
        const msg = "ZoomViewer: Error getting canvas context";
        alertErr(msg);
        throw msg;
      }
    } else {
      const msg = "ZoomViewer: Expect zoom range to have an end";
      alertErr(msg);
      throw msg;
    }
  };
  componentDidMount() {
    this.updateCanvas();
  }
  componentDidUpdate() {
    this.updateCanvas();
  }
  render() {
    return (
      <div className="zoomViewer">
        <div className="zoomViewer__canvas-container">
          <canvas
            className="zoomViewer__canvas"
            width={this.width}
            height={this.height}
            ref={(canvas: HTMLCanvasElement) => (this.canvas = canvas)}
          />
        </div>
      </div>
    );
  }
}

export default ZoomViewer;
