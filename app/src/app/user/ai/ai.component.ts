import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    AfterViewChecked,
} from '@angular/core';
import { MessageService } from 'primeng/api';
import { AiService } from 'src/app/demo/service/ai.service';
import { AuthService } from 'src/app/demo/service/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { marked } from 'marked';

interface City {
    name: string;
    code: string;
}

@Component({
    selector: 'app-ai',
    templateUrl: './ai.component.html',
    styleUrls: ['./ai.component.scss'],
})
export class AiComponent implements OnInit, AfterViewChecked {
    messages: any[] = [];
    newMessageText: string = '';

    private getAisub = new Subject<void>();

    @ViewChild('messageInput') messageInput!: ElementRef;
    @ViewChild('messagesContent') messagesContent!: ElementRef;
    userId: string;
    markdown: any;

    cities: City[] | undefined;

    selectedCity: City | undefined;
    newChatFlag: boolean;
    initialGreetingShown: boolean = false;
    constructor(private chatService: AiService, private auth: AuthService) {
        this.userId = this.auth.getTokenUserID();
    }

    ngOnInit(): void {
        this.getAllMessages();
        this.cities = [
            { name: 'New Chat', code: 'newChat' },
            { name: 'Rome', code: 'RM' },
            { name: 'London', code: 'LDN' },
            { name: 'Istanbul', code: 'IST' },
            { name: 'Paris', code: 'PRS' },
        ];
    }

    showInitialGreeting() {
        if (!this.initialGreetingShown) {
            const greetingMessage = {
                text: "Hey there! 👋 I'm your CHMSU QOAP Assistant, here to help you reach for the stars! ✨ Let's set some awesome goals together. 🚀",
                isPersonal: false,
                isLoading: false,
            };

            this.messages.push(greetingMessage);
            this.initialGreetingShown = true; // Mark the greeting as shown
        }
    }

    async getAllMessages() {
        this.chatService
            .getRoute('get', 'ai', `get-all-chat/${this.userId}`)
            .pipe(takeUntil(this.getAisub))
            .subscribe((data: any) => {
                data.chats.map((e) => {
                    this.messages.push({
                        text: e.prompt,
                        isPersonal: true,
                        isLoading: false,
                        mark: marked(e.prompt),
                    });
                    this.messages.push({
                        text: e.responseAi,
                        isPersonal: false,
                        isLoading: false,
                        mark: marked(e.responseAi),
                    });
                });

                this.scrollToBottom();
                this.showInitialGreeting();
            });
        this.scrollToBottom();
    }

    sendMessage(): void {
        let sendMessage = '';

        if (this.newMessageText.trim() === '') return;
        this.messages.push({ text: this.newMessageText, isPersonal: true });
        // /transfer the message and clear it
        sendMessage = this.newMessageText;
        this.newMessageText = null;
        // send a dummy message to the chat to load the page
        this.messages.push({
            text: '',
            isPersonal: false,
            isLoading: true,
        });
        this.chatService
            .getRoute('post', 'ai', 'chat-with-gemini', {
                message: sendMessage,
                newChat: this.newChatFlag,
                userId: this.auth.getTokenUserID(),
            })
            .pipe(takeUntil(this.getAisub))
            .subscribe((data: any) => {
                // removve the dummy data
                this.messages.pop();
                // Add new message to the messages array (for Angular)
                this.messages.push({
                    text: data.response,
                    isPersonal: false,
                    isLoading: false,
                });
                // Clear the input box
                sendMessage = '';
                this.newChatFlag = false;
                // Ensure the latest message is visible (scrolling)
                this.scrollToBottom();
            });
    }
    scrollToBottom(): void {
        if (this.messagesContent?.nativeElement) {
            this.messagesContent.nativeElement.scrollTop =
                this.messagesContent.nativeElement.scrollHeight;
        }
    }
    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    ngOnDestroy() {
        this.getAisub.unsubscribe();
    }

    onEnter(event: KeyboardEvent) {
        this.sendMessage();
    }

    onCityChange(event: any) {
        if (event.value.code === 'newChat') {
            // Check if the selected option is "New Chat"
            this.newChat();
        } else {
            // Handle other city selections if needed
            this.selectedCity = event.value;
        }
    }
    newChat() {
        this.messages = [];
        this.newChatFlag = true;
        this.ngAfterViewChecked();
        this.scrollToBottom();
    }
}
