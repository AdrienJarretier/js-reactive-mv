class Model {

    #state;

    constructor() {

        this.#state = {};

    }

    #keyExists(keyName) {
        return keyName in this.#state;
    }

    #get(keyName) {
        if (!this.#keyExists(keyName))
            throw 'key [' + keyName + '] missing in model, call Model.addKey()';

        return this.#state[keyName];
    }

    addKey(keyName, value = null) {
        if (keyName in this.#state)
            throw keyName + ' already in model';

        this.#state[keyName] = new Observable();
        this.#state[keyName].setState(value);
    }

    /**
     * 
     * @param {string} keyName 
     * @returns {*} state at model[keyName] 
     */
    get(keyName) {

        return this.#get(keyName).getState();
    }

    set(keyName, value) {
        this.#get(keyName).setState(value);
    }

    /**
     * 
     * @param {string} keyName 
     * @param {Function} handler 
     */
    addObserverHandler(keyName, handler) {
        this.#get(keyName).registerObserver(new Observer(handler));
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
     * @param {string} modelKeyName
     * @param {HTMLElement} element
     */
    addInput(modelKeyName, element) {
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

    addGroupedClickable(modelKeyName, clickableList) {
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
     * @param {string} modelKeyName 
     * @param {HTMLElement} element
     */
    addOutput(modelKeyName, element) {

        element.innerText = this.model.get(modelKeyName);
        this.model.addObserverHandler(
            modelKeyName,
            (val) => { element.innerText = val });

    }
}