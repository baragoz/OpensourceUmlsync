import { ClassDiagram } from "../diagrams/ClassDiagram";
import { ComponentsDiagram } from "../diagrams/ComponentsDiagram";
import { PackageDiagram } from "../diagrams/PackageDiagram";
import { StateDiagram } from "../diagrams/StateDiagram";
import { ThumbnailPluginManager } from "../renderers/ThumbnailPluginManager";

const defaultOptions = {
  width: 200,
  height: 120,
  zoom: 0.2,
  prefix: "thr1",
};

class DiagramThumbnailRenderer {
  constructor(options) {
    // Extend the default options
    this.options = { ...defaultOptions, ...options };
    this.digrams = [];
    this.digramsCount = 0;
  }

  //
  // Load an existing digaram - view mode by default
  //
  loadDiagram(jsonModel, placeholder) {
    // Increase the diagram counter, to make a absolutely unique prefix for all diagrams
    this.digramsCount++;
    //
    // at this point we should provide a custom config which is different for editor and view
    //
    let pm = new ThumbnailPluginManager();

    var diagram = null;

    const diagramMap = {
      classDiagram: ClassDiagram,
      packageDiagram: PackageDiagram,
      componentsDiagram: ComponentsDiagram,
      stateDiagram: StateDiagram,
    };

    const DiagramRef = diagramMap[jsonModel.nameTemplate];

    if (DiagramRef) {
      const options = {
        width: 900,
        height: 600,
        ...this.options,
        parentId: placeholder,
        multicanvas: true,
        editmode: false,
        prefix: this.options.prefix + "d" + this.digramsCount,
        zoom: this.options.zoom,
      };

      diagram = new DiagramRef(jsonModel, options, pm);
      diagram.setUserData("plugin-manager", pm);

      // bind plugin manager to the diagram
      diagram.setUserData("plugin-manager", pm);
    }

    if (diagram) {
      this.digrams.push(diagram);
      return diagram.euid;
    }

    return "";
  }
}

export { DiagramThumbnailRenderer };
