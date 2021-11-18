import {ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {IgonHttpService} from './igon-http.service';
import {IgonHttpErrorService} from './igon-http-error.service';
import {IgonHttpConfig} from './igon-http-config';
import {IgonHttpStateService} from './igon-http-state.service';
import {IgonHttpInterceptor} from './igon-http.interceptor';


@NgModule({
  imports: [
    HttpClientModule
  ],
  providers: [],
  exports: [
    HttpClientModule
  ]
})
export class IgonHttpModule {
  constructor(private config: IgonHttpConfig,
              @Optional() @SkipSelf() parentModule?: IgonHttpModule) {
    if (this.config.debugMode) console.log('IgonHttpModule constructor called');

    if (parentModule) {
      throw new Error(
        'IgonHttpModule is already loaded. Import it in the AppModule only');
    }
  }

  public static forRoot(): ModuleWithProviders<IgonHttpModule> {
    return {
      ngModule: IgonHttpModule,
      providers: [
        IgonHttpService,
        IgonHttpErrorService,
        IgonHttpStateService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: IgonHttpInterceptor,
          multi: true
        }
      ]
    };
  }
}
