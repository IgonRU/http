import {EventEmitter, Injectable} from '@angular/core';
import {IgonHttpConfig} from './igon-http-config';

@Injectable()
export class IgonHttpStateService {

  tokenRefreshIsInProgress = false;

  _token: string = null;
  set token(newToken: string) {
    localStorage.setItem('lanToken', newToken);
    this._token = newToken;
  }
  get token(): string {
    return this._token;
  }

  _refreshToken: string = null;
  set refreshToken(newToken: string) {
    localStorage.setItem('lanRefreshToken', newToken);
    this._refreshToken = newToken;
  }
  get refreshToken(): string {
    return this._refreshToken;
  }

  $eventSignoutInvoked: EventEmitter<any> = new EventEmitter<any>();
  $eventError401: EventEmitter<any> = new EventEmitter<any>();

  constructor(protected httpConfig: IgonHttpConfig) {
    console.log('IgonHttpStateService constructor called!');
  }

  refreshTokenUpdate() {
    // this.refreshToken = this.getCookie('lan_refresh_token');
  }

  public getCookie(name: string): string {
    let ca: Array<string> = document.cookie.split(';');
    let caLen: number = ca.length;
    let cookieName = `${name}=`;
    let c: string;

    for (let i: number = 0; i < caLen; i += 1) {
      c = ca[i].replace(/^\s+/g, '');
      if (c.indexOf(cookieName) == 0) {
        return c.substring(cookieName.length, c.length);
      }
    }
    return '';
  }

}
