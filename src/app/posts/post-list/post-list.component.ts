import { Component, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/auth.service";

import { Post } from "../post.model";
import { PostService } from "../posts.service";


@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})

export class PostListComponent implements OnInit{

  posts: Post[];
  userIsAuthenticated = false;
  isLoading = false;
  totalPost = 0;
  pageSize = 2;
  currentPage = 1;
  pageSizeOption = [1, 2, 5, 10];
  userId: string;
  private postsSub: Subscription;
  private authStatusSubs: Subscription;

  constructor(public postService: PostService, private authService: AuthService) {}

  ngOnInit() {
    this.postService.getPosts(this.pageSize, this.currentPage);
    this.userId = this.authService.getUserId();
    this.isLoading = true;
    this.postsSub = this.postService.getPostUpdateListener().subscribe((postData: {posts: Post[], postCount: number}) => {
      this.isLoading = false;
      this.posts = postData.posts
      this.totalPost = postData.postCount
    });
    this.userIsAuthenticated = this.authService.getAuthStatus();
    this.authStatusSubs = this.authService.getUserAuthenticationToken().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();
    })
  }

  onDelete(postId: string) {
    this.postService.deletePost(postId).subscribe(() => {
      this.postService.getPosts(this.pageSize, this.currentPage);
    })
  }

  onPageChange( event: PageEvent) {
    this.isLoading = true;
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.postService.getPosts(this.pageSize, this.currentPage);
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }

}
