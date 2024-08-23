import { Component, DestroyRef, ElementRef, ViewChild } from '@angular/core';
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

  // Reference to the chat wrapper to scroll to the bottom of the chat.
  @ViewChild('chat', { static: true })
  bodyWrapper!: ElementRef<HTMLDivElement>;

  public llmMsg: string = '';

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private lmstudioService: LmstudioService,
    private destroyRef: DestroyRef
  ) {}
  ngOnInit() {
    this.email = this.auth.currentUser?.email || 'No user';
    this.messages = [];
    this.getData();
  }

  getData() {
    // let colRef = collection(
    //   this.firestore,
    //   'chat_msg',
    //   '2SXYR7ReXQm0Ayh5axrF',
    //   'msg'
    // );
    // getDocs(colRef)
    //   .then((querySnapShot) => {
    //     querySnapShot.forEach((doc) => {
    //       let data = doc.data();
    //       const msg: Message = {
    //         id: data['id'],
    //         text: data['text'],
    //         created_at: data['created_at'],
    //         isUser: data['isUser'],
    //       };

    //       this.messages.push(msg);
    //       console.log(msg);
    //     });
    //   })
    //   .catch((error) => {
    //     console.error('Error getting documents: ', error);
    //   });
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
    
    const newLMmsg: Message = {
      id: this.messages.length.toString(),
      text: this.llmMsg,
      created_at: new Date(),
      isUser: false,
    };
    this.messages.push(newLMmsg);

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
        next: (chunk) => {

          if(!chunk.startsWith('data')){
            this.messages[this.messages.length - 1].text = chunk
          }
        },
        error: (err) => console.error('Error receiving stream:', err),
        complete: () => {
          this.llmMsg = ''
          this.bodyWrapper.nativeElement.scrollTop =this.bodyWrapper.nativeElement.scrollHeight;
        },
      });
  }




}
