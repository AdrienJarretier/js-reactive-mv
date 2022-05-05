class Observer {

    #updateHandler;

    /**
     * 
     * @param {Function} updateHanlder 
     */
    constructor(updateHandler) {
        if (!(updateHandler instanceof Function)) {
            throw 'updateHandler must be a function';
        }
        this.#updateHandler = updateHandler;
    }

    /**
     * 
     * @param {Observable} subject 
     */
    update(subject) {

        if (!(subject instanceof Observable)) {
            throw 'observable must be instance of Observable';
        }
        this.#updateHandler(subject.getState());
    }
}

class Observable {
    #observers;
    constructor() {
        this.#observers = [];
    }

    /**
     * 
     * @param {Observer} observer 
     */
    registerObserver(observer) {
        if (!(observer instanceof Observer)) {
            throw 'observer must be instance of Observer';
        }
        if (!this.#observers.includes(observer))
            this.#observers.push(observer);
    }

    /**
     * 
     * @param {Observer} observer 
     */
    unregisterObserver(observer) {
        if (!(observer instanceof Observer)) {
            throw 'observer must be instance of Observer';
        }
    }

    #notifyObservers() {
        for (let observer of this.#observers) {
            observer.update(this);
        }
    }

    getState() {
        return this._state;
    }

    setState(value) {
        if (value != this._state) {
            // console.log('Observable.setState :', value);
            this._state = value;
            this.#notifyObservers();
        }
    }
}

