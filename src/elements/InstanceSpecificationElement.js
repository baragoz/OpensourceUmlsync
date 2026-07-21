import { BaseElement } from "./BaseElement";

class InstanceSpecificationElement extends BaseElement {
  constructor(options, jsonModel, diagram) {
    let defaultOptions = {
      nameTemplate: "instance_specification",
      droppable: false,
      ...options,
    };
    let defaultjsonModel = {
      width: 200,
      height: 176,
      ...jsonModel,
    };

    super(defaultOptions, defaultjsonModel, diagram);
  }

  _update() {
    super._update();
    // Additional option for update
    this.jsonModel.height_b = $(
      "#" + this.euid + "_Border .us-package-body",
    ).height();
  }

  _create() {
    var spec = "";
    for (var i in this.jsonModel["specification"]) {
      spec +=
        '<li><a class="editablefield specification">' +
        this.jsonModel["specification"][i] +
        "</a></li>";
    }

    let innerHtml =
      '<div id="' +
      this.euid +
      '" class="us-instance us-element-resizable-area grElement">\
          <div style="padding:10px;border-bottom:1px solid black;">\
            <a class="editablefield">&nbsp&nbsp&nbsp&nbsp</a>\
            <b>:</b>\
            <a id="name" data-key="name" class="editablefield" style="border-bottom:1px solid black;">' +
      this.jsonModel.name +
      '</a></div>\
            <div class="us-instance-spec us-element-resizable-area"><ul class="us-sortable">';
    spec + "</ul></div></div>";

    this.diagram.nativeRef.append(innerHtml);
  }
}

export { InstanceSpecificationElement };
