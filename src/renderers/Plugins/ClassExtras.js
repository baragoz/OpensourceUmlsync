class ClassExtras {
  constructor(classElement, blackboard) {
    this.element = classElement;
    this.blackboard = blackboard;
    this.init(classElement, blackboard);

    // Disable/enable sortable and resizeable areas
    blackboard.addEventListener(
        'storage:editmode', this.onEditModeChange.bind(this));
  }

  onEditModeChange(change) {
    $('#' + this.element.euid + ' .us-class-attributes')
        .resizable(change.newValue ? 'enable' : 'disable');
    $('#' + this.element.euid + ' .us-class-operations .us-sortable')
        .sortable(change.newValue ? 'enable' : 'disable');
    $('#' + this.element.euid + ' .us-class-attributes .us-sortable')
        .sortable(change.newValue ? 'enable' : 'disable');
  }

  //
  // Unified onSubmit handler
  //
  onSubmitHandler(dType, data, id) {
    if (data['current'] === data['previous']) return;

    if (data['current'] === '') {
      if (dType === 'attributes') {
        this.onRemoveAttribute({ id });
      } else if (dType === 'operations') {
        this.onRemoveOperation({ id });
      }
      return false; // Prevent further processing
    }

    //
    // TODO:  this.element.update({ with instruction })
    //

    //
    // Find attribute or title in the model, and replace the text
    //
    for (let i = 0; i < this.element.jsonModel[dType].length; ++i) {
      if (this.element.jsonModel[dType][i].id == id) {
        this.element.jsonModel[dType][i].text = data['current'];
        break;
      } 
    }

    this.blackboard.notify(
        `class:${dType}:edit`, this.element,
        {oldValue: data['previous'], newValue: data['current']}
    );

    return true;
  }

  //
  // Unified get sortable handler
  //
  getSortableHandler(element, blackboard, dType) {
    return {
      start: (event, ui) => {
        ui.item.data('start_pos', ui.item.index());
      },
      stop: (event, ui) => {
        const start_pos = ui.item.data('start_pos');
        const index = ui.item.index();
        if (index === start_pos) return;

        //
        // TODO: element.update({ with instructions })
        //       element.update-> diagram.onJsonChange->editor.onJsonChange->bb.notify
        //
        let tmp = element.jsonModel[dType].splice(start_pos, 1);
        if (tmp.length == 0) {
          return;
        }
        element.jsonModel[dType].splice(index, 0, tmp[0]);
        console.log("Splice index from start " + start_pos + "to stop " + index, element.jsonModel[dType], tmp);

        blackboard.notify(`class:${dType}:sort`, element, {start: start_pos, end: index});
      }
    };
  }

  onAddAttribute(data) {
    let newAttribute = this.element.addAttribute(data, data.index);

    //
    // Make a new item editable
    //
    let self = this;
    newAttribute
    .children('a')
    .bind('contextmenu', function(e) {
      console.log("CONTEXT MENUX ID : " + this.id);
      e.preventDefault();
      e.stopPropagation();
      self.blackboard.notify(
          'class:field:contextmenu', self.element, {attributeId: this.id, x: e.pageX, y: e.pageY});
    })
    .editable({
      onSubmit:  function(data) {
        const id = $(this).data('uid');
        self.onSubmitHandler('attributes', data, id);
      }
    });

    //
    // Refresh sortable list
    //
    this.refreshSortable('attributes');
  }

  onAddOperation(data) {
    let newOperation = this.element.addOperation(data, data.index);

    let self = this;
    newOperation
    .children('a')
    .bind('contextmenu', function(e) {
      e.preventDefault();
      e.stopPropagation();
      self.blackboard.notify(
          'class:method:contextmenu', self.element, {operationId: this.id, x: e.pageX, y: e.pageY});
    })
    .editable({
      onSubmit: function(data) {
        const id = $(this).data('uid');
        self.onSubmitHandler('operations', data, id);
      }
    });

    this.refreshSortable('operations');
  }

  onRemoveAttribute(data) {
    const attributeList = this.element.nativeRef.find(".us-class-attributes .us-sortable");
    const attributeItems = attributeList.children('li');
    if (data.id) {
      for (let i=0; i<this.element.jsonModel.attributes.length; ++i) {
        if (this.element.jsonModel.attributes[i].id == data.id) {
          data.index = i;
          break;
        }
      }
    }

    if (data.index !== undefined) {
      // Remove by index
      attributeItems.eq(data.index).remove();
      this.removeJsonModelItem(data.index, 'attributes');
    } else if (data.attributeId) {
      alert("UPDATE CODE !!!!")
      // Remove by ID
      attributeList.find(`#attribute-${data.id}`).parent('li').remove();
      this.element.jsonModel.attributes[data.attributeId]; 11111
    }

    this.refreshSortable('attributes');
  }

  onRemoveOperation(data) {
    const operationList = this.element.nativeRef.find(".us-class-operations .us-sortable");
    const operationItems = operationList.children('li');

    if (data.id) {
      for (let i=0; i<this.element.jsonModel.operations.length; ++i) {
        if (this.element.jsonModel.operations[i].id == data.id) {
          data.index = i;
          break;
        }
      }
    }

    if (data.index !== undefined) {
      // Remove by index
      operationItems.eq(data.index).remove();
      this.removeJsonModelItem(data.index, 'operations');
    } else if (data.operationId) {
      alert("UPDATE CODE !!!");
      // Remove by ID
      operationList.find(`#${data.operationId}`).parent('li').remove();
      delete this.element.jsonModel.operations[data.operationId];
    }

    this.refreshSortable('operations');
  }


  removeJsonModelItem(index, dType) {
    this.element.jsonModel[dType].splice(index, 1);
  }

  onEditAttribute(data) {
    this.triggerEditable(data, 'attributes');
  }

  onEditOperation(data) {
    this.triggerEditable(data, 'operations');
  }

  triggerEditable(data, dType) {
    const list = this.element.nativeRef.find(`.us-class-${dType} .us-sortable`);
    let target;

    if (data.index !== undefined) {
      target = list.children('li').eq(data.index).children('a');
    } else if (data.attributeId || data.operationId) {
      target = list.find(`#${data.attributeId || data.operationId}`);
    }

    if (target && target.length) {
      target.trigger('click');
    }
  }

  refreshSortable(dType) {
    this.element.nativeRef.find(`.us-class-${dType} .us-sortable`).sortable('refresh');
  }

  init(element, blackboard) {
    const border = '#' + element.euid + '_Border';

    //
    // Custom resizeable for attributes area only !!!!
    //
    element.nativeRef.find('.us-class-attributes').resizable({
      'handles': 's-l',
      'alsoResize': border,
      'start': () => {
        element._update();
        blackboard.notify('element:resize:start', element, {
          height_a: element.jsonModel.height_a,
          height: element.jsonModel.height
        });
      },
      'stop': (event, ui) => {
        element._update();
        element.nativeRef.find('.us-class-attributes').css({'width': ''});
        blackboard.notify('element:resize:stop', element, {
          height_a: element.jsonModel.height_a,
          height: element.jsonModel.height
        });
      }
    });

    let self = this;

    //
    // Bind sortable and editable for operations
    //
    element.nativeRef.find(".us-class-operations .us-sortable")
        .sortable(this.getSortableHandler(element, blackboard, 'operations'))
        .disableSelection()
        .find('li>a')
        .editable({
          onSubmit: function(data) {
            const id = $(this).data('uid');
            self.onSubmitHandler('operations', data, id);
          }
        });

    // Bind sortable and editable for attributes
    element.nativeRef.find(".us-class-attributes .us-sortable")
        .sortable(this.getSortableHandler(element, blackboard, 'attributes'))
        .disableSelection();
    
    element.nativeRef.find(".us-class-attributes .us-sortable li a")
        .editable({
          onSubmit: function(data) {
            const id = $(this).data('uid');
            self.onSubmitHandler('attributes', data, id);
          }
        });

    this.initContextMenu(element, blackboard);
  }

  //
  // Context menu should callback to this class instance
  // with a corresponding action
  //
  initContextMenu(element, blackboard) {
    element.nativeRef.find('#operation>a')
        .on('contextmenu', function(e) {
          console.log("CONTEXT MENU FOR MMMMMMMMMMMMMMMMMMM ETHOD");
          e.preventDefault();
          e.stopPropagation();
          blackboard.notify(
              'class:method:contextmenu', element, {operationId: this.id, x: e.pageX, y: e.pageY});
        });

    element.nativeRef.find('#attribute > a')
        .on('contextmenu', function(e) {
          e.preventDefault();
          e.stopPropagation();
          blackboard.notify(
              'class:field:contextmenu', element, {attributeId: this.id, x: e.pageX, y: e.pageY});
        });
  }

}

export {ClassExtras}