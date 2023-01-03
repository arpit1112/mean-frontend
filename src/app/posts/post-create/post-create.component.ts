import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validator, Validators } from "@angular/forms";
import { ActivatedRoute, Event, ParamMap } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";
import { Post } from "../post.model";
import { PostService } from "../posts.service";
import { mimeType } from "./mime-type.validator";

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit, OnDestroy {
  enteredTitle = '';
  enteredContent = '';
  post: Post;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  private mode = 'create'
  private postId : string;
  private authStatusSubs : Subscription;

  constructor(public postService: PostService, public route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit(): void {
    this.authStatusSubs = this.authService.getUserAuthenticationToken().subscribe(
      authStatus => this.isLoading = false
    );
    this.form = new FormGroup({
      'title': new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      'content': new FormControl(null, { validators: [Validators.required] }),
      'image': new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeType] })
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if(paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId')
        this.isLoading = true;
        this.postService.getPost(this.postId).subscribe(postsData => {
          this.isLoading = false;
          this.post = {
            id: postsData._id,
            title: postsData.title,
            content: postsData.content,
            imagePath: postsData.imagePath,
            creator: postsData.creator
          }
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath
          })
        })
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    })
  }

  onImagePicked(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({image: file})
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    }
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if(this.form.invalid) return;
    this.isLoading = true;
    if(this.mode === 'create') {
      this.postService.addPost(this.form.value.title, this.form.value.content, this.form.value.image)
    } else {
      this.postService.editPost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image)
    }

    this.form.reset();
  }

  ngOnDestroy(): void {
    this.authStatusSubs.unsubscribe();
  }

}
