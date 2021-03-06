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
            this._state = value;
            this.#notifyObservers();
        }
    }
}


class Model {

    #state;

    constructor() {

        this.#state = {};

    }

    addKey(keyName) {
        if (keyName in this.#state)
            throw keyName + ' already in model';

        this.#state[keyName] = new Observable();
    }

    /**
     * 
     * @param {string} keyName 
     * @returns {*} state at model[keyName] 
     */
    get(keyName) {
        return this.#state[keyName].getState();
    }

    set(keyName, value) {
        this.#state[keyName].setState(value);
    }

    /**
     * 
     * @param {string} keyName 
     * @param {Function} handler 
     */
    addObserverHandler(keyName, handler) {
        this.#state[keyName].registerObserver(new Observer(handler));
    }
}

class ObservableInput extends Observable {

    constructor(inputElement) {
        super();
        this.input = inputElement;
        this.setState(this.input.value);
        this.input.addEventListener('input', () => {
            this.setState(this.input.value);
        });
    }

    setState(value) {
        super.setState(value);
        this.input.value = value;
    }
}

class ObservableGroupedClickable extends Observable {

    constructor(clickableList) {
        super();
        for (let clickable of clickableList)
            clickable.addEventListener('click', (e) => {
                this.setState(e.target.innerText);
            });
    }
}

class View {

    /**
     * 
     * @param {Model} model 
     */
    constructor(model) {
        if (!(model instanceof Model))
            throw 'model must be instance of Model';

        this.model = model;
    }

    /**
     * 
     * @param {HTMLElement} element 
     * @param {string} modelKeyName 
     */
    addInput(element, modelKeyName) {
        // set a new observable input for this element
        let oIn = new ObservableInput(element);
        // state will change on input
        // this observer will reflect this change to the model
        oIn.registerObserver(new Observer(
            (value) => this.model.set(modelKeyName, value))
        );
        // initiate model state with initial input content value
        this.model.set(modelKeyName, oIn.getState());

        // observe the model and change input content when needed
        this.model.addObserverHandler(modelKeyName, (value) => {
            oIn.setState(value);
        })
    }

    addGroupedClickable(clickableList, modelKeyName) {
        // set a new observable link input for this element
        let oGrpedClk = new ObservableGroupedClickable(clickableList);
        // state will change on click
        // this observer will reflect this click to the model
        oGrpedClk.registerObserver(new Observer(
            (value) => this.model.set(modelKeyName, value))
        );
    }

    /**
     * 
     * @param {HTMLElement} element 
     * @param {string} modelKeyName 
     */
    addOutput(element, modelKeyName) {

        element.innerText = this.model.get(modelKeyName);
        this.model.addObserverHandler(
            modelKeyName,
            (val) => { element.innerText = val });

    }
}
