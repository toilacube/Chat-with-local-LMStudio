import { Routes } from '@angular/router';
import { ChatRoomComponent } from './modules/chat-room/chat-room.component';
import { LoginComponent } from './modules/login/login.component';

export const routes: Routes = [
    {path: '', component: LoginComponent},
    {path: 'chat', component: ChatRoomComponent},
    {path: 'login', component: LoginComponent}
];
