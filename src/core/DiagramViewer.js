import { ClassDiagram } from "../diagrams/ClassDiagram";
import { PackageDiagram } from "../diagrams/PackageDiagram";
import { ComponentsDiagram } from "../diagrams/ComponentsDiagram";
import { StateDiagram } from "../diagrams/StateDiagram";
import { SequenceDiagram } from "../diagrams/SequenceDiagram";


const defaultOptions = {
  id: 1,
};

class DiagramViewer {
    constructor(domSelector, overrideOptions)  {
        this.parentSelector = domSelector;

        this.options = { id: 1, globalId: 1, devmode: false, width: 1000, height: 500, ...overrideOptions};
        this.prefix = "e" + this.options.id;

        $(domSelector).append('<div id="' + this.prefix + '-dw-uml-area"><div id="dw-uml-sidebar"></div></div>');

        //
        // Update dimentions of the editor if hardcoded by page.
        //
        this.#updateDimention(this.options.width, this.options.height)
    }

    getNextGlobalId() {
        return this.options.globalId++;
    }


    //
    // Load an existing digaram - view mode by default
    //
    loadDiagram(jsonModel, extraOptions = {editmode: false}) {
        //
        // remove the previous one
        //
        if (this.digram) {
            this.digram.removeInstance(); // Remove previous instance of the diagram
            delete this.digram;
            this.digram = null;
        }

        // e1-d1-e5-o3 - make a complex prefix,based on hierarchy, to make a unique ids
        // e1 -editor 1 - instance
        // d1 - diagram, first loaded
        // e5 - element - 5th loaded
        // o3 - operations inside class element 3-rd instance
        jsonModel.id = this.getNextGlobalId();
        let diagramPrefix = this.prefix + "d" + this.getNextGlobalId();

        const diagramMap = {
            classDiagram: ClassDiagram,
            packageDiagram: PackageDiagram,
            componentsDiagram: ComponentsDiagram,
            stateDiagram: StateDiagram,
            sequenceDiagram: SequenceDiagram
        };
          
        const DiagramClassRef = diagramMap[jsonModel.nameTemplate];
          
        if (DiagramClassRef) {
            const options = {
              // TODO: define what could be controlled via potions ?
              ...extraOptions,
              // Make these options not overrideable for a while.
              width: this.options.width,
              height: this.options.height,
              // Check if editor do not want to allocate multiple canvas,
              // Uses for multi-tabs mode
              multicanvas: !this.options.shareCanvas,
              prefix: diagramPrefix,
              parentId: "#" + this.prefix + "-dw-uml-area",
            };
          
            this.digram = new DiagramClassRef(jsonModel, options);
        }

       return this.digram;
    }

    setOption(key, value) {
        if (key === "dimention") {
            this.#updateDimention(value.width, value.height);
        }
    }


    #updateDimention(width, height) {

        if (this.options.fitToParent) {
            // Always read size from the parent. Ignore passed width/height
            const rect = $(this.parentSelector)[0].getBoundingClientRect();
            width = rect.width;
            height = rect.height;
        } else {
           // Update UI
           var $par = $(this.parentSelector);
           $par.width(width);
           $par.height(height);
        }

        // TODO: replace the parent selector's width/height
        //       reduce width on side menu size, if edit mode
        //       and update diagram area finally
        if (this.digram) {
            let diagramWidth = width;
            
            // take in account sidemenu if editmode
            if (this.digram.options.editmode && this.sideMenu)
                diagramWidth -= this.sideMenu.width();

            this.digram.updateDimention(diagramWidth, height);
        }
    }
}

export { DiagramViewer }