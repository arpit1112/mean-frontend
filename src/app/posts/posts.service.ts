import { Injectable } from "@angular/core";
import { pipe, Subject } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { map } from 'rxjs/operators'

import { Post } from "./post.model";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment"

const BACKEND_URL = environment.apiUrl + "/posts/";

@Injectable({
  providedIn: 'root'
})

export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

  constructor(private httpClient: HttpClient, public router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.httpClient.get<{message: string, posts: any, maxPosts: number}>(BACKEND_URL+queryParams)
    .pipe(map((postData) => {
      return { posts: postData.posts.map(post => {
        return {
          title: post.title,
          content: post.content,
          id: post._id,
          imagePath: post.imagePath,
          creator: post.creator
        }
      }), maxPosts: postData.maxPosts}
    }))
    .subscribe((transformedPostData) => {
      this.posts = transformedPostData.posts;
      this.postsUpdated.next({posts: [...this.posts], postCount: transformedPostData.maxPosts})
    }, error => {
      console.log(error);
    })
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable()
  }

  getPost(id: string) {
    return this.httpClient.get<{_id: string, title: string, content: string, imagePath: string, creator: string}>(BACKEND_URL + id);
  }

  addPost( title: string, content: string, image: File ) {
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);
    this.httpClient.post<{ message: string, post: Post}>(BACKEND_URL, postData).subscribe((responseData) => {
      this.router.navigate(['/'])
    }, error => {

    })
  }

  editPost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if(typeof(image) === 'object') {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title)
      postData.append("content", content)
      postData.append("image", image, title)
    } else {
      postData = { id, title, content, imagePath: image, creator: null }
    }
    this.httpClient.put<any>(BACKEND_URL + id, postData).subscribe(result => {
      this.router.navigate(['/'])
    }, error => {
      console.log(error);

    })
  }

  deletePost( postId: string ) {
    return this.httpClient.delete(BACKEND_URL + postId)
  }

}
