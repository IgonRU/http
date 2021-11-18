import {HttpErrorResponse} from "@angular/common/http";

export class IgonHttpError {
  error: HttpErrorResponse = null;

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
