# IgonHttp

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.2.4.

## Install
Run `npm install @igon/http`

## Configure
Add next value to main app module providers section:
```
providers: [
    {
      provide: IgonHttpConfig,
      useValue: new IgonHttpConfig(
        {
          hostName: 'http://ebs.local/api/v2/',
          debugMode: true
        }
      )
    },
],
```
# igon-http
