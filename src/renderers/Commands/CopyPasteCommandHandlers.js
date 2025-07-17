

var local_cache = null;


function _cacheElement(element) {
    if (!element) {
        local_cache = null;
        return;
    }

    local_cache =  element.getDescription();

    console.log("LOCAL CACHE IS", local_cache);
    if (local_cache && local_cache.id) {
      // System should assign a new id, if we paste this element
      delete local_cache.id;
    }
}

function cutCommandHandler(element) {
    _cacheElement(element);
    //
    // Cut will automatically remove all connectors, and it could not restore them
    // on paste
    //
    let tmp = element.diagram
    tmp.removeElement(element);
}

function copyCommandHandler(element) {
    _cacheElement(element);
}

function pasteCommandHandler(diagram, data) {

    console.log("LOCAL CACHE IS", local_cache);
  if (diagram && local_cache) {
    // the same position as a context menu click on the diagram
    if (data && data.left && data.top) {
        local_cache = {...local_cache, left:data.left, top: data.top};
    }
    diagram.createElement(local_cache.nameTemplate, local_cache);
  }
}

function deleteCommandHandler(element) {
    if (element && element.diagram) {
        let diagram = element.diagram;
        let blackboard = diagram.getUserData("blackboard");
        if (blackboard) {
          blackboard.notify("element:before:remove", element);
        }

        let sharedData = {
            jsonModel : {...element.jsonModel},
            euid: element.euid
        };
        diagram.removeElement(element.euid);

        if (blackboard) {
          blackboard.notify("element:remove", sharedData);
        }
    }
}

function editCommandHandler(element) {
  if (element) {
    // trigger edit for the element + euid
  }
}

export { 
    cutCommandHandler, 
    copyCommandHandler, 
    pasteCommandHandler, 
    deleteCommandHandler,
    editCommandHandler
}