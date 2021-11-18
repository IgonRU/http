import {EventEmitter, Injectable} from "@angular/core";
import {IgonHttpError} from "./igon-http-error";

@Injectable()
export class IgonHttpErrorService {
  eventErrorHandled$: EventEmitter<IgonHttpError> = new EventEmitter<IgonHttpError>();

  constructor() {
    console.log('IgonHttpErrorService constructor called!');
  }
}
