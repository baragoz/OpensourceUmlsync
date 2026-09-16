import { BaseElement } from "../BaseElement";

class SQObjectInstanceElement extends BaseElement {
  constructor(options, jsonModel, diagram) {
    let defaultOptions = {
      nameTemplate: "sqobject_instance",
      droppable: false,
      midpoint: 1,
      acceptdrop: ["sqport", "sqdestroy"],
      ...options,
    };
    let defaultjsonModel = {
      width: 176,
      height: 400,
      name: "ObjectInstance",
      ...jsonModel,
    };

    super(defaultOptions, defaultjsonModel, diagram);
  }

  _update() {
    super._update();
    // Additional option for update
  }

  _updateJsonModel(key, value) {
    if (key === "color") {
      this.nativeRef
        .find(".grElement")
        .css("background-color", value || "none");
      this.jsonModel[key] = value;
    } else {
      super._updateJsonModel(key, value);
    }
  }

  _create() {
    let innerHtml =
      '<div id="' +
      this.euid +
      '" class="us-element-resizable-area" style="width:100%;">\
          <div class="us-instance-line"></div>\
          <div id="' +
      this.euid +
      '_NEXT" class="us-instance grElement" style="height:40px;">\
          <div><a id="name" data-key="name" class="editablefield Name">:' +
      this.jsonModel.name +
      "</a></div></div></div>";
    this.diagram.nativeRef.append(innerHtml);
  }

  //
  // Resolve where a sequence-diagram connector endpoint dropped at (x, y)
  // on this lifeline should actually attach. Every message in a sequence
  // diagram is horizontal, so the only question is *which row*: the
  // object's own header box, or one of the activation bars (SQPort)
  // dropped onto it.
  //
  // - Landing inside the header ("us-instance") attaches to the instance
  //   itself, at its left border (matches BaseSQConnector's own header
  //   handling).
  // - Landing below the header attaches to one of this instance's ports,
  //   but only among the ports whose OWN vertical extent actually
  //   contains y - a port claims its own row, not the whole rest of the
  //   lifeline below the header, so dragging past a port (while still
  //   inside the instance) falls through to the instance's own body
  //   instead of clinging to whichever port happens to exist. Among
  //   several ports that do overlap at this y (stacked/nested
  //   activations sharing the same lifeline column), pick the one pushed
  //   furthest toward the connector's own side (largest indent for a
  //   connector approaching from the right, smallest/most negative for
  //   one approaching from the left), since that's the currently
  //   outward/active activation. With no port claiming this y, fall back
  //   to the lifeline's own center.
  //
  // Returns { element, x } (x already in diagram/page coordinates), or
  // null if this instance's border isn't in the DOM, or if y falls
  // outside this instance's own rendered height entirely (dragged past
  // its top or bottom) - callers rely on that null to mean "genuinely
  // detached", not "snap to whatever's closest anyway".
  //
  findNearestAttachPoint(x, y, fromRight = true) {
    const pos = this.nativeBorderRef.position();
    if (!pos) {
      return null;
    }

    const height = this.nativeBorderRef.height();
    if (y < pos.top || y > pos.top + height) {
      return null;
    }

    const $header = this.nativeRef.find(".us-instance");
    const headerHeight = $header.length ? $header.outerHeight() : 0;
    const inHeader = y - pos.top >= 0 && y - pos.top < headerHeight;

    if (inHeader) {
      return { element: this, x: pos.left };
    }

    const ports = (this.droplist || []).filter((el) => {
      if (el.options.nameTemplate !== "sqport") {
        return false;
      }
      const p = el.nativeBorderRef.position();
      if (!p) {
        return false;
      }
      const h = el.nativeBorderRef.height();
      return y >= p.top && y <= p.top + h;
    });

    if (ports.length === 0) {
      return { element: this, x: pos.left + this.nativeBorderRef.width() / 2 };
    }

    let best = ports[0];
    for (const port of ports) {
      const bestIndent = best.jsonModel.indent || 0;
      const portIndent = port.jsonModel.indent || 0;
      if (fromRight ? portIndent > bestIndent : portIndent < bestIndent) {
        best = port;
      }
    }

    const bp = best.nativeBorderRef.position();
    return { element: best, x: bp.left + best.nativeBorderRef.width() };
  }
}

export { SQObjectInstanceElement };
