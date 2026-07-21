//
// Addon - DROPPABLE
// Allow to drop some elements on diagram, like classes or methods or packages
//
class DiagramDroppableDynatree {
  constructor(diagram, blackboard) {
    this.init(diagram, blackboard);
  }

  //
  // Trigger context menu events
  //
  init(iDiagram, blackboard) {
    $("#" + iDiagram.euid + ".us-diagram")
      .droppable({
        drop: function (event, ui) {
          var source = ui.helper.data("dtSourceNode"); // dynatree node
          var thisOffset = $(this).offset();
          if (!source) return;
          $.log("source: " + source.data.addClass);
          if (
            source.data.addClass == "iconclass" ||
            source.data.addClass == "iconinterface"
          ) {
            var key = "",
              separator = "",
              filenode = source,
              isInterface = source.data.addClass == "iconinterface";
            if (source.data.description) {
              key = source.data.description;
            } else {
              while (
                filenode.data.addClass == "iconinterface" ||
                filenode.data.addClass == "iconclass" ||
                filenode.data.addClass == "namespace"
              ) {
                key = filenode.data.title + separator + key;
                separator = "::";
                filenode = filenode.parent;
              }
            }

            if (iDiagram.options["type"] == "sequence") {
              var element = { viewid: source.data.viewid, type: "objinstance" };
              element.pageX = ui.position.left - thisOffset.left;
              element.left = element.pageX;
              element.name = key;
              element.filepath = filenode.getAbsolutePath();
              var ename = iDiagram.Element(element.type, element);
              return;
            }

            if (iDiagram.options["type"] == "component") {
              var element = { viewid: source.data.viewid };
              element.type = isInterface ? "interface" : "component";
              element.left = ui.position.left - thisOffset.left;
              element.top = ui.position.top - thisOffset.top;
              element.name = key;
              element.filepath = filenode.getAbsolutePath();
              var ename = iDiagram.Element(element.type, element);
              return;
            }
            if (iDiagram.menuIcon != undefined) {
              var element = { viewid: source.data.viewid, type: "class" };

              if (element != undefined) {
                element.left = ui.position.left - thisOffset.left;
                element.top = ui.position.top - thisOffset.top;
                element.name = key;
                if (isInterface) element.aux = "interface";
                element.filepath = filenode.getAbsolutePath();
                var ename = iDiagram.Element(element.type, element);
              }
            } else {
              iDiagram.Element("class", {
                name: source.data.title,
                filepath: source.getAbsolutePath(),
                editable: true,
                viewid: source.data.viewid,
              });
            }
          } else if (source.data.addClass == "diagramclass") {
            // Add sub-diagram to element
            $.eee = ui;
            $.uuu = event;
            iDiagram._dropSubDiagram(source.getAbsolutePath(), event, ui);
          } else if (source.data.isFs) {
            if (iDiagram.options["type"] == "component") {
              var element = { viewid: source.data.viewid, type: "component" };
              if (element != undefined) {
                element.left = ui.position.left - thisOffset.left;
                element.top = ui.position.top - thisOffset.top;
                element.name = source.data.title;
                element.filepath = source.getAbsolutePath();
                var ename = iDiagram.Element(element.type, element);
                return;
              }
            }
            var element = { viewid: source.data.viewid, type: "package" };

            if (element != undefined) {
              element.name = source.data.title;
              element.left = ui.position.left - thisOffset.left;
              element.top = ui.position.top - thisOffset.top;
              element.filepath = source.getAbsolutePath();
              var ename = iDiagram.Element(element.type, element);
            }
          }
        },
      })
      .attr("init", "true");
  }
}

export { DiagramDroppableDynatree };
