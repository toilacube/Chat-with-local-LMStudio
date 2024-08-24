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
import { NavBarComponent } from "../../shared/components/nav-bar/nav-bar.component";
import { SharedDataService } from '../../services/shared-data.service';


@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [SendMessageComponent, MessageComponent, NavBarComponent],
  templateUrl: './chat-room.component.html',
  styleUrl: './chat-room.component.css',
})
export class ChatRoomComponent {
  public messages!: Message[];
  public response: string = '';
  public model: string = 'lmstudio-ai/gemma-2b-it-GGUF';
  public sysPrompt: string = ''

  // Subject to close the stream when the user sends a new message.
  private closeStreamSubject = new Subject<void>();

  // Reference to the chat wrapper to scroll to the bottom of the chat.
  @ViewChild('chat', { static: true })
  chat!: ElementRef;

  public llmMsg: string = '';

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private lmstudioService: LmstudioService,
    private destroyRef: DestroyRef,
    private modelService: SharedDataService,
  ) {
    this.modelService.currentModel.subscribe(model => this.model = model)
    this.modelService.currentPrompt.subscribe(prompt => this.sysPrompt = prompt)
  }
  ngOnInit() {
    this.messages = [];
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
    this.scrollToBottom()
  }

  sendMsgToLLM(message: string) {
    this.lmstudioService
      .sendMsg(this.model, message, this.sysPrompt)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        takeUntil(this.closeStreamSubject)
      )
      .subscribe({
        next: (chunk) => {

          if(!chunk.startsWith('data')){
            this.messages[this.messages.length - 1].text = chunk
            this.scrollToBottom()
          }
        },
        error: (err) => console.error('Error receiving stream:', err),
        complete: () => {
          this.llmMsg = ''
          this.scrollToBottom()
        },
      });
  }

  scrollToBottom(): void{
    try {
      this.chat.nativeElement.scrollTop =this.chat.nativeElement.scrollHeight;
    } catch(err){
      console.log(err)
    }
  }


}
