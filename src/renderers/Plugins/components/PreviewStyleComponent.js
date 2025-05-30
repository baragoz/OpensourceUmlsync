class PreviewStyleComponent {
    constructor(containerId, options = {}, listener) {
      const defaultOptions = {
        connector: {
          color: '#000000',
          'line-width': 2,
          'font-family': 'Arial',
          'font-size': '16px',
          'font-color': '#000000',
          'font-bg': '#ffffff',
          bold: false,
          italic: false,
          underline: false,
          text: 'Label'
        },
        element: {
          'font-family': 'Arial',
          'font-size': '16px',
          'font-color': '#040406',
          color: '#ffffff',
          bold: false,
          italic: false,
          underline: false,
          text: 'Text'
        }
      };
  
      this.options = {
        connector: { ...defaultOptions.connector, ...(options.connector || {}) },
        element: { ...defaultOptions.element, ...(options.element || {}) }
      };
  
      this.listener = listener;
  
      this.$container = $(containerId);
      this.$el = $('<div>').addClass('us-dc-preview-style');
      this.$container.append(this.$el);
  
      this.$el.on("click", () => {
        if (this.listener) {
          this.listener(this.options);
        }
      });
  
      this.createView();
      this.updateView();
    }
  
    createView() {
      this.$label = $('<div>').addClass('us-dc-label');
      this.$canvas = $('<canvas>').addClass('us-dc-canvas').attr({ width: 200, height: 30 });
      this.$box = $('<div>').addClass('us-dc-box');
  
      this.$el.append(this.$label, this.$canvas, this.$box);
    }
  
    updateView() {
      const styleFor = (opt) => `
        font-family: ${opt['font-family']};
        font-size: ${opt['font-size']};
        color: ${opt['font-color']};
        background-color: ${opt['font-bg'] || opt.color};
        font-weight: ${opt.bold ? 'bold' : 'normal'};
        font-style: ${opt.italic ? 'italic' : 'normal'};
        text-decoration: ${opt.underline ? 'underline' : 'none'};
      `;
  
      this.$label.attr('style', styleFor(this.options.connector)).text(this.options.connector.text);
      this.$box.attr('style', styleFor(this.options.element)).text(this.options.element.text);
  
      this.drawArrow(this.$canvas[0]);
    }
  
    drawArrow(canvas) {
      const ctx = canvas.getContext('2d');
      const { color, ['line-width']: lineWidth } = this.options.connector;
  
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.moveTo(10, canvas.height / 2);
      ctx.lineTo(canvas.width - 20, canvas.height / 2);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
      ctx.stroke();
  
      ctx.beginPath();
      ctx.moveTo(canvas.width - 20, canvas.height / 2 - 5);
      ctx.lineTo(canvas.width - 10, canvas.height / 2);
      ctx.lineTo(canvas.width - 20, canvas.height / 2 + 5);
      ctx.fillStyle = color;
      ctx.fill();
    }
  
    updateOptions(newOptions) {
      if (newOptions.connector) {
        Object.assign(this.options.connector, newOptions.connector);
      }
      if (newOptions.element) {
        Object.assign(this.options.element, newOptions.element);
      }
      this.updateView();
    }
  
    updateElementOption(key, value) {
      this.options.element[key] = value;
      this.updateView();
    }
  
    updateConnectorOption(key, value) {
      this.options.connector[key] = value;
      this.updateView();
    }
  }
  
  export { PreviewStyleComponent }
  