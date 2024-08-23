import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpDownloadProgressEvent,
  HttpEvent,
  HttpEventType,
  HttpProgressEvent,
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ChatCompletion } from '../models/reponse_data';

@Injectable({
  providedIn: 'root',
})
export class LmstudioService {
  constructor(private http: HttpClient) {}

  public sendMsg(model: string, message: string) {
    const body = {
      model: 'model-identifier',
      messages: [{ role: 'user', content: message }],
      max_tokens: -1,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: true,
      structured: { type: 'json' },
    };

    return this.http
      .post(`http://localhost:1234/v1/chat/completions`, body, {
        observe: 'events',
        responseType: 'text',
        reportProgress: true,
      })
      .pipe(
        filter(
          (event) =>
            event.type === HttpEventType.DownloadProgress ||
            event.type === HttpEventType.Response
        ),
        map((event: HttpEvent<any>) => {
          if (event.type === HttpEventType.Response) {
            return event.body;
          } else if (event.type === HttpEventType.DownloadProgress) {
            const process = event as HttpDownloadProgressEvent;
            const partialResponse = process.partialText || '';
            return this.parseChunk(partialResponse);
          }
          return '';
        })
      );
  }

  
  /*
    Responose data from LMStudio is a string. Each line is a object that contains a word from the response of LLM.
    It is called "object":"chat.completion.chunk".
    data: {"id":"chatcmpl-6oxly7cb0bqwvslpmfepmk","object":"chat.completion.chunk",
    "created":1724310345,"model":"lmstudio-ai/gemma-2b-it-GGUF/gemma-2b-it-q8_0.gguf","choices":[{"index":0,"delta":{"role":"assistant","content":" I"},"finish_reason":null}]}
    @param event 
   */

  public parseChunk(chunk: string) {
    let msges = '';
    const split_res = chunk.split('\n');
    split_res.forEach((chunk) => {
      const trim_res = chunk.trim();
      if (trim_res.startsWith('data: {')) {
        const data: ChatCompletion = JSON.parse(trim_res.substring(5)); // remove the 'data:', only keep the json object
        if (data.choices[0].finish_reason != 'stop')
          msges += data.choices[0].delta?.content;
      }
    });
    return msges;
  }
}
