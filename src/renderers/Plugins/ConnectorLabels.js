import { BaseConnector } from "../../connectors/BaseConnector";
import { Blackboard } from "../../utils/Blackboard";

class ConnectorLabels {
  /**
   *
   * @param {BaseConnector} connector
   * @param {Blackboard} blackboard
   */
  constructor(connector, blackboard) {
    this.connector = connector;
    this.blackboard = blackboard;

    this.init(connector, blackboard);

    this.editMode = true;

    // Disable/enable sortable and resizeable areas
    blackboard.addEventListener(
      "storage:editmode",
      this.onEditModeChange.bind(this),
    );
  }

  onEditModeChange(change) {
    if (this.editMode == change.newValue) {
      // Do nothing, edit mode is the same
      return;
    }

    this.editMode = change.newValue;

    for (let t in this.connector.labels) {
      let $label = this.connector.labels[t];
      $label.draggable(this.editMode ? "enable" : "disable");
      $label.editable(this.editMode ? "enable" : "disable");
    }
  }

  #handleInitialLabels() {
    if (!this.connector || !this.connector.labels) {
      return;
    }
    for (let t in this.connector.labels) {
      let id = this.connector.labels[t].id();
    }
  }

  onAddLabel(data) {
    //
    // Add a new label to connector at position
    //
    let offset = this.connector.diagram.getDiagramOffset();
    let euid = this.connector.addLabel({
      left: data.left + offset.left + 30,
      top: data.top + offset.top + 10,
      text: "Add some ...",
    });

    this.#makeLabelInteractive(euid);
  }

  #makeLabelInteractive(euid) {
    let self = this;
    $("#" + euid)
      .draggable({
        start: function (event, ui) {
          let p = ui.helper.position();
          $(this).data("start-drag-position", p);

          //
          // Notify about lable drag start
          //
          self.blackboard.notify("connector:label:drag_stop", self.connector, {
            id: $(this).data("label-id"),
            left: p.left,
            top: p.top,
          });
        },
        stop: function (event, ui) {
          var idx;
          var pos = $(this).data("start-drag-position");
          var p = ui.helper.position();

          // TODO: check if we need + scrollOffset ???
          self.connector.update({
            labels: [
              { id: $(this).data("label-id"), left: p.left, top: p.top },
            ],
          });

          self.blackboard.notify("connector:label:drag_stop", self.connector, {
            id: $(this).data("label-id"),
            left: p.left,
            top: p.top,
          });
        },
      })
      .mouseenter(self, function () {
        // It is up to base diagram/connector to support highlight
        // or not for the view mode
        self.connector._setOption("highlighted", true);
      })
      .mouseleave(self, function () {
        // It is up to base diagram/connector to support highlight
        // or not for the view mode
        self.connector._setOption("highlighted", false);
      })
      .children("a")
      .editable({
        onSubmit: function (data) {
          if (data["current"] == data["previous"]) return;

          const lid = $(this).parent().data("label-id");
          //
          // Remove label if input is empty...
          //
          if (data["current"] == "") {
            self.connector.rmLabel({ id: lid });
            return;
          }

          self.connector.update({
            labels: [{ id: lid, text: data["current"] }],
          });

          self.blackboard.notify("connector:label:update", self.connector, {
            id: lid,
            text: data["current"],
          });

          return true;
        },
      })
      .bind(
        "contextmenu",
        /**
         *
         * @param {Event} e
         */
        function (e) {
          e.preventDefault();
          e.stopPropagation();

          self.blackboard.notify(
            "connector:label:contextmenu",
            self.connector,
            {
              id: $(this).parent().data("label-id"),
              x: e.pageX,
              y: e.pageY,
            },
          );
        },
      );

    // Create label/ position it, and append to the connector if user save it
    // make it editable
    this.blackboard.notify("connector:label:add", this.connector, { index: 0 });
  }

  onEditLabel(data) {
    // toggle editable

    // this.connector.update({ target: "labels", index: 0, value: "new Label"});
    this.blackboard.notify("connector:label:update", this.connector, {
      index: 0,
    });
  }

  onRemoveLabel(data, extraData) {
    this.connector.rmLabel(data);

    // notify
    this.blackboard.notify("connector:label:remove", this.connector, {
      index: 0,
    });
  }

  /**
   * Make interactive an initial labels
   *
   * @param {BaseConnector} connector
   * @param {Blackboard} blackboard
   */
  init(connector, blackboard) {
    if (connector.labels && connector.labels.length > 0) {
      for (let i in connector.labels) {
        let leuid = connector.labels[i].attr("id");
        if (leuid) {
          this.#makeLabelInteractive(leuid);
        }
      }
    }
  }
}

export { ConnectorLabels };
