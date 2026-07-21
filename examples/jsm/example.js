import UMLSync from "umlsync"; 

console.log(UMLSync); // Check if the module is loaded correctly

const classDiagramJson = `{"nameTemplate":"classDiagram","width":1058,"height":881,"globalId":6,"maxZIndex":1007,"elements":[{"width":293,"height":225,"left":84,"top":186,"name":"Common Test Package 33","id":1,"height_b":208,"nameTemplate":"package","z-index":1000},{"width":280,"height":165,"left":108,"top":540,"name":"Test long name LLLLLLLLLLL","aux":"Interface","operations":[{"id": 1, "text": "CreateSomething()"},{"id":2, "text":"updatePayload()"}],"attributes":[{"id":0, "text":"someField"},{"id":2, "text":"someField2"}],"id":2,"height_a":37,"nameTemplate":"class","z-index":1002},{"width":180,"height":56,"left":641,"top":705,"id":3,"nameTemplate":"note","z-index":1003},{"width":249,"height":114,"left":906,"top":531,"id":"class-1741231821631-zk9afgwkb","height_a":18,"nameTemplate":"class","z-index":1004}],"connectors":[{"id":1,"nameTemplate":"anchor","epoints":[{"x":665,"y":308, "id": 1},{"x":579,"y":572},{"x":741,"y":577},{"x":482,"y":637, "id": 3}],"stored":true}]}`;
const packageDiagramJson = `{"nameTemplate":"packageDiagram","width":1058,"height":881,"globalId":6,"maxZIndex":1007,"elements":[{"width":293,"height":225,"left":84,"top":186,"name":"Common Test Package 33","id":1,"height_b":208,"nameTemplate":"package","z-index":1000},{"width":280,"height":165,"left":108,"top":540,"name":"Test long name LLLLLLLLLLL","aux":"Interface","operations":[{"id": 1, "text": "CreateSomething()"},{"id":2, "text":"updatePayload()"}],"attributes":[{"id":0, "text":"someField"},{"id":2, "text":"someField2"}],"id":2,"height_a":37,"nameTemplate":"class","z-index":1002},{"width":180,"height":56,"left":641,"top":705,"id":3,"nameTemplate":"note","z-index":1003},{"width":249,"height":114,"left":906,"top":531,"id":"class-1741231821631-zk9afgwkb","height_a":18,"nameTemplate":"class","z-index":1004}],"connectors":[{"id":1,"nameTemplate":"anchor","epoints":[{"x":665,"y":308},{"x":579,"y":572},{"x":741,"y":577},{"x":482,"y":637}],"stored":true}]}`;
//const tmp2 = `{"nameTemplate":"classDiagram","id": 3, "elements":[{"width":293,"height":225,"left":84,"top":186,"name":"Common Test Package","id":1,"height_b":208,"nameTemplate":"package"},{"width":309,"height":147,"left":640,"top":80,"name":"test","aux":"","operations":["CreateSomething()","updatePayload()"],"attributes":["someField","someField2"],"id":"class-1741230265962-goj5x6za1","height_a":37,"nameTemplate":"class"},{"width":280,"height":165,"left":108,"top":540,"name":"Test long name LLLLLLLLLLL","aux":"Interface","operations":["CreateSomething()","updatePayload()"],"attributes":["someField","someField2"],"id":2,"height_a":37,"nameTemplate":"class"},{"width":180,"height":56,"left":641,"top":705,"id":3,"nameTemplate":"note"},{"width":249,"height":114,"left":906,"top":531,"id":"class-1741231821631-zk9afgwkb","height_a":18,"nameTemplate":"class"},{"width":140,"height":60,"left":62,"top":70,"name":"Class","id":"class-1741231919646-c2geio5i9","height_a":18,"nameTemplate":"class"},{"width":190,"height":66,"left":360,"top":44,"id":"note-1741231922983-ikna1ja77","nameTemplate":"note"}],"connectors":[{"id":"class-1741230265962-goj5x6za1","nameTemplate":"aggregation","epoints":[{"x":484,"y":140},{"x":611,"y":268},{"x":446,"y":318},{"x":588,"y":357},{"x":446,"y":396},{"x":611,"y":421}],"stored":true},{"id":1,"nameTemplate":"anchor","epoints":[{"x":665,"y":308},{"x":579,"y":572},{"x":741,"y":577},{"x":482,"y":637}],"stored":true},{"id":"class-1741230265962-goj5x6za1","nameTemplate":"association","epoints":[{"x":1000,"y":160}],"stored":true},{"id":"class-1741231919646-c2geio5i9","nameTemplate":"anchor","epoints":[{"x":130,"y":178},{"x":413,"y":183}]}]}`;

