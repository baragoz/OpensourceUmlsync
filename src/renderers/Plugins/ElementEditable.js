class ElementEditable {
  constructor(element, nativeBorderRef, blackboard, completionProvider) {
    this.element = element;
    this.completionProvider = completionProvider;
    this.init(element, nativeBorderRef, blackboard);

    this.isEditable = true; // TODO: read from BB
    blackboard.addEventListener(
      "storage:editmode",
      this.onEditModeChange.bind(this),
    );
  }

  //
  // Add element's resizeable options
  //
  init(element, nativeBorderRef, blackboard) {
    const completionProvider = this.completionProvider;

    //
    // Make Wrapped element resizeable
    //
    nativeBorderRef.find(".editablefield").editable({
      onSubmit: function (data) {
        let key = $(this).data("key");
        if (!key || key === "") {
          console.error(
            "Failed to find key data for element:" +
              element.options.nameTemplate,
          );
          key = "name";
        }
        console.log("KEY: " + key);

        const apply = () => {
          element.jsonModel[key] = data.current;
        };
        if (element.diagram && element.diagram.opman) {
          element.diagram.opman.record(apply);
        } else {
          apply();
        }
      },
      // See src/completion/ICompletionProvider.js - feeds
      // jquery.editable.js's existing onAutocomplete hook, which passes the
      // returned list straight into jQuery UI's .autocomplete() widget.
      onAutocomplete: function () {
        if (!completionProvider) {
          return null;
        }
        const key = $(this).data("key") || "name";
        return completionProvider.getSuggestions({
          key,
          elementType: element.options.nameTemplate,
          currentValue: element.jsonModel[key],
        });
      },
    });
  }

  onEditModeChange(change) {
    this.isEditable = change.newValue;
  }
}

export { ElementEditable };
