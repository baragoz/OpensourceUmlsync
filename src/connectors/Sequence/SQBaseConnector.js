import {BaseConnector} from '../BaseConnector';

const defaultOptions = {
  nameTemplate: 'sqbase'
}

class SQABaseConnector extends BaseConnector {
  constructor(options, jsonModel, diagram) {
    super({...defaultOptions, ...options}, jsonModel, diagram);
  }

  canRemovePoint() {
    return true;
  }
}
