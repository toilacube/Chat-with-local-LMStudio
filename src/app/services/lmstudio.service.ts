import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LmstudioService {
  constructor(private http: HttpClient) {}

  public sendMsg(model: string, message: string){

    const body = {
      model: 'model-identifier',
      messages: [
        { role: 'user', content: message }
      ],
      max_tokens: -1,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: true,
      structured: { type: 'json' }
    }

    return this.http.post(`http://localhost:1234/v1/chat/completions`, body, {
      observe: "events",
      responseType: 'text',
      reportProgress: true
    })
  }
}