const stateDiagramJson = `{  "nameTemplate": "stateDiagram",  "width": 1595,  "height": 918,  "elements": [    {      "width": 130,      "height": 35,      "left": 38,      "top": 114,      "name": "State",      "font-family": "Arial",      "font-size": "16px",      "font-color": "#040406",      "color": "#ffffff",      "bold": false,      "italic": false,      "underline": false,      "text": "Text",      "z-index": 5000,      "id": 3,      "nameTemplate": "state"    },    {      "width": 35,      "height": 35,      "left": 82,      "top": 20,      "name": "Finish",      "font-family": "Arial",      "font-size": "16px",      "font-color": "#040406",      "color": "#ffffff",      "bold": false,      "italic": false,      "underline": false,      "text": "Text",      "z-index": 5001,      "id": 4,      "nameTemplate": "statefinal"    },    {      "width": 126,      "height": 33,      "left": 252,      "top": 210,      "name": "Design",      "font-family": "Arial",      "font-size": "16px",      "font-color": "#040406",      "color": "#ffffff",      "bold": false,      "italic": false,      "underline": false,      "text": "Text",      "z-index": 5002,      "id": 7,      "nameTemplate": "statedesign"    },    {      "width": 130,      "height": 35,      "left": 38,      "top": 318,      "name": "State",      "font-family": "Arial",      "font-size": "16px",      "font-color": "#040406",      "color": "#ffffff",      "bold": false,      "italic": false,      "underline": false,      "text": "Text",      "z-index": 5005,      "id": 9,      "nameTemplate": "state"    },    {      "width": 35,      "height": 35,      "left": 284,      "top": 386,      "name": "Start",      "font-family": "Arial",      "font-size": "16px",      "font-color": "#040406",      "color": "#ffffff",      "bold": false,      "italic": false,      "underline": false,      "text": "Text",      "z-index": 5007,      "id": 11,      "nameTemplate": "statestart"    }  ],  "connectors": [    {                  "epoints": [        {          "x": 114,          "y": 86        },        {          "x": 106,          "y": 90        },        {          "x": 116,          "y": 134        }      ],      "color": "#000000",      "line-width": 2,      "font-family": "Arial",      "font-size": "16px",      "font-color": "#000000",      "font-bg": "#ffffff",      "bold": false,      "italic": false,      "underline": false,      "text": "Label",      "z-index": 5003,      "id": 5,      "nameTemplate": "transition",      "stored": true    },    {                  "epoints": [        {          "x": 165,          "y": 131        },        {          "x": 315,          "y": 136        },        {          "x": 318,          "y": 207        }      ],      "color": "#000000",      "line-width": 2,      "font-family": "Arial",      "font-size": "16px",      "font-color": "#000000",      "font-bg": "#ffffff",      "bold": false,      "italic": false,      "underline": false,      "text": "Label",      "z-index": 5004,      "id": 6,      "nameTemplate": "transition",      "stored": true    },    {                  "epoints": [        {          "x": 263,          "y": 232        },        {          "x": 116,          "y": 231        },        {          "x": 116,          "y": 321        }      ],      "color": "#000000",      "line-width": 2,      "font-family": "Arial",      "font-size": "16px",      "font-color": "#000000",      "font-bg": "#ffffff",      "bold": false,      "italic": false,      "underline": false,      "text": "Label",      "z-index": 5006,      "id": 8,      "nameTemplate": "transition",      "stored": true    },    {                  "epoints": [        {          "x": 135,          "y": 345        },        {          "x": 99,          "y": 408        },        {          "x": 291,          "y": 415        }      ],      "color": "#000000",      "line-width": 2,      "font-family": "Arial",      "font-size": "16px",      "font-color": "#000000",      "font-bg": "#ffffff",      "bold": false,      "italic": false,      "underline": false,      "text": "Label",      "z-index": 5010,      "id": 12,      "nameTemplate": "transition",      "stored": true    },    {                  "epoints": [        {          "x": 155,          "y": 328,          "id": 9        },        {          "x": 126,          "y": 145,          "id": 3        }      ],      "color": "#000000",      "line-width": 2,      "font-family": "Arial",      "font-size": "16px",      "font-color": "#000000",      "font-bg": "#ffffff",      "bold": false,      "italic": false,      "underline": false,      "text": "Label",      "z-index": 5011,      "id": 14,      "nameTemplate": "transition"    },    {                  "epoints": [        {          "x": 155,          "y": 139,          "id": 3        },        {          "x": 321,          "y": 138        },        {          "x": 327,          "y": 231,          "id": 7        }      ],      "color": "#000000",      "line-width": 2,      "font-family": "Arial",      "font-size": "16px",      "font-color": "#000000",      "font-bg": "#ffffff",      "bold": false,      "italic": false,      "underline": false,      "text": "Label",      "z-index": 5012,      "id": 15,      "nameTemplate": "transition"    }  ]}`;

