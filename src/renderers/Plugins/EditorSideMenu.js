import configLoader from "../../utils/ConfigLoader";

class EditorSideMenu  {
    constructor(placeholder, diagram, blackboard) {
        this.parentSelector = placeholder;
        this.diagram = diagram;
        this.blackboard = blackboard;
        //
        // TODO: could or should be shadow DOM - no need to share CSS for entire page
        //
        this.hostContainer = document.head;
        
        this.jsonFiles = // ["config/commonDiagram.json", "config/classDiagram.json", "config/packageDiagram.json"];
          ["componentDiagram", "classDiagram", "packageDiagram", "sequenceDiagram", "stateDiagram"];
        // Reference on diagram
        this.setDiagram(diagram);

        this.blackboard.addEventListener(
            'storage:editmode', this.onEditModeChange.bind(this));
    }

    setDiagram(diagram) {
        this.diagram = diagram;
        this.loadSidebar();
    }

    async loadSidebar() {
        const sidebar = document.createElement("div");
        sidebar.classList.add("sidebar");

        for (const file of this.jsonFiles) {
            const diagrams = await this.loadJSON(file);
            diagrams.forEach(diagram => {
                const header = this.createMenuHeader(diagram.menuHeader);
                const listContainer = document.createElement("div");
                listContainer.classList.add("menu-list");
                listContainer.style.display = "none"; // Initially collapsed

                // Add Elements
                if (diagram.elements?.length) {
                    const elementsContainer = document.createElement("div");
                    elementsContainer.classList.add("menu-list-elements");
                    diagram.elements.forEach(item => elementsContainer.appendChild(this.createMenuItem(item)));
                    listContainer.appendChild(elementsContainer);
                    // Add Divider if we have 2 lists only
                    if (diagram.connectors?.length) listContainer.appendChild(this.createDivider());
                }

                // Add Connectors
                if (diagram.connectors?.length) {
                    const connectorsContainer = document.createElement("div");
                    connectorsContainer.classList.add("menu-list-connectors");
                    diagram.connectors.forEach(item => connectorsContainer.appendChild(this.createMenuItem(item)));
                    listContainer.appendChild(connectorsContainer);
                }

                header.addEventListener("click", () => {
                    listContainer.style.display = listContainer.style.display === "block" ? "none" : "block";
                });

                sidebar.appendChild(header);
                sidebar.appendChild(listContainer);
            });
        }

        $(this.parentSelector).innerHTML = ""; // Clear previous content
        this.hostContainer.appendChild(this.createStyle());
        // this.hostContainer.appendChild(this.iconsStyle());
        // this.hostContainer.appendChild(this.fontStyle());
        $(this.parentSelector).append(sidebar);
    }

    async loadJSON(file) {
        try {
            var x = configLoader.getConfig(file);
            if (x) {
                return x;
            }
            const response = await fetch("assets/config/" + file + ".json");
            return await response.json();
        } catch (error) {
            console.error("Error loading JSON:", file, error);
            return [];
        }
    }

    createMenuHeader(title) {
        const header = document.createElement("button");
        header.innerHTML = `
          <div class="header-container">
            <span class="header-label">` + title + `</span>
          </div>
          <div class="header-icon-frame-wrapper">
            <div class="header-icon-frame"><div class="icon-common-trailing"></div></div>
          </div>`;
        header.classList.add("menu-header");
        return header;
    }

    createMenuItem(item) {
        const link = document.createElement("div");
        link.innerHTML = `
            <div class="menu-item-frame">
              <div class="menu-item-list-variant">
                  <div class="menu-item-svg">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.3 18H11.7C16.2 18 18 16.2 18 11.7V6.3C18 1.8 16.2 0 11.7 0H6.3C1.8 0 0 1.8 0 6.3V11.7C0 16.2 1.8 18 6.3 18Z" fill="#0BCA6E"/>
                  </svg>
                  </div>
                  <div class="icons-sprite ` + (item?.css || "") + ` us-side-menu-icon"></div>
              </div>
              <span class="diagram-name">` + (item.description || "Unknown")+ `</span>
            </div>
        `;
        link.classList.add("menu-item");
        link.addEventListener("click", (event) => {
            this.onItemClick(item);
        });
        return link;
    }

    onItemClick(item) {
        //
        // Create an element instance
        //
        if (this.diagram) {
            if (item.element && item.element != "") {
              this.diagram.Element(item.element, item.jsonModel|| {});
            }

            if (item.connector && item.connector != "") {
                this.diagram.Connector(item.connector, {
                    fromId: null,
                    toId: null,
                    epoints: [ {x: 100, y: 100}, {x: 200, y: 100}]
                });
            }
        }
    }

    createDivider() {
        const divider = document.createElement("div");
        divider.classList.add("divider");
        return divider;
    }

