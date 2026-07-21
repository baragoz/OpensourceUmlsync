class ElementResizeable {
  constructor(element, nativeBorderRef, blackboard) {
    this.element = element;
    this.init(element, nativeBorderRef, blackboard);
    blackboard.addEventListener(
      "storage:editmode",
      this.onEditModeChange.bind(this),
    );
  }

  //
  // Add element's resizeable options
  //
  init(element, nativeBorderRef, blackboard) {
    //
    // Make Wrapped element resizeable
    //
    nativeBorderRef
      .resizable({
        // BUG: DO NOT un-comment this code.
        //      Because, it is lead to jumping element on resize start !!!!
        //
        //      'containment': "#" + element.diagram.euid,
        //
        scroll: true, // Scroll container on resize
        handles:
          element.options["resizable_h"] ||
          "n-u,e-u,s-u,w-u,nw-u,sw-u,ne-u,se-u",
        alsoResize: "#" + element.euid + "_Border .us-element-resizable-area",
        start: function (event) {
          // TODO:  hide all editable fields on diagram
          element._update();

          if (element.diagram.opman) {
            element.diagram.opman.begin();
          }

          // Notify listeners to hide all editable fields, hide icon menu or context menu,
          // and update operation manager etc ...
          blackboard.notify("element:resize:start", element);

          // mark event as handled
          event.stopPropagation();
        },
        stop: function (event) {
          element._update();

          if (element.diagram.opman) {
            element.diagram.opman.commit();
          }

          // if element has a handler on resize complete to align all elements correctly
          if (element.onResizeComplete) {
            element.onResizeComplete();
          }

          // Recover the width of the resize-also elements
          $("#" + element.euid + "_Border .us-element-resizable-area").css(
            "width",
            "",
          );

          element.diagram.draw();

          // notify plugins about resize stop
          blackboard.notify("element:resize:stop", element);
          event.stopPropagation();
        },
        resize: function (event, ui) {
          // var dh = ui.size.height - $(this).css("height");
          // $(this).css("height", ui.size.height);

          // work-around for synchronization of resizeAlso area
          $("#" + element.euid + "_Border .us-element-resizable-area").css(
            "width",
            "",
          );

          // TODO: not sure if we need this method
          if (element.onResizeProgress) {
            element.onResizeProgress();
          }

          element.diagram.draw();
          event.stopPropagation();
        },
      })
      // TODO: Check if we really eed to fix position,
      //       because resizeable add an extra wrapper
      .css({ position: "absolute" })
      .css("top", element.jsonModel.top)
      .css("left", element.jsonModel.left);

    // Hide element resize points which was
    // added on the previous step
    $("#" + element.euid + "_Border " + ".ui-resizable-handle").css({
      visibility: "hidden",
    });
  }

  onEditModeChange(change) {
    this.element.nativeBorderRef.resizable(
      change.newValue ? "enable" : "disable",
    );
  }
}

export { ElementResizeable };
