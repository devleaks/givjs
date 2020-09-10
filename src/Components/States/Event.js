/**
 */

import { TIMESTAMP, ORG, CLASS, TYPE, DEVICE, PAYLOAD }

export class  Event {
  
  constructor(obj, desc) {
    this.timestamp = obj[desc[TIMESTAMP]]
    this.orgId = obj[desc[ORG]]
    this.classId = obj[desc[CLASS]]
    this.typeId = obj[desc[TYPE]]
    this.deviceId = obj[desc[DEVICE]]
    this.payload = obj[desc[PAYLOAD]]
  }

}