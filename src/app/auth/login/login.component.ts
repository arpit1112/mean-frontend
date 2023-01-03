import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Subscription } from "rxjs";
import { AuthService } from "../auth.service";

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy{
  isLoading = false;
  authStatusSubs : Subscription

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authStatusSubs = this.authService.getUserAuthenticationToken().subscribe( authStatus => {
      this.isLoading = authStatus;
    })
  }

  onLogin(form: NgForm) {
    if(form.invalid) return;
    this.isLoading = true;
    this.authService.login(form.value.email, form.value.password);

  }

  ngOnDestroy(): void {
      this.authStatusSubs.unsubscribe();
  }

}
