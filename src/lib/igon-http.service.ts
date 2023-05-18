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
import {IgonHttpRequestSettings, IgonHttpRequestSettingsLike} from './igon-http-request-settings';

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

  simpleGet(url: string, settings: IgonHttpRequestSettingsLike = {}): Observable<IgonHttpResponse> {
    const requestSettings = new IgonHttpRequestSettings({
      url,
      method: 'GET',
      ...settings
    });

    const pending = requestSettings.get('pending');
    if (pending) {
      pending.loading = true;
    }

    return this.sendGet(
      requestSettings.parseUrl(),
      requestSettings.get('params'),
      requestSettings.get('options'),
      requestSettings.get('hostName')
    ).pipe(
      map(response => new IgonHttpResponse(response)),
      catchError((error) => {
        return throwError(error);
      }),
      finalize(() => {
        if (pending) {
          pending.loading = false;
        }
      })
    );
  }

  simplePost(url: string, settings: IgonHttpRequestSettingsLike = {}): Observable<IgonHttpResponse> {
    const requestSettings = new IgonHttpRequestSettings({
      url,
      method: 'POST',
      ...settings
    });

    const pending = requestSettings.get('pending');
    if (pending) {
      pending.loading = true;
    }

    return this.sendPost(
      requestSettings.parseUrl(url),
      requestSettings.get('data'),
      requestSettings.get('params'),
      requestSettings.get('options'),
      requestSettings.get('hostName')
    ).pipe(
      map(response => new IgonHttpResponse(response)),
      catchError((error) => {
        return throwError(error);
      }),
      finalize(() => {
        if (pending) {
          pending.loading = false;
        }
      })
    );
  }

  simplePut(url: string, settings: IgonHttpRequestSettingsLike = {}): Observable<IgonHttpResponse> {
    const requestSettings = new IgonHttpRequestSettings({
      url,
      method: 'PUT',
      ...settings
    });

    const pending = requestSettings.get('pending');
    if (pending) {
      pending.loading = true;
    }

    return this.sendPut(
      requestSettings.parseUrl(url),
      requestSettings.get('data'),
      requestSettings.get('params'),
      requestSettings.get('hostName')
    ).pipe(
      map(response => new IgonHttpResponse(response)),
      catchError((error) => {
        return throwError(error);
      }),
      finalize(() => {
        if (pending) {
          pending.loading = false;
        }
      })
    );
  }

  simpleDelete(url: string, settings: IgonHttpRequestSettingsLike = {}): Observable<IgonHttpResponse> {
    const requestSettings = new IgonHttpRequestSettings({
      url,
      method: 'DELETE',
      ...settings
    });

    const pending = requestSettings.get('pending');
    if (pending) {
      pending.loading = true;
    }

    return this.sendDelete(
      requestSettings.parseUrl(url),
      requestSettings.get('params'),
      requestSettings.get('hostName')
    ).pipe(
      map(response => new IgonHttpResponse(response)),
      catchError((error) => {
        return throwError(error);
      }),
      finalize(() => {
        if (pending) {
          pending.loading = false;
        }
      })
    );
  }
}
