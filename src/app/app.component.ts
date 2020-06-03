import { Component, OnInit } from '@angular/core';
import { HubConnection } from '@aspnet/signalr';
import * as signalR from '@aspnet/signalr';
import { environment } from 'src/environments/environment';
import { Message } from './message.model';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private hubConnection: HubConnection | undefined;
  username: string = '';
  messages: Message[] = [];
  currentMessage: string = '';

  constructor() { }

  ngOnInit() {

    this.username = this.generateRandomName();

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.signalr.url}`)
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('connected');
        this.hubConnection.invoke('broadcastMessage', '_SYSTEM_', `${this.username} JOINED`)
      });

    this.hubConnection.on('broadcastMessage', (name: string, message: string) => {
      if (!message) return;
      this.messages.push(this.createMessage(name, message));
    });

    this.hubConnection.on('echo', (name: string, message: string) => {
      if (!message) return;
      this.messages.push(this.createMessage(name, message));
    });
  }

  generateRandomName() {
    return Math.random().toString(36).substring(2, 10);
  }

  createMessage(name, message): Message {

    return { name: name, text: message } as Message;
  }

  sendMessage() {

    this.hubConnection.invoke('broadcastMessage', this.username, this.currentMessage);
    this.currentMessage = '';
  }

  echo() {

    this.hubConnection.invoke('echo', this.username, this.currentMessage);
  }
}