const sequenceDiagramJson = `{"nameTemplate":"sequenceDiagram","width":1058,"height":881,"globalId":6,"maxZIndex":1007,"elements":[], "connectors":[]}`;

const tmpClean = `{"nameTemplate":"classDiagram","width":1800,"height":800,"elements":[{"width":280,"height":165,"left":108,"top":540,"operations":[{"id":1,"text":"CreateSomething()"},{"id":2,"text":"updatePayload()"}],"attributes":[{"id":0,"text":"someField"},{"id":2,"text":"someField2"}],"name":"Test long name LLLLLLLLLLL","aux":"Interface","id":2,"height_a":37,"nameTemplate":"class","z-index":5001},{"width":249,"height":114,"left":184,"top":185,"operations":[],"attributes":[],"id":"class-1741231821631-zk9afgwkb","height_a":20,"nameTemplate":"class","z-index":5003,"name":"aasda ad asd "}],"connectors":[{"id":"class-1741231821631-zk9afgwkb","z-index":5007,"id":7,"nameTemplate":"composition","epoints":[{"x":266,"y":441}]}]}`;

const componentsDiagramJson = `{"nameTemplate":"componentsDiagram","width":1800,"height":800,"elements":[{"width":280,"height":165,"left":108,"top":540,"operations":[{"id":1,"text":"CreateSomething()"},{"id":2,"text":"updatePayload()"}],"attributes":[{"id":0,"text":"someField"},{"id":2,"text":"someField2"}],"name":"Test long name LLLLLLLLLLL","aux":"Interface","id":2,"height_a":37,"nameTemplate":"class","z-index":5001},{"width":249,"height":114,"left":184,"top":185,"operations":[],"attributes":[],"id":"class-1741231821631-zk9afgwkb","height_a":20,"nameTemplate":"class","z-index":5003,"name":"aasda ad asd "}],"connectors":[{"id":"class-1741231821631-zk9afgwkb","z-index":5007,"id":7,"nameTemplate":"composition","epoints":[{"x":266,"y":441}]}]}`;


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

function calculatePlaceholderSize() {
    const placeholder = $("#us-class-diagram-placeholder");
    return {
        width: placeholder.width(),
        height: placeholder.height()
    };
}

const rect = calculatePlaceholderSize();