    //
	// TODO: It was intendent  when we used shadow DOM, but not it is not needed,
	//       Need some work-around if we decide to enable it again,
	//       because it is not possile to inject icons.css as url path, we need 
	//       to import it as text into this file, or something similar
    iconsStyle() {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/assets/styles/icons.css";
      return link;
    }

    createStyle() {
        const style = document.createElement("style");
        style.textContent = `
:root {
  --default-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "Source Han Sans CN", sans-serif;
}


.sidebar {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-wrap: nowrap;
  gap: 5px;
  position: relative;
  width: 228px;
  height: calc(100% - 20px);
  margin: 0 auto;
  padding: 10px 10px 10px 10px;
  background: #f5f9fe;
  border-radius: 10px;
  overflow-y: auto;
            }
.menu-header {
display: flex;
    align-items: center;
    justify-content: space-between;
    align-self: stretch;
    flex-wrap: nowrap;
    flex-shrink: 0;
    position: relative;
    min-width: 0;
    min-height: 40px;
    padding: 8px 16px 8px 16px;
    cursor: pointer;
    background: #8e92bc;
    border: none;
    border-radius: 10px;
}
.header-container {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  flex-shrink: 0;
  position: relative;
  width: 136px;
  padding: 0 4px 0 4px;
  z-index: 1;
}
.header-label {
  flex-shrink: 0;
  flex-basis: auto;
  position: relative;
  height: 21px;
  color: #ffffff;
  font-family: Nunito Sans, var(--default-font-family);
  font-size: 14px;
  font-weight: 700;
  line-height: 21px;
  text-align: left;
  white-space: nowrap;
  letter-spacing: -0.28px;
  z-index: 2;
}
            .menu-header:hover {
                background-color: #34495E;
            }
.header-icon-frame-wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: nowrap;
    flex-shrink: 0;
    gap: 5px;
    position: relative;
    width: 12px;
    z-index: 3;
}
.header-icon-frame {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: nowrap;
    flex-shrink: 0;
    gap: 5px;
    position: relative;
    width: 12px;
    height: 18px;
    z-index: 4;
}

.icon-common-trailing{
    flex-shrink: 0;
    position: relative;
    width: 12px;
    height: 12px;
    background-size: cover;
    z-index: 5;
}

            .menu-list {
                display: flex;
    flex-direction: column;
    align-items: flex-start;
    align-self: stretch;
    flex-wrap: nowrap;
    flex-shrink: 0;
    position: relative;
    z-index: 13;
            }
            .menu-item {
                display: flex;
    align-items: center;
    align-self: stretch;
    flex-wrap: nowrap;
    flex-shrink: 0;
    gap: 5px;
    position: relative;
    padding: 7px 10px 7px 10px;
    z-index: 14;
    border-radius: 6px;
                cursor: pointer;
            }
            
            
            .menu-item:hover {
                background-color: #54577A;
            }
            
            .menu-item-frame {
                    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    flex-shrink: 0;
    gap: 5px;
    position: relative;
    width: 53px;
    z-index: 15;
            }

.menu-item-svg {
  position:absolute;
}

.menu-list-elements {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    align-self: stretch;
    flex-wrap: nowrap;
    flex-shrink: 0;
    position: relative;
    z-index: 13;
}

.menu-list-divider {
    align-self: stretch;
    flex-shrink: 0;
    position: relative;
    height: 1px;
    background: green;
    background-size: cover;
    z-index: 49;
}

.menu-list-connectors {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    align-self: stretch;
    flex-wrap: nowrap;
    flex-shrink: 0;
    position: relative;
    z-index: 50;
}

.menu-item span {
    flex-shrink: 0;
    flex-basis: auto;
    position: relative;
    height: 16px;
    color: #54577a;
    font-family: 'Nunito Sans', var(--default-font-family);
    font-size: 12px;
    font-weight: 400;
    line-height: 16px;
    text-align: left;
    white-space: nowrap;
    letter-spacing: -0.12px;
    z-index: 18;
}

.menu-item-list-variant {
    flex-shrink: 0;
    position: relative;
    width: 18px;
    height: 18px;
}

.divider {
    border-top: 1px solid #566573;
    margin: 5px 0;
}
        `;
        return style;
    }

    fontStyle() {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;700&display=swap";
        return link;
    }

    //
    // @valuePair - oldValue/newValue
    //
    onEditModeChange(valueChange) {
        //
        // Show/hide an entire menu
        //
        if (valueChange.newValue) {
            $("#dw-uml-sidebar").addClass("us-show-sidemenu").show();
        } else {
            $("#dw-uml-sidebar").removeClass("us-show-sidemenu").hide();
        }
    }
}

export { EditorSideMenu }
