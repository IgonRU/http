export class IgonHttpResponse {
  data: any = null;
  error: string = null;
  status: string = null;
  type: string = null;

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
  }
}
