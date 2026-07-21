class ElementEditable {
    constructor(element, nativeBorderRef, blackboard) {
      this.element = element;
      this.init(element, nativeBorderRef, blackboard);

      this.isEditable = true; // TODO: read from BB
      blackboard.addEventListener(
        'storage:editmode', this.onEditModeChange.bind(this));

    }

    //
    // Add element's resizeable options
    //
    init(element, nativeBorderRef, blackboard) {
        //
        // Make Wrapped element resizeable
        //
        nativeBorderRef.find(".editablefield").editable({
            onSubmit:  function(data) {
                let key = $(this).data("key");
                if (!key || key === '') {
                    console.error("Failed to find key data for element:" + element.options.nameTemplate);
                    key = "name";
                }
                console.log("KEY: " + key);

                const apply = () => { element.jsonModel[key] = data.current; };
                if (element.diagram && element.diagram.opman) {
                    element.diagram.opman.record(apply);
                } else {
                    apply();
                }
            }
        });
    }

    onEditModeChange(change) {
      this.isEditable =  change.newValue;
    }
}

export { ElementEditable }