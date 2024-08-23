import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'app-send-message',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './send-message.component.html',
  styleUrl: './send-message.component.css'
})
export class SendMessageComponent {

  @Output() sendMsg = new EventEmitter<string>()

  text = new FormControl('')

  onSendMsg(){
    if(this.text.value){
      this.sendMsg.emit(this.text.value)
      this.text.reset()
    }
  }
}
