import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { ErrorComponent } from "./error/error.component";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private dialog: MatDialog) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      return next.handle(req).pipe(
        catchError((error: HttpErrorResponse) => {
          let errorMessage = "An unknown error occured!"
          if(error.error.message) {
            errorMessage = error.error.message
          }
          // this.snackBar.openFromComponent(ErrorComponent, {
          //   duration: 2000
          // })
          this.dialog.open(ErrorComponent, {
            data: { message: errorMessage }
          });
          return throwError(error);
        })
      )
  }
}
