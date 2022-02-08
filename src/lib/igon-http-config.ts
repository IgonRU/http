export class IgonHttpConfig {
  hostName: string =  null;
  securityHostName: string = null;
  securityApi: string = null;
  debugMode = true;

  constructor(data: any = null) {
    if (data != null) {
      for (let key in data) {
        if (key in this) {
          if (Object.getOwnPropertyDescriptor(data, key)) {
            this[key] = data[key];
          }
        }
      }
    }
    if (this.securityHostName == null) this.securityHostName = this.hostName;
    if (this.securityApi == null) this.securityApi = this.hostName;
    if (this.debugMode) console.log('IgonHttpConfig constructor called!', this);
  }
}
