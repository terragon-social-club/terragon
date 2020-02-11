import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoginService } from '../login.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { CouchDBDocument } from '@mkeen/rxcouch';

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.scss']
})
export class ConversationsComponent implements OnInit, OnDestroy {
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

  componentUnloaded: Subject<boolean> = new Subject();

  ngOnInit() {
    this.loginService.couches.comments.reconfigure({trackChanges: true});
    this.route.params.pipe(takeUntil(this.componentUnloaded)).subscribe((params) => {
      if (this.documentSubscription) {
        this.documentSubscription.unsubscribe();
      }

      this.loginService.couches.comments.doc(params.conversationId).pipe(takeUntil(this.componentUnloaded)).subscribe(
        conversation => this.conversation.next(conversation)
      );

    });

  }

  ngOnDestroy() {
    this.componentUnloaded.next(true);
    this.loginService.couches.comments.reconfigure({trackChanges: false});
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
