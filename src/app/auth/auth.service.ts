import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { AuthData } from "./auth-data.model";

import { environment } from "../../environments/environment"

const BACKEND_URL = environment.apiUrl + "/user/";

@Injectable({
  providedIn: 'root'
})

export class AuthService{

  private token;
  private isUserAuthenticated =false
  private tokenTime: any;
  private userId: string;
  private userAuthenticationToken = new Subject<boolean>();
  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getAuthStatus() {
    return this.isUserAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getUserAuthenticationToken() {
    return this.userAuthenticationToken.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http.post(BACKEND_URL, authData)
      .subscribe(res => {
        this.router.navigate(['/login']);
      }, error => {
        this.userAuthenticationToken.next(false);
      })
  }

  login(email: string, password: string) {
    const authData : AuthData = { email, password };
    this.http.post<{token: string, expiresIn: number, userId: string}>(BACKEND_URL+'login', authData)
      .subscribe(response => {
        const token = response.token;
        this.token = token;
        if(token) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.isUserAuthenticated = true;
          this.userId = response.userId
          this.userAuthenticationToken.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          this.saveAuthData(token, expirationDate, this.userId);
          this.router.navigate(['/']);
        }
      }, error => {
        this.userAuthenticationToken.next(false)
      })
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if(!authInformation) return;

    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if(expiresIn > 0) {
      this.token = authInformation.token;
      this.isUserAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.userAuthenticationToken.next(true);
    }
  }

  logout() {
    this.token = null;
    this.userId = null;
    this.isUserAuthenticated = false;
    this.userAuthenticationToken.next(false);
    clearTimeout(this.tokenTime);
    this.clearAuthData()
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) {
    this.tokenTime = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
    localStorage.setItem("userId", userId);
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("userId");
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    const userId = localStorage.getItem("userId");
    if(!token || !expirationDate) {
      return;
    }
    return {
      token,
      expirationDate: new Date(expirationDate),
      userId
    }
  }
}
