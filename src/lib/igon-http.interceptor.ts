import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, of, Subject, throwError} from 'rxjs';
import {IgonHttpService} from './igon-http.service';
import {IgonHttpStateService} from './igon-http-state.service';
import {Injectable, Optional, SkipSelf} from '@angular/core';
import {catchError, switchMap, tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {IgonHttpConfig} from './igon-http-config';

@Injectable()
export class IgonHttpInterceptor implements HttpInterceptor {

  tokenRefreshedSource = new Subject();
  tokenRefreshed$ = this.tokenRefreshedSource.asObservable();

  constructor(private httpService: IgonHttpService,
              private stateService: IgonHttpStateService,
              private configService: IgonHttpConfig,
              private router: Router) {
    if (this.configService.debugMode) console.log('IgonHttpInterceptor constructor called!');
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.configService.debugMode) console.log('Intercented!', req);
    return next.handle(req)
      .pipe(
        tap(response => {
          console.log('IgonHttpInterceptor intercept tap response', response);
        }),
        catchError(error => {
          return this.handleResponseError(error, req, next);
        })
      );
  }

  refreshToken(): Observable<any> {
    if (this.stateService.tokenRefreshIsInProgress) {
      return new Observable(observer => {
        this.tokenRefreshed$.subscribe(() => {
          observer.next();
          observer.complete();
        });
      });
    } else {
      this.stateService.tokenRefreshIsInProgress = true;
      if (this.configService.debugMode) console.log('Should ask for new token!');
      return this.httpService.simpleGet('/jwt_token?refresh=' + this.stateService.refreshToken, {hostName: this.configService.securityApi})
        .pipe(
          tap((response) => {
            this.stateService.tokenRefreshIsInProgress = false;
            this.stateService.token = response.data.access_token;
            this.stateService.refreshToken = response.data.refresh_token;
            this.tokenRefreshedSource.next();
          }),
          catchError((error) => {
            this.stateService.tokenRefreshIsInProgress = false;
            this.stateService.$eventSignoutInvoked.emit(error);
            return throwError(error);
          })
        );
    }
  }

  handleResponseError(error, request?, next?): Observable<any> {
    if (this.configService.debugMode) console.log('IgonHttpInterceptor handleResponseError ', error);

    if (error.status === 511) {
      this.stateService.refreshToken = error.error.data.refresh;
      // this.stateService.refreshTokenUpdate();

      return this.refreshToken()
        .pipe(
          switchMap(() => {
            // request = this.addAuthHeader(request);
            return next.handle(request);
          }),
          catchError(error => {
            if (error.status !== 511) {
              return this.handleResponseError(error);
            } else {
              return throwError(error);
            }
          })
        );
    }

    // Неавторизован
    if (error.status === 401) {
      if (this.configService.debugMode) console.log('IgonHttpInterceptor handleResponseError error status 401', error);
      this.stateService.$eventSignoutInvoked.emit(error);
      this.stateService.$eventError401.emit(error);
      return throwError(error);
    }

    return throwError(error);
  }
}
