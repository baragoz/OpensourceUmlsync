import { BaseElement } from "../BaseElement";

class SQAltElement extends BaseElement {
    constructor(options, jsonModel, diagram) {
        let defaultOptions = {
            'nameTemplate': "sqport",
            'droppable': false,
            ...options
        };
        let defaultjsonModel = {
            'title': 'Alt',
            'width': 26,
            'height': 80,
            ...jsonModel
        };

        super(defaultOptions, defaultjsonModel, diagram);
    }

    _update() {
        super._update();
    }

    getAlt() {
        if (this.jsonModel.title == "Loop")
          return 'Loop(<a class="editablefield">' + 10 + '</a>)';
        if (this.jsonModel.title == "Parallel")
          return 'par';
        if (this.jsonModel.title == "Option")
          return 'opt';
        return this.jsonModel.title;
      }
 
      getCond() {
        if (this.jsonModel.title == "Alt")
          return '<div id="us-dashed" style="width:100%;height:50%;border-bottom:1px dashed black;">[<a id="ifcond" class="editablefield">if</a>]</div>[<a id="elsecond" class="editablefield">else</a>]';
  
        if (this.jsonModel.title == "Option" || this.jsonModel.title == "Loop" || this.jsonModel.title == "Break")
          return '[<a id="cond" class="editablefield">condition</a>]';
  
         if (this.jsonModel.title == "Parallel" || this.jsonModel.title == "Strict")
          return '<div id="us-dashed" style="width:100%;height:30%;border-bottom:1px dashed black;"></div><div id="us-dashed" style="width:100%;height:30%;border-bottom:1px dashed black;"></div>';
      }

    _create() {
        let iHtml = '<div id="' + this.euid + '" class="us-package">\
            <div class="us-alt-body us-element-resizable-area">'+
			this.getCond() +
            '</div><div class="us-alt-tab"><b>'+this.getAlt()+'</b><img src="http://umlsync.org/sttaic/images/cornerb.png" style="position:absolute;bottom:-1px;right:-1px;"></div>\
            </div>';


            // TODO: Move to a resizeable ....
            // $("#"+this.euid + " #us-dashed").resizable({'handles': 's-l', stop:function() {$(this).width("100%")}});

        this.diagram.nativeRef.append(iHtml);
    }
}

export {  SQAltElement }