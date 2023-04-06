import {FunctionsHelper} from '@igon/helper';

export interface IgonHttpRequestSettingsLike {
  data?;
  params?;
  options?;
  routeData?;
  pending?;
  hostName?;

  requestData?;
}

export class IgonHttpRequestSettings implements IgonHttpRequestSettingsLike {
  url: string = '';
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET';

  data = {}; // Данные для передачи в payload запроса POST или PUT
  params = {}; // Данные для передачи в строке запроса в качестве GET-параметра
  options = {}; // Настройки запроса
  routeData = {}; // Данные для подстановки в url запроса
  pending = null; // Объект формата { loading }, если передан, статус loading меняется true/false в зависимости от активности запроса
  hostName = null; // используется в случае, если необходимо обратиться к домену, отличному от домена хоста (кроссдоменные запросы)

  /*
    requestData - свойство, в которое помещаются все данные, которые необходимо отправить с запросом, в формате key: value
    В случае, если переменная key имеется в шаблоне url, она подставляется в url и не отправляется другим способом
    Переменные, отсутствующие в url отправляются с запросом в соответствии с его типом:
    GET, DELETE - добавляются в строку запроса в качестве GET параметров, объединяются с params
    POST, PUT - отправляются в payload запроса, объединяются с data
  */
  requestData = {};

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

  /**
   * Возвращает значение свойства.
   * Свойства 'params' и 'data' объединаются с данным из this.requestData, которые не указаны в шаблоне this.url
   * @param settingName - наименование свойства
   */
  get(settingName: string): any {
    let result;

    if (Object.getOwnPropertyDescriptor(this, settingName)) {
      switch (settingName) {
        case 'params':
          if ((this.method === 'GET' || this.method === 'DELETE') && this.requestData) {
            result = {...this.getRequestDataCleared(), ...this.params};
          }
          break;
        case 'data':
          if ((this.method === 'POST' || this.method === 'PUT') && this.requestData) {
            result = {...this.getRequestDataCleared(), ...this.data};
          }
          break;
        default:
          result = this[settingName];
      }
      // if (settingName === 'params') {
      //   if ((this.method === 'GET' || this.method === 'DELETE') && this.requestData) {
      //     result = {...this.getRequestDataCleared(), ...this.params};
      //   }
      // } else {
      //   result = this[settingName];
      // }
    }

    return result;
  }

  /**
   * Возвращает обработанный URL без домена, в котором переменные шаблона заменены на соответствующие значения
   * Данные для замены переменных шаблона URL берутся из requestData и routeData
   * @param url - строка-шаблон
   */
  parseUrl(url?: string): string {
    let result = '';

    if (this.routeData || this.requestData) {
      result = FunctionsHelper.parseTplUrl(url ? url : this.url, {...this.requestData, ...this.routeData});
    }

    //console.log('IgonHttpRequestSettings parseUrl ', this.getTemplateKeys(url ? url : this.url), url ? url : this.url, result, {...this.requestData, ...this.routeData});

    return result;
  }

  /**
   * Возвращает список переменных в шаблоне
   * @param urlTemplate - строка-шаблон. Если не передана - берется this.url
   */
  getTemplateKeys(urlTemplate?: string): string[] {
    urlTemplate = urlTemplate ? urlTemplate : this.url;

    const templatesFound = urlTemplate.match(/\$\{.+?}/g);

    return templatesFound ? templatesFound.map(item => item.substr(2, item.length - 3).trim()) : templatesFound;
  }

  /**
   * Возвращает параметры из this.requestData, которые не указаны в качестве переменных в шаблоне this.url
   * в формате объекта { key: value, key2: value2... }
   */
  getRequestDataCleared(): any {
    let clearedData = {};
    const excludedKeys = this.getTemplateKeys();

    if (excludedKeys) {
      for (const key in this.requestData) {
        // console.log('getRequestDataCleared key in this.requestData ', key, excludedKeys);
        if (excludedKeys.filter(item => item === key).length === 0) {
          clearedData[key] = this.requestData[key];
        }
      }
    } else {
      clearedData = { ...this.requestData };
    }

    //console.log('getRequestDataCleared excludedKeys, clearedData ', excludedKeys, clearedData);

    return clearedData;
  }
}
