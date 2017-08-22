import { Injectable } from '@angular/core';
import { COLORS } from '../../assets/colors';

declare const io: any;
declare const ace: any;
@Injectable()
export class CollaborationService {
  collaborationSocket: any;
  clientsInfo: Object = {};
  clientNum: number = 0;
  constructor() { }

  init(editor: any, sessionId: string): void{
    this.collaborationSocket = io(window.location.origin, {query: 'sessionId=' +sessionId});
    
    this.collaborationSocket.on('change', (delta: string)=>{
      console.log('collaboration: editor changed by' + delta);
      delta = JSON.parse(delta);
      editor.lastAppliedChange = delta;
      editor.getSession().getDocument().applyDeltas([delta]);
    });

    this.collaborationSocket.on('cursorMove', (cursor)=>{
      console.log('cursor move: ' + cursor);
      const session = editor.getSession();
      cursor = JSON.parse(cursor);
      const x = cursor['row'];
      const y = cursor['column'];
      const changeclientId = cursor['socketId'];
      
      if(changeclientId in this.clientsInfo){
        session.removeMarker(this.clientsInfo[changeclientId]['marker']);
      } else {
        this.clientsInfo[changeclientId] = {};
        const css =document.createElement('style');
        css.type = 'text/css';
        css.innerHTML = '.editor_cursor_' + changeclientId
            + '{ position: absolute; background: ' + COLORS[this.clientNum] + ';'
          + 'z-index: 100; width: 3px !important; }';
        document.body.appendChild(css);
        this.clientNum++;
      }

      // draw a new marker, marker is not supported by ace, we draw a range instead
      // the range is very slim, only 3px, so it looks like a cursor
      const Range = ace.require('ace/range').Range;
      const newMarker = session.addMarker(new Range(x, y, x, y+1),
                                          'editor_cursor_' + changeclientId,
                                          true);
      this.clientsInfo[changeclientId]['marker'] = newMarker;
    });
  }

  change(delta: string): void {
    this.collaborationSocket.emit('change', delta);
  }

  cursorMove(cursor: string): void{
    this.collaborationSocket.emit('cursorMove', cursor);
  }

  restoreBuffer(): void{
    this.collaborationSocket.emit('restoreBuffer');
  }

}
