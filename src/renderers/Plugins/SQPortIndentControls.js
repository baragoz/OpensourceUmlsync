const LEFT_ARROW_SVG =
  "<svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M15 6L9 12L15 18' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>";
const RIGHT_ARROW_SVG =
  "<svg width='16' height='16' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M9 6L15 12L9 18' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>";

const INDENT_STEP_PX = 10;
// Matches the fixed box size set in .us-sqport-indent-btn (base.css) - the
// buttons start out display:none, so outerWidth()/outerHeight() can't be
// measured reliably the first time they're positioned.
const BUTTON_SIZE_PX = 20;
// Breathing room between the port's edge and the flanking buttons.
const BUTTON_GAP_PX = 15;

//
// Shows "<-"/"->" buttons flanking a selected SQPort, but only once it has
// been dropped onto an SQObjectInstance (i.e. element.parent is set).
// Clicking a button nudges the port's indent left/right in 10px steps,
// which SequenceDiagram.handleElementDragStop then honors when re-centering
// the port on its parent lifeline.
//
class SQPortIndentControls {
  constructor(diagram, blackboard) {
    this.diagram = diagram;
    this.blackboard = blackboard;
    this.currentElement = null;
    this.$menu = null;

    this.init(diagram, blackboard);
  }

  init(diagram, blackboard) {
    blackboard.addEventListener(
      "element:click",
      this.onShowMenu.bind(this),
    );

    blackboard.addEventListener(
      ["diagram:click", "connector:click"],
      this.onDeselect.bind(this),
    );
    blackboard.addEventListener(
      ["diagram:contextmenu", "element:contextmenu", "connector:contextmenu"],
      this.onDeselect.bind(this),
    );

    blackboard.addEventListener(
      ["element:drag:start", "connector:drag:start", "element:resize:start"],
      this.hide.bind(this),
    );

    blackboard.addEventListener(
      ["element:drag:stop", "element:resize:stop"],
      this.onElementReposition.bind(this),
    );

    this.isEditMode = blackboard.getStorageValue("editmode");
    blackboard.addEventListener(
      "storage:editmode",
      this.onEditModeChange.bind(this),
    );
  }

  onEditModeChange(change) {
    if (this.isEditMode == change.newValue) return;

    this.isEditMode = change.newValue;
    if (!this.isEditMode) {
      this.onDeselect();
    }
  }

  onShowMenu(element, data) {
    if (data.ctrl) {
      this.onDeselect();
      return;
    }

    this.currentElement = element;
    this.refresh();
  }

  onElementReposition(element) {
    if (!this.currentElement || this.currentElement !== element) {
      return;
    }
    this.refresh();
  }

  onDeselect() {
    this.currentElement = null;
    this.hide();
  }

  //
  // Re-evaluate whether the menu should be visible for the current element
  // and, if so, (re)build it and move it into place.
  //
  refresh() {
    const element = this.currentElement;
    if (
      !element ||
      !this.isEditMode ||
      element.options.nameTemplate !== "sqport" ||
      !element.parent
    ) {
      this.hide();
      return;
    }

    this.buildMenu();
    this.reposition(element);
    this.$menu.show();
  }

  buildMenu() {
    if (this.$menu) return;

    const self = this;
    $("#" + this.diagram.euid).append(
      "<div class='us-sqport-indent-menu' style='position:absolute;top:0px;left:0px;z-index:19999998;display:none;'>" +
        "<div class='us-sqport-indent-btn us-sqport-indent-left us-icon-menu-svg-wrapper' title='Decrease indent'>" +
        LEFT_ARROW_SVG +
        "</div>" +
        "<div class='us-sqport-indent-btn us-sqport-indent-right us-icon-menu-svg-wrapper' title='Increase indent'>" +
        RIGHT_ARROW_SVG +
        "</div>" +
        "</div>",
    );

    this.$menu = $("#" + this.diagram.euid + " > .us-sqport-indent-menu");
    this.$menu
      .find(".us-sqport-indent-left")
      .on("click", function (evt) {
        evt.stopPropagation();
        self.onNudge(-1);
      });
    this.$menu
      .find(".us-sqport-indent-right")
      .on("click", function (evt) {
        evt.stopPropagation();
        self.onNudge(1);
      });
  }

  reposition(element) {
    const offset = this.diagram.getDiagramOffset();
    const pz = element.nativeBorderRef.position();
    // position() gives the border box's outer-left/top edge, so the
    // opposite (right/bottom) edge needs outerWidth/Height (border +
    // padding included) to match - plain width()/height() are content-box
    // only and would sit the right button inside the selection border.
    const w = element.nativeBorderRef.outerWidth();
    const h = element.nativeBorderRef.outerHeight();

    const y = pz.top + offset.top + h / 2 - BUTTON_SIZE_PX / 2;

    this.$menu.find(".us-sqport-indent-left").css({
      left: pz.left + offset.left - BUTTON_SIZE_PX - BUTTON_GAP_PX,
      top: y,
    });
    this.$menu.find(".us-sqport-indent-right").css({
      left: pz.left + offset.left + w + BUTTON_GAP_PX,
      top: y,
    });
  }

  onNudge(delta) {
    const element = this.currentElement;
    if (!element || !element.parent) return;

    const opman = this.diagram.opman;
    if (opman) opman.begin();

    element.jsonModel.indent = (element.jsonModel.indent || 0) + delta;

    const parent = element.parent;
    const align =
      parent.jsonModel.left +
      parent.jsonModel.width / 2 -
      element.jsonModel.width / 2 +
      element.jsonModel.indent * INDENT_STEP_PX;
    element.nativeBorderRef.css("left", align);
    element.jsonModel.left = align;

    this.diagram.draw();
    this.reposition(element);

    if (opman) opman.commit();
  }

  hide() {
    if (this.$menu) {
      this.$menu.hide();
    }
  }
}

export { SQPortIndentControls };
