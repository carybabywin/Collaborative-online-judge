import { Injectable } from '@angular/core';
import { Http, Response, Headers , RequestOptions} from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import { Problem } from '../data-structure/problem';
import { PROBLEMS } from '../mock-problems';

@Injectable()
export class DataService {
  private _problemSource = new BehaviorSubject<Problem[]>([]);
  constructor(private http: Http) { }

  /**
   * get problems from server
   */
  getProblems(): Observable<Problem[]> {
    this.http.get('api/v1/problems')
      .toPromise()
      .then((res: Response) => {
        this._problemSource.next(res.json());
      })
      .catch(this.handleError);
    return this._problemSource.asObservable();
  }

  /**
   * get one problem from server
   */
  getProblem(id: number) {
    // NOTE: you don't have to use toPromise()
    // by default, it's observable, you can subscribe in problem-detail component
    return this.http.get(`api/v1/problems/${id}`)
      .toPromise()
      .then((res: Response) => {
        this.getProblems();
        return res.json();
      })
      .catch(this.handleError);
  }

  /**
   * add a new problem
   */
  addProblem(problem: Problem) {
    const headers = new Headers({'content-type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    // NOTE: you don't have to use toPromise()
    // by default, it's observable, you can subscribe in problem-detail component
    // NOTE: in the new version of Angular4, you have to explicitly specify RequestOptionsArgs
    //       using headers directly would result in compile time error
    return this.http.post('/api/v1/problems', problem, options)
      .toPromise()
      .then((res: Response) => {
        this.getProblems();
        return res.json();
      })
      .catch(this.handleError)
  }

  /**
   * 
   * @param data  TODO: define a model
   */
  buildAndRun(data: any): Promise<Object> {
    const headers = new Headers({'content-type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post('/api/v1/build_and_run', data, options)
      .toPromise()
      .then((res: Response) => {
        console.log('in client side build and run ', res);
        return res.json();
      })
      .catch(this.handleError);
  };

  /**
   * common error handler
   */
  private handleError(error: any): Promise<any> {
    console.error('An error occured', error);
    return Promise.reject(error);
  }
}
