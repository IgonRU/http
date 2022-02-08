import {EventEmitter, Injectable} from '@angular/core';
import {IgonHttpConfig} from './igon-http-config';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {IgonHttpError} from './igon-http-error';
import {catchError, finalize, map} from 'rxjs/operators';
import {IgonHttpErrorService} from './igon-http-error.service';
import {FunctionsHelper} from '@igon/helper';
import {IgonHttpResponse} from './igon-http-response';
import {IgonHttpStateService} from './igon-http-state.service';

@Injectable()
export class IgonHttpService {

  hostName: string = null;

  config: IgonHttpConfig = null;

  set token(value: string) {
    this.httpState.token = value;
  }
  get token(): string {
    return this.httpState.token;
  }

  debugMode = false;

  constructor(protected httpConfig: IgonHttpConfig,
              protected http: HttpClient,
              protected httpError: IgonHttpErrorService,
              protected httpState: IgonHttpStateService) {

    this.config = httpConfig;
    this.hostName = httpConfig.hostName;
    this.debugMode = this.httpConfig.debugMode;

    if (this.debugMode) console.log('IgonHttpService constructor called!', this.httpConfig);
  }

  getErrorHandlerEvent(): EventEmitter<IgonHttpError> {
    return this.httpError.eventErrorHandled$;
  }

  private handleError(error: HttpErrorResponse): Observable<IgonHttpError> {
    if (this.debugMode) console.error('IgonHttpService handleError: ', error);

    const igonError = new IgonHttpError({error: error});

    this.httpError.eventErrorHandled$.emit(igonError);

    return throwError(igonError);
  }

  public sendGet(url: string, params: any = {}, options: any = {}, hostName: string = null, clearUrl = false): Observable<any> {
    if (this.debugMode) console.log('IgonHttpService  get: ', url, ', params: ', params, ', options: ', options, ', clearUrl: ', clearUrl);

    const host = hostName ? hostName : this.hostName;

    const fullUrl = clearUrl
      ? this.combineParams(url, {...this.getTokenParam(), ...params})
      : host + this.combineParams(url, {...this.getTokenParam(), ...params});

    return this.http.get(fullUrl,
      {withCredentials: true, ...options})
      .pipe(
        catchError((error) => this.handleError(error))
      );
  }

  public sendPost(url: string, data: any = {}, params: any = {}, options: any = {}, hostName: string = null): Observable<any> {
    if (this.debugMode) console.log('IgonHttpService post: ', url, ', params: ', params, ', data: ', data, ', options: ', options);

    const host = hostName ? hostName : this.hostName;

    return this.http.post(
      host + this.combineParams(url,
      {...this.getTokenParam()}),
      data,
      {withCredentials: true, ...options})
      .pipe(
        catchError((error) => this.handleError(error))
      );
  }

  public sendPut(url: string, data: any = {}, params: any = {}, hostName: string = null): Observable<any> {
    if (this.debugMode) console.log('IgonHttpService put: ', url, ', params: ', params, ', data: ', data);

    const host = hostName ? hostName : this.hostName;

    return this.http.put(host + this.combineParams(url, {...this.getTokenParam()}), data, {withCredentials: true})
      .pipe(
        catchError((error) => this.handleError(error))
      );
  }

  public sendDelete(url: string, params: any = {}, hostName: string = null): Observable<any> {
    if (this.debugMode) console.log('IgonHttpService delete: ', url, ', params: ', params);

    const host = hostName ? hostName : this.hostName;

    return this.http.delete(host + this.combineParams(url, {...this.getTokenParam(), ...params}), {withCredentials: true})
      .pipe(
        catchError((error) => this.handleError(error))
      );
  }

  private combineParams(url: string, params: any): string {
    const separator = url.indexOf('?') > -1 ? '&' : '?';
    const arrParams = [];
    for (let key in params) {
      arrParams.push(key + '=' + params[key]);
    }
    return url.concat(arrParams.length ? separator + arrParams.join('&') : '');
  }

  getTokenParam(): object {
    return {};
  }

  simpleGet(url: string, settings = {}): Observable<IgonHttpResponse> {
    let params = {};
    let options = {};
    let routeData = {};
    let pending = null;
    let hostName = null;

    if (Object.getOwnPropertyDescriptor(settings, 'params')) {
      params = settings['params'];
    }
    if (Object.getOwnPropertyDescriptor(settings, 'options')) {
      options = settings['options'];
    }
    if (Object.getOwnPropertyDescriptor(settings, 'routeData')) {
      routeData = settings['routeData'];
      if (routeData) {
        url = FunctionsHelper.parseTplUrl(url, {...routeData});
      }
    }
    if (Object.getOwnPropertyDescriptor(settings, 'pending')) {
      pending = settings['pending'];
    }
    if (Object.getOwnPropertyDescriptor(settings, 'hostName')) {
      hostName = settings['hostName'];
    }

    if (pending && Object.getOwnPropertyDescriptor(pending, 'loading')) {
      pending.loading = true;
    }
    return this.sendGet(url, params, options, hostName).pipe(
      map(response => new IgonHttpResponse(response)),
      catchError((error) => {
        return throwError(error);
      }),
      finalize(() => {
        if (pending && Object.getOwnPropertyDescriptor(pending, 'loading')) {
          pending.loading = false;
        }
      })
    );
  }

