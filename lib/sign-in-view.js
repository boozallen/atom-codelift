'use babel';

export default class SignInView {
  constructor (state) {
    this.data = state;
    this.element = document.createElement('div');

    this.emailMessage = document.createElement('div');
    this.emailTextNode = document.createTextNode('Codelift email');
    this.emailInput = document.createElement('atom-text-editor');
    this.emailInput.setAttribute('mini', true);

    this.passwordMessage = document.createElement('div');
    this.passwordTextNode = document.createTextNode('Codelift password');
    this.passwordInput = document.createElement('atom-text-editor');
    this.passwordInput.setAttribute('mini', true);

    this.submitButton = document.createElement('button');
    this.buttonTextNode = document.createTextNode('Login');

    this.element.classList.add('codelift');

    this.emailMessage.appendChild(this.emailTextNode);
    this.element.appendChild(this.emailMessage);
    this.element.appendChild(this.emailInput);

    this.passwordMessage.appendChild(this.passwordTextNode);
    this.element.appendChild(this.passwordMessage);
    this.element.appendChild(this.passwordInput);

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

  initialize (callback) {
    var view = this;
    var callback = callback;
    var $ = require('atom-space-pen-views').$
    $(this.passwordInput.shadowRoot).find('div.lines').addClass('password-lines');
    this.passwordInput.getModel().onDidChange(function(){
      var string = view.passwordInput.getModel().getText().split('').map(function() { return '*';}).join('');

      var passwordNode = $(view.passwordInput.shadowRoot);
      passwordNode.find('#password-style').remove();
      passwordNode.append('<style id="password-style">.password-lines .line span.text:before {content:"' + string + '";}</style>');
    });

    this.submitButton.onclick=function(event){
      emailInput = view.emailInput.getModel();
      passwordInput = view.passwordInput.getModel();
      email = emailInput.getText();
      password = passwordInput.getText();
      emailInput.setText('');
      passwordInput.setText('');

      callback(email, password)
    }
  }
}
