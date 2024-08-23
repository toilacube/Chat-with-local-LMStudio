import { Component, DestroyRef } from '@angular/core';
import { SendMessageComponent } from '../../shared/components/send-message/send-message.component';
import { MessageComponent } from '../../shared/components/message/message.component';
import { Message } from '../../models/message.model';
import { Auth } from '@angular/fire/auth';
import { LMStudioClient } from '@lmstudio/sdk';
import {
  collection,
  doc,
  DocumentData,
  Firestore,
  getDoc,
  getDocs,
  QuerySnapshot,
} from '@angular/fire/firestore';
import { LmstudioService } from '../../services/lmstudio.service';
import {
  HttpClient,
  HttpDownloadProgressEvent,
  HttpEvent,
  HttpEventType,
} from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, takeUntil } from 'rxjs';
import { error } from 'console';
import { ChatCompletion } from '../../models/reponse_data';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [SendMessageComponent, MessageComponent],
  templateUrl: './chat-room.component.html',
  styleUrl: './chat-room.component.css',
})
export class ChatRoomComponent {
  private email!: string;
  public messages!: Message[];
  public response: string = '';
  public model: string = 'lmstudio-ai/gemma-2b-it-GGUF';

  // Subject to close the stream when the user sends a new message.
  private closeStreamSubject = new Subject<void>();
  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private lmstudioService: LmstudioService,
    private destroyRef: DestroyRef
  ) {}
  public llmMsg: string = '';

  ngOnInit() {
    this.email = this.auth.currentUser?.email || 'No user';
    this.messages = [];
    this.getData();
  }

  getData() {
    let colRef = collection(
      this.firestore,
      'chat_msg',
      '2SXYR7ReXQm0Ayh5axrF',
      'msg'
    );
    getDocs(colRef)
      .then((querySnapShot) => {
        querySnapShot.forEach((doc) => {
          let data = doc.data();
          const msg: Message = {
            id: data['id'],
            text: data['text'],
            created_at: data['created_at'],
            isUser: data['isUser'],
          };

          this.messages.push(msg);
          console.log(msg);
        });
      })
      .catch((error) => {
        console.error('Error getting documents: ', error);
      });
  }

  onSendMsg(newMsg: string) {
    // console.log(newMsg)
    const msg: Message = {
      id: this.messages.length.toString(),
      text: newMsg,
      created_at: new Date(),
      isUser: true,
    };
    this.messages.push(msg);
    this.sendMsgToLLM(msg.text);
  }

  sendMsgToLLM(message: string) {
    this.lmstudioService
      .sendMsg(this.model, message)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        takeUntil(this.closeStreamSubject)
      )
      .subscribe({
        next: (event) => {
          this.startReceiveStreamResponse(event);
        },
        error: (error) => {
          console.error(error);
        },
      });
  }

  /*
    Responose data from LMStudio is a string. Each line is a object that contains a word from the response of LLM.
    It is called "object":"chat.completion.chunk".
    data: {"id":"chatcmpl-6oxly7cb0bqwvslpmfepmk","object":"chat.completion.chunk",
    "created":1724310345,"model":"lmstudio-ai/gemma-2b-it-GGUF/gemma-2b-it-q8_0.gguf","choices":[{"index":0,"delta":{"role":"assistant","content":" I"},"finish_reason":null}]}
    @param event 
   */
  startReceiveStreamResponse(event: HttpEvent<string>) {
    if (event.type === HttpEventType.DownloadProgress) {
      const progress = event as HttpDownloadProgressEvent;
      const msges: ChatCompletion[] = this.paresResponse(
        progress.partialText || ''
      ); // list of each words as an object from LMstudio response
      // console.log(msges)
      let finalMsg = '';
      msges.forEach((msg) => {
        msg.choices.forEach((choice) => {
          if (choice.delta.content) {
            finalMsg += choice.delta.content;
          }
        });
      });
      const msg: Message = {
        id: this.messages.length.toString(),
        text: finalMsg,
        created_at: new Date(),
        isUser: false,
      };
      this.messages.push(msg);
    }
  }

  /**
   *
   * @param res the response data from LMstudio
   */
  paresResponse(res: string) {
    const msges: ChatCompletion[] = [];
    const split_res = res.split('\n');
    split_res.forEach((res) => {
      const trim_res = res.trim();
      if (trim_res.startsWith('data: {')) {
        const data: ChatCompletion = JSON.parse(trim_res.substring(5)); // remove the 'data:', only keep the json object
        msges.push(data);
      }
    });
    return msges;
  }
}
