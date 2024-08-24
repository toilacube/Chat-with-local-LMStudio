import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  private model = new BehaviorSubject<string>('lmstudio-ai/gemma-2b-it-GGUF/gemma-2b-it-q8_0.gguf')
  currentModel = this.model.asObservable()

  private systemPrompt = new BehaviorSubject<string>('')
  currentPrompt = this.systemPrompt.asObservable()
  constructor() { }

  updateModel(model: string){
    this.model.next(model)
  }

  updatePrompt(prompt: string){
    this.systemPrompt.next(prompt)
  }
}
