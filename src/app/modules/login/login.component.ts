import { Component, inject, Injectable } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from '@angular/fire/auth';

import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private provider: GoogleAuthProvider;

  constructor(private router: Router, private auth: Auth) {
    // Initialize the GoogleAuthProvider in the constructor
    this.provider = new GoogleAuthProvider();
  }

  async login() {
    const result = await signInWithPopup(this.auth, this.provider).then(
      (result) => {
        this.router.navigate(['/chat']);
      }
    );
  }
}
