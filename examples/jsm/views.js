import UMLSync from "umlsync"; 

console.log(UMLSync); // Check if the module is loaded correctly

const classDiagramJson = `{"nameTemplate":"classDiagram","width":1058,"height":881,"globalId":6,"maxZIndex":1007,"elements":[{"width":293,"height":225,"left":84,"top":186,"name":"Common Test Package 33","id":1,"height_b":208,"nameTemplate":"package","z-index":1000},{"width":280,"height":165,"left":108,"top":540,"name":"Test long name LLLLLLLLLLL","aux":"Interface","operations":[{"id": 1, "text": "CreateSomething()"},{"id":2, "text":"updatePayload()"}],"attributes":[{"id":0, "text":"someField"},{"id":2, "text":"someField2"}],"id":2,"height_a":37,"nameTemplate":"class","z-index":1002},{"width":180,"height":56,"left":641,"top":705,"id":3,"nameTemplate":"note","z-index":1003},{"width":249,"height":114,"left":906,"top":531,"id":"class-1741231821631-zk9afgwkb","height_a":18,"nameTemplate":"class","z-index":1004}],"connectors":[{"id":1,"toId":3,"nameTemplate":"anchor","epoints":[{"x":665,"y":308, "id": 1},{"x":579,"y":572},{"x":741,"y":577},{"x":482,"y":637, "id": 3}],"stored":true}]}`;
const packageDiagramJson = `{"nameTemplate":"packageDiagram","width":1058,"height":881,"globalId":6,"maxZIndex":1007,"elements":[{"width":293,"height":225,"left":84,"top":186,"name":"Common Test Package 33","id":1,"height_b":208,"nameTemplate":"package","z-index":1000},{"width":280,"height":165,"left":108,"top":540,"name":"Test long name LLLLLLLLLLL","aux":"Interface","operations":[{"id": 1, "text": "CreateSomething()"},{"id":2, "text":"updatePayload()"}],"attributes":[{"id":0, "text":"someField"},{"id":2, "text":"someField2"}],"id":2,"height_a":37,"nameTemplate":"class","z-index":1002},{"width":180,"height":56,"left":641,"top":705,"id":3,"nameTemplate":"note","z-index":1003},{"width":249,"height":114,"left":906,"top":531,"id":"class-1741231821631-zk9afgwkb","height_a":18,"nameTemplate":"class","z-index":1004}],"connectors":[{"id":1,"toId":3,"nameTemplate":"anchor","epoints":[{"x":665,"y":308},{"x":579,"y":572},{"x":741,"y":577},{"x":482,"y":637}],"stored":true}]}`;
//const tmp2 = `{"nameTemplate":"classDiagram","id": 3, "elements":[{"width":293,"height":225,"left":84,"top":186,"name":"Common Test Package","id":1,"height_b":208,"nameTemplate":"package"},{"width":309,"height":147,"left":640,"top":80,"name":"test","aux":"","operations":["CreateSomething()","updatePayload()"],"attributes":["someField","someField2"],"id":"class-1741230265962-goj5x6za1","height_a":37,"nameTemplate":"class"},{"width":280,"height":165,"left":108,"top":540,"name":"Test long name LLLLLLLLLLL","aux":"Interface","operations":["CreateSomething()","updatePayload()"],"attributes":["someField","someField2"],"id":2,"height_a":37,"nameTemplate":"class"},{"width":180,"height":56,"left":641,"top":705,"id":3,"nameTemplate":"note"},{"width":249,"height":114,"left":906,"top":531,"id":"class-1741231821631-zk9afgwkb","height_a":18,"nameTemplate":"class"},{"width":140,"height":60,"left":62,"top":70,"name":"Class","id":"class-1741231919646-c2geio5i9","height_a":18,"nameTemplate":"class"},{"width":190,"height":66,"left":360,"top":44,"id":"note-1741231922983-ikna1ja77","nameTemplate":"note"}],"connectors":[{"id":"class-1741230265962-goj5x6za1","toId":2,"nameTemplate":"aggregation","epoints":[{"x":484,"y":140},{"x":611,"y":268},{"x":446,"y":318},{"x":588,"y":357},{"x":446,"y":396},{"x":611,"y":421}],"stored":true},{"id":1,"toId":3,"nameTemplate":"anchor","epoints":[{"x":665,"y":308},{"x":579,"y":572},{"x":741,"y":577},{"x":482,"y":637}],"stored":true},{"id":"class-1741230265962-goj5x6za1","toId":"class-1741231821631-zk9afgwkb","nameTemplate":"association","epoints":[{"x":1000,"y":160}],"stored":true},{"id":"class-1741231919646-c2geio5i9","toId":"note-1741231922983-ikna1ja77","nameTemplate":"anchor","epoints":[{"x":130,"y":178},{"x":413,"y":183}]}]}`;
const stateDiagramJson = `{"nameTemplate":"stateDiagram","width":1058,"height":881,"globalId":6,"maxZIndex":1007,"elements":[], "connectors":[]}`;

const sequenceDiagramJson = `{"nameTemplate":"sequenceDiagram","width":1058,"height":881,"globalId":6,"maxZIndex":1007,"elements":[], "connectors":[]}`;