  simplePost(url: string, settings = {}): Observable<IgonHttpResponse> {
    let data = {};
    let params = {};
    let options = {};
    let routeData = {};
    let pending = null;
    let hostName = null;

    if (Object.getOwnPropertyDescriptor(settings, 'data')) {
      data = settings['data'];
    }
    if (Object.getOwnPropertyDescriptor(settings, 'params')) {
      params = settings['params'];
    }
    if (Object.getOwnPropertyDescriptor(settings, 'options')) {
      options = settings['options'];
    }
    if (Object.getOwnPropertyDescriptor(settings, 'routeData')) {
      routeData = settings['routeData'];
      if (routeData) {
        url = FunctionsHelper.parseTplUrl(url, {...routeData});
      }
    }
    if (Object.getOwnPropertyDescriptor(settings, 'pending')) {
      pending = settings['pending'];
    }
    if (Object.getOwnPropertyDescriptor(settings, 'hostName')) {
      hostName = settings['hostName'];
    }

    if (pending && Object.getOwnPropertyDescriptor(pending, 'loading')) {
      pending.loading = true;
    }
    return this.sendPost(url, data, params, options, hostName).pipe(
      map(response => new IgonHttpResponse(response)),
      catchError((error) => {
        return throwError(error);
      }),
      finalize(() => {
        if (pending && Object.getOwnPropertyDescriptor(pending, 'loading')) {
          pending.loading = false;
        }
      })
    );
  }

  simplePut(url: string, settings = {}): Observable<IgonHttpResponse> {
    let data = {};
    let params = {};
    let routeData = {};
    let pending = null;
    let hostName = null;

    if (Object.getOwnPropertyDescriptor(settings, 'data')) {
      data = settings['data'];
    }
    if (Object.getOwnPropertyDescriptor(settings, 'params')) {
      params = settings['params'];
    }
    if (Object.getOwnPropertyDescriptor(settings, 'routeData')) {
      routeData = settings['routeData'];
      if (routeData) {
        url = FunctionsHelper.parseTplUrl(url, {...routeData});
      }
    }
    if (Object.getOwnPropertyDescriptor(settings, 'pending')) {
      pending = settings['pending'];
    }
    if (Object.getOwnPropertyDescriptor(settings, 'hostName')) {
      hostName = settings['hostName'];
    }

    if (pending && Object.getOwnPropertyDescriptor(pending, 'loading')) {
      pending.loading = true;
    }
    return this.sendPut(url, data, params, hostName).pipe(
      map(response => new IgonHttpResponse(response)),
      catchError((error) => {
        return throwError(error);
      }),
      finalize(() => {
        if (pending && Object.getOwnPropertyDescriptor(pending, 'loading')) {
          pending.loading = false;
        }
      })
    );
  }

  simpleDelete(url: string, settings = {}): Observable<IgonHttpResponse> {
    let params = {};
    let routeData = {};
    let pending = null;
    let hostName = null;

    if (Object.getOwnPropertyDescriptor(settings, 'params')) {
      params = settings['params'];
    }
    if (Object.getOwnPropertyDescriptor(settings, 'pending')) {
      pending = settings['pending'];
    }
    if (Object.getOwnPropertyDescriptor(settings, 'routeData')) {
      routeData = settings['routeData'];
      if (routeData) {
        url = FunctionsHelper.parseTplUrl(url, {...routeData});
      }
    }
    if (Object.getOwnPropertyDescriptor(settings, 'hostName')) {
      hostName = settings['hostName'];
    }

    if (pending && Object.getOwnPropertyDescriptor(pending, 'loading')) {
      pending.loading = true;
    }

    return this.sendDelete(url, params, hostName).pipe(
      map(response => new IgonHttpResponse(response)),
      catchError((error) => {
        return throwError(error);
      }),
      finalize(() => {
        if (pending && Object.getOwnPropertyDescriptor(pending, 'loading')) {
          pending.loading = false;
        }
      })
    );
  }

  // simpleGet(url: string, params = {}, options = {}, pending = null): Observable<IgonHttpResponse> {
  //   if (pending && Object.getOwnPropertyDescriptor(pending, 'loading')) {
  //     pending.loading = true;
  //   }
  //   return this.sendGet(url, params, options).pipe(
  //     map(response => new IgonHttpResponse(response)),
  //     catchError((error) => {
  //       return throwError(error);
  //     }),
  //     finalize(() => {
  //       if (pending && Object.getOwnPropertyDescriptor(pending, 'loading')) {
  //         pending.loading = false;
  //       }
  //     })
  //   );
  // }
}
