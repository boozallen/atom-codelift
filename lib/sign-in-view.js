module.exports = {
  constructor (state) {
    this.data = state;
    this.element = document.createElement('div');
    this.message = document.createElement('span');
    this.textNode = document.createTextNode('Test');

    this.element.classList.add('codelift');

    this.message.appendChild(this.textNode);
    this.element.appendChild(this.message);
  },

  serialize: function () {
    return {
      data: this.data
    };
  },

  destroy: function () {
    this.element.remove();
  },

  getElement: function () {
    return this.element;
  },
}