const editor = new UMLSync.DiagramEditor("#us-class-diagram-placeholder", {
    width: rect.width,
    height: rect.height,
    fitToParent: true,
    devmode: true
});

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function loadExampleFromQuery() {
    const val = getQueryParam('val');
    if (val && exampleMap[val]) {
        const example = exampleMap[val];
        const jsonModel = JSON.parse(example.json);
        console.log("PARSED MODEL IS:", rect);
        const editMode = true; // Default to edit mode
        editor.loadDiagram(jsonModel, { width: rect.width, height: rect.height, editmode: editMode });

        // Update the header title
        $("h1 .h1-title").text(example.title);
        
        // Update Edit/View button text based on initial mode
        $("#us-ex-edit-view").text(editMode ? "View" : "Edit");
        $("#us-ex-edit-view").attr('title', editMode ? "Switch to View Mode" : "Switch to Edit Mode");
    }
}

// Load example on page load based on query parameter
$(document).ready(() => {
    loadExampleFromQuery();
    setupHeaderButtons();
});

function updateUndoRedoButtons(state) {
    $("#us-ex-undo").prop('disabled', !(state && state.canUndo));
    $("#us-ex-redo").prop('disabled', !(state && state.canRedo));
}

function setupHeaderButtons() {
    // Undo button
    $("#us-ex-undo").on('click', function() {
        if (editor.digram && editor.digram.opman) {
            editor.digram.opman.undo();
        }
    });

    // Redo button
    $("#us-ex-redo").on('click', function() {
        if (editor.digram && editor.digram.opman) {
            editor.digram.opman.redo();
        }
    });

    // Keep undo/redo buttons in sync with the diagram's history
    if (editor.digram && editor.digram.opman) {
        const opman = editor.digram.opman;
        updateUndoRedoButtons({ canUndo: opman.canUndo(), canRedo: opman.canRedo() });

        const blackboard = editor.digram.getUserData("blackboard");
        if (blackboard) {
            blackboard.addEventListener('opman:changed', updateUndoRedoButtons);
        }
    }

    // Show JSON button
    $("#us-ex-show-json").on('click', function() {
        if (editor.digram) {
            const jsonModel = editor.digram.getDescription();
            const jsonString = JSON.stringify(jsonModel, null, 2);
            
            // Create a modal or use window.prompt/alert for simplicity
            // For better UX, you could create a modal dialog
            const newWindow = window.open("", "_blank", "width=800,height=600");
            if (newWindow) {
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>Diagram JSON Model</title>
                            <style>
                                body {
                                    font-family: monospace;
                                    padding: 20px;
                                    background: #f5f5f5;
                                }
                                pre {
                                    background: white;
                                    padding: 15px;
                                    border-radius: 5px;
                                    overflow: auto;
                                    border: 1px solid #ddd;
                                }
                                button {
                                    padding: 10px 20px;
                                    margin: 10px 5px;
                                    cursor: pointer;
                                    background: #007bff;
                                    color: white;
                                    border: none;
                                    border-radius: 4px;
                                }
                                button:hover {
                                    background: #0056b3;
                                }
                            </style>
                        </head>
                        <body>
                            <h2>Diagram JSON Model</h2>
                            <button onclick="copyToClipboard()">Copy to Clipboard</button>
                            <button onclick="window.close()">Close</button>
                            <pre id="json-content">${jsonString}</pre>
                            <script>
                                function copyToClipboard() {
                                    const content = document.getElementById('json-content').textContent;
                                    navigator.clipboard.writeText(content).then(() => {
                                        alert('JSON copied to clipboard!');
                                    });
                                }
                            </script>
                        </body>
                    </html>
                `);
                newWindow.document.close();
            } else {
                // Fallback to alert if popup is blocked
                alert("Please allow popups to view JSON. JSON:\n\n" + jsonString);
            }
        } else {
            alert("No diagram loaded");
        }
    });

    // Edit/View toggle button
    $("#us-ex-edit-view").on('click', function() {
        if (!editor.digram) {
            alert("No diagram loaded");
            return;
        }

        const currentMode = editor.digram.options.editmode;
        const newMode = !currentMode;
        
        // Update edit mode via editor
        editor.setOption('editmode', newMode);
        
        // Update button text
        $(this).text(newMode ? "View" : "Edit");
        $(this).attr('title', newMode ? "Switch to View Mode" : "Switch to Edit Mode");
    });
}
