import UMLSync from "umlsync";

// See src/completion/ICompletionProvider.js: getSuggestions() must be
// synchronous and return the full candidate list - jQuery UI's
// .autocomplete() widget (wired in via ElementEditable.js) handles
// prefix-matching/filtering as the user types.
class NameListCompletionProvider {
  constructor(textarea) {
    this.textarea = textarea;
  }

  getSuggestions(context) {
    if (context.key !== "name") {
      return [];
    }
    return this.textarea.value
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
  }
}

const DIAGRAM_CONFIG = {
  class: {
    title: "Test Autocompletion - Class Diagram",
    hint:
      "Comma-separated names below are offered as autocomplete suggestions while renaming the class (double-click its name to edit it).",
    defaultNames: "Order, Customer, Product, Invoice, PaymentGateway, ShippingService",
    jsonModel: {
      nameTemplate: "classDiagram",
      width: 1058,
      height: 600,
      elements: [
        {
          id: 1,
          nameTemplate: "class",
          name: "MyClass",
          aux: "",
          attributes: [],
          operations: [],
          left: 80,
          top: 60,
          width: 200,
          height: 120,
        },
      ],
      connectors: [],
    },
  },
  sequence: {
    title: "Test Autocompletion - Sequence Diagram",
    hint:
      "Comma-separated names below are offered as autocomplete suggestions while renaming the object instance (double-click its name to edit it).",
    defaultNames: "OrderService, PaymentService, InventoryService, NotificationService",
    jsonModel: {
      nameTemplate: "sequenceDiagram",
      width: 1058,
      height: 600,
      elements: [
        {
          id: 1,
          nameTemplate: "sqobject_instance",
          name: "MyObject",
          left: 80,
          top: 20,
        },
      ],
      connectors: [],
    },
  },
};

function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

$(document).ready(() => {
  const config = DIAGRAM_CONFIG[getQueryParam("val")] || DIAGRAM_CONFIG.class;

  $("h1 .h1-title").text(config.title);
  $(".us-ac-hint").text(config.hint);

  const textarea = document.getElementById("us-ac-namelist");
  textarea.value = config.defaultNames;

  const placeholder = $("#us-ac-diagram-placeholder");
  const rect = { width: placeholder.width(), height: placeholder.height() };

  const editor = new UMLSync.DiagramEditor("#us-ac-diagram-placeholder", {
    width: rect.width,
    height: rect.height,
    fitToParent: true,
    devmode: true,
  });

  editor.registerCompletionProvider(new NameListCompletionProvider(textarea));

  editor.loadDiagram(config.jsonModel, {
    width: rect.width,
    height: rect.height,
    editmode: true,
  });
});
