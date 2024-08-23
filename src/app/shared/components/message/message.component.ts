import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {
 @Input() text: string = ''
 @Input() isUserMessage: boolean = false;
 
 get messageClasses(): string {
  return this.isUserMessage 
    ? 'bg-blue-500 text-white' 
    : 'bg-gray-200 text-black';
}
}
