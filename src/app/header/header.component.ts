import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { AuthService } from "../auth/auth.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit, OnDestroy{
  isUserAuthenticated = false;
  private authListenerSubs : Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isUserAuthenticated = this.authService.getAuthStatus();
    this.authListenerSubs = this.authService.getUserAuthenticationToken().subscribe(authStatus => {
        this.isUserAuthenticated = authStatus;
      })
  }

  onLogout() {
    this.isUserAuthenticated = false;
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.authListenerSubs.unsubscribe();
  }
}
