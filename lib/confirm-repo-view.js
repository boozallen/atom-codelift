'use babel';

export default class SignInView {
  constructor (state) {
    this.data = state;
    this.element = document.createElement('div');

    this.providerMessage = document.createElement('div');
    this.providerTextNode = document.createTextNode('Provider');
    this.providerInput = document.createElement('atom-text-editor');
    this.providerInput.setAttribute('mini', true);

    this.repositoryMessage = document.createElement('div');
    this.repositoryTextNode = document.createTextNode('Repository');
    this.repositoryInput = document.createElement('atom-text-editor');
    this.repositoryInput.setAttribute('mini', true);

    this.branchMessage = document.createElement('div');
    this.branchTextNode = document.createTextNode('Branch');
    this.branchInput = document.createElement('atom-text-editor');
    this.branchInput.setAttribute('mini', true);

    this.submitButton = document.createElement('button');
    this.buttonTextNode = document.createTextNode('Submit');

    this.element.classList.add('codelift');

    this.providerMessage.appendChild(this.providerTextNode);
    this.element.appendChild(this.providerMessage);
    this.element.appendChild(this.providerInput);

    this.repositoryMessage.appendChild(this.repositoryTextNode);
    this.element.appendChild(this.repositoryMessage);
    this.element.appendChild(this.repositoryInput);

    this.branchMessage.appendChild(this.branchTextNode);
    this.element.appendChild(this.branchMessage);
    this.element.appendChild(this.branchInput);

    this.element.appendChild(this.submitButton);
    this.submitButton.appendChild(this.buttonTextNode);
  }

  serialize () {
    return {
      data: this.data
    };
  }

  destroy () {
    this.element.remove();
  }

  getElement () {
    return this.element;
  }

  setValues (provider, repository, branch) {
    providerInput = this.providerInput.getModel();
    repositoryInput = this.repositoryInput.getModel();
    branchInput = this.branchInput.getModel();

    providerInput.setText(provider)
    repositoryInput.setText(repository)
    branchInput.setText(branch)
  }

  initialize (callback) {
    var view = this;
    var callback = callback;
    this.submitButton.onclick=function(event){
      provider = view.providerInput.getModel().getText();
      repository = view.repositoryInput.getModel().getText();
      branch = view.branchInput.getModel().getText();

      callback(provider, repository, branch);
    }
  }
}
