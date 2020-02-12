import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoginService } from '../login.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';
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
  emoteIndicators: any[] = [];

  lastKnownEmoteCounts: any[] = [];

  ngOnInit() {
    this.loginService.couches.comments.reconfigure({trackChanges: true});
    this.route.params.pipe(takeUntil(this.componentUnloaded)).subscribe((params) => {
      if (this.documentSubscription) {
        this.documentSubscription.unsubscribe();
      }

      this.loginService.couches.comments.doc(params.conversationId).pipe(takeUntil(this.componentUnloaded), tap((conversation) => {
        conversation.comments.forEach((comment, index) => {
          if (this.lastKnownEmoteCounts[index] === undefined) {
            this.lastKnownEmoteCounts[index] = comment.reactions;
          } else {
            Object.keys(comment.reactions).forEach((reactionTypeName) => {
              const indicatorCount = comment.reactions[reactionTypeName] - this.lastKnownEmoteCounts[index][reactionTypeName];
              if(indicatorCount > 0) {
                this.reactionIndicate(index, reactionTypeName);
              }

            });

            this.lastKnownEmoteCounts[index] = comment.reactions;
          }

        });

      })).subscribe(
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

  reactionIndicate(commentIndex: number, reactionType: string) {
    if (this.emoteIndicators[commentIndex] === undefined) {
      this.emoteIndicators[commentIndex] = {
        loveface: 0,
        lol: 0,
        smile: 0,
        sad: 0,
        angry: 0
      }

    }

    this.emoteIndicators[commentIndex][reactionType]++;



  }

  makeArray(length: number) {
    return new Array(length);
  }

  reaction(commentIndex: number, reactionType: string) {
    this.loginService.couches.commentsReactionsIngress.doc({
      conversation_id: this.conversation.value._id,
      commentIndex,
      reactionType
    }).pipe(take(1)).subscribe((result) => {

    });

  }

  previewReaction(commentIndex: number, reactionType: string) {
    this.previewReactions[reactionType][commentIndex] = true;
  }

  unpreviewReaction(commentIndex: number, reactionType: string) {
    delete this.previewReactions[reactionType][commentIndex];
  }

  focusComment(commentIndex: number, isSameUser?: boolean) {
    if (isSameUser) {
      return true;
    }

    this.focusedComment = commentIndex;
  }

  unfocusComment() {
    this.focusedComment = -1;
  }

  trackByFn(index, item) {
    if(item) {
      return item.sender_id + index;
    } else {
      return index;
    }
  }

}
