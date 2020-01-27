import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CouchDBDocument } from '@mkeen/rxcouch';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.scss']
})
export class ConversationsComponent implements OnInit {
  constructor(
    private loginService: LoginService,
    private route: ActivatedRoute
  ) { }

  conversation: BehaviorSubject<CouchDBDocument> = new BehaviorSubject({
    _id: '',
    _rev: '',
    title: '',
    badges: [],
    slug: '',
    url: ''
  });

  previewReactions = {
    loveface: [],
    lol: [],
    smile: [],
    sad: [],
    angry: [] 
  };

  focusedComment = -1;

  loggedInUser = this.loginService.loggedInUser;

  documentSubscription: Subscription;

  messageInput = '';

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (this.documentSubscription) {
        this.documentSubscription.unsubscribe();
      }

      this.documentSubscription = this.loginService.couches.comments.doc(params.conversationId).subscribe(
        conversation => this.conversation.next(conversation)
      );

    });

  }

  send() {
    this.loginService.couches.commentsIngress.doc({
      content: this.messageInput,
      conversation_id: this.conversation.value._id,
      sender_id: this.loggedInUser.value._id
    }).pipe(take(1)).subscribe((response) => {
      this.messageInput = '';
    });

  }

  reaction(commentIndex: number, reactionType: string) {
    this.loginService.couches.commentsReactionsIngress.doc({
      conversation_id: this.conversation.value._id,
      commentIndex,
      reactionType
    }).pipe(take(1)).subscribe((result) => {
      console.log(result);
    });

  }

  previewReaction(commentIndex: number, reactionType: string) {
    this.previewReactions[reactionType][commentIndex] = true;
  }

  unpreviewReaction(commentIndex: number, reactionType: string) {
    delete this.previewReactions[reactionType][commentIndex];
  }

  focusComment(commentIndex: number) {
    this.focusedComment = commentIndex;
  }

  unfocusComment() {
    this.focusedComment = -1;
  }

  trackByFn(index, item) {
    return index; // or item.id
  }

}
