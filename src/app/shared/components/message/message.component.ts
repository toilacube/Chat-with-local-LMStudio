import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, MarkdownComponent],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {
 @Input() text: string = ''
 @Input() isUserMessage: boolean = false;


 
 get messageClasses(): string {
  return this.isUserMessage 
    ? 'bg-[#D2B48C] text-black font-bold' 
    : 'bg-white text-black';
}
}