const tmpClean = `{"nameTemplate":"classDiagram","width":1800,"height":800,"elements":[{"width":280,"height":165,"left":108,"top":540,"operations":[{"id":1,"text":"CreateSomething()"},{"id":2,"text":"updatePayload()"}],"attributes":[{"id":0,"text":"someField"},{"id":2,"text":"someField2"}],"name":"Test long name LLLLLLLLLLL","aux":"Interface","id":2,"height_a":37,"nameTemplate":"class","z-index":5001},{"width":249,"height":114,"left":184,"top":185,"operations":[],"attributes":[],"id":"class-1741231821631-zk9afgwkb","height_a":20,"nameTemplate":"class","z-index":5003,"name":"aasda ad asd "}],"connectors":[{"id":"class-1741231821631-zk9afgwkb","toId":2,"z-index":5007,"id":7,"nameTemplate":"composition","epoints":[{"x":266,"y":441}]}]}`;

const componentsDiagramJson = `{"nameTemplate":"componentsDiagram","width":1800,"height":800,"elements":[{"width":280,"height":165,"left":108,"top":540,"operations":[{"id":1,"text":"CreateSomething()"},{"id":2,"text":"updatePayload()"}],"attributes":[{"id":0,"text":"someField"},{"id":2,"text":"someField2"}],"name":"Test long name LLLLLLLLLLL","aux":"Interface","id":2,"height_a":37,"nameTemplate":"class","z-index":5001},{"width":249,"height":114,"left":184,"top":185,"operations":[],"attributes":[],"id":"class-1741231821631-zk9afgwkb","height_a":20,"nameTemplate":"class","z-index":5003,"name":"aasda ad asd "}],"connectors":[{"id":"class-1741231821631-zk9afgwkb","toId":2,"z-index":5007,"id":7,"nameTemplate":"composition","epoints":[{"x":266,"y":441}]}]}`;


const exampleMap = {
    classDiagram: {
        json: classDiagramJson,
        title: "Class Diagram"
    },
    packageDiagram: {
        json: packageDiagramJson,
        title: "Package Diagram"
    },
    stateDiagram: {
        json: stateDiagramJson,
        title: "State Diagram"
    },
    sequenceDiagram: {
        json: sequenceDiagramJson,
        title: "Sequence Diagram"
    },
    componentsDiagram: {
        json: componentsDiagramJson,
        title: "Components Diagram"
    }
};

// Create an array with 3 instances of exampleMap
const exampleMapArray = [
    exampleMap,
    exampleMap,
    exampleMap
];

function calculatePlaceholderSize(placeholderId) {
    const placeholder = $(placeholderId);
    return {
        width: placeholder.width(),
        height: placeholder.height()
    };
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function showErrorMessage(message) {
    const container = $("#us-diagrams-container");
    container.html(`
        <div style="padding: 2rem; text-align: center; color: #d32f2f; font-size: 1.2rem;">
            ${message}
        </div>
    `);
    // Update header title
    $("h1 .h1-title").text("UMLSync Show Multiple Diagrams - Error");
}

function loadExampleFromQuery() {
    const val = getQueryParam('val');
    
    // Parse val as integer
    const index = val !== null ? parseInt(val, 10) : null;
    
    // Check if index is valid
    if (index === null || isNaN(index) || index < 0 || index >= exampleMapArray.length) {
        showErrorMessage(`Invalid index: ${val}. Please provide a valid index between 0 and ${exampleMapArray.length - 1}.`);
        return;
    }
    
    // Get the exampleMap instance from the array
    const selectedExampleMap = exampleMapArray[index];
    
    // Get all diagram keys from the exampleMap
    const diagramKeys = Object.keys(selectedExampleMap);
    
    // Update header title
    $("h1 .h1-title").text(`Multiple Diagrams - Test ${index}`);
    
    // Create placeholders and load diagrams
    const container = $("#us-diagrams-container");
    let html = `<div style="display: flex; flex-direction: column; flex-grow: 1; overflow-y: auto;">`;
    
    // Create a placeholder for each diagram
    diagramKeys.forEach((key, idx) => {
        const placeholderId = `us-diagram-placeholder-${idx}`;
        html += `
            <div style="margin: 1rem; border: 1px solid #ccc; background-color: #f9f9f9;">
                <h2 style="padding: 0.5rem; background-color: #ddd; margin: 0; border-bottom: 1px solid #ccc;">
                    ${selectedExampleMap[key].title}
                </h2>
                <div id="${placeholderId}" style="width: 100%; height: 600px;"></div>
            </div>
        `;
    });
    
    html += `</div>`;
    container.html(html);
    
    // Wait for DOM to update, then load each diagram in view mode
    setTimeout(() => {
        diagramKeys.forEach((key, idx) => {
            const placeholderId = `#us-diagram-placeholder-${idx}`;
            const example = selectedExampleMap[key];
            const jsonModel = JSON.parse(example.json);
            const rect = calculatePlaceholderSize(placeholderId);
            
            const editor = new UMLSync.DiagramEditor(placeholderId, {
                width: rect.width,
                height: rect.height,
                fitToParent: true,
                devmode: true
            });
            
            // Load diagram in view mode (editMode: false)
            editor.loadDiagram(jsonModel, { 
                width: rect.width, 
                height: rect.height, 
                editmode: false 
            });
        });
    }, 0);
}

// Load example on page load based on query parameter
$(document).ready(() => {
    loadExampleFromQuery();
});

