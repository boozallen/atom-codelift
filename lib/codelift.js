'use babel';

var CompositeDisposable = require ('atom')
var SignInView = require('./sign-in-view.js')
var request = require ('request')
var fs = require ('fs')
var path = require('path')
var remote = require ('remote')
var app = remote.require ('app')

var projectPaths, signInView, modal;
var hostUrl = 'https://codelift.io/';
var analysisUrl = hostUrl + 'api/analyses/';
var authUrl = hostUrl + 'api/auth/sign_in/';
var token = false;
var provider = 'github';
var repository = null;
var branch = null;
var default_attempts = 3;

module.exports = {
  activate: function(state) {
    atom.commands.add('atom-workspace',
      {'codelift:createDockerfile': this.createDockerfile}
    );

    projectPaths = atom.project.getPaths();

    signInView = new SignInView(state.viewState);
    modal = atom.workspace.addModalPanel({
      item: signInView.getElement(),
      visible: false
    });
  },

  deactivate: function() {
    signInView.destroy();
    modal.destroy();
  },

  serialize: function() {
    return {
      viewState: signInView.serialize();
    };
  },

  createDockerfile: function() {
    if (token) {
      getBranch();
    } else {
      signIn();
    }
  }
}

getBranch = function () {
  var gitPath = path.join(projectPaths[0], '.git');
  fs.access(gitPath, function(){
    branch = fs.readFileSync(gitPath + '/HEAD', 'utf8').replace(/(\r\n|\n|\r|ref: refs\/heads\/)/gm,"");
    repository =  fs.readFileSync(gitPath + '/config', 'utf8');
    repository = repository.substr(repository.indexOf('https://github.com')+19);
    repository = repository.substr(0, repository.indexOf('.git'));
    send();
  })
}

signIn = function () {
  modal.show();
  signInView.initialize(getToken);
}

getToken = function(email, password) {
  var form = {
    session: {
      email: email,
      password: password
    }
  }

  request.post({url: authUrl, form: form}, function (err, httpResponse, body) {
    if (err) {
      return console.log('Sign in failed:', err);
    }
    body = JSON.parse(body);

    if(body.hasOwnProperty('token')) {
      token = 'Token ' + body.token;
      modal.hide();
      getBranch();
    } else {
      return console.log('Sign in failed: ' + body.messages[0]);
    }
  })
}

send = function () {
  var form = {
    analysis: {
      provider: provider,
      repository: repository,
      branch: branch
    }
  }

  request.post({url: analysisUrl, form: form, headers: {'Authorization': token}}, function (err, httpResponse, body) {
    if (err) {
      return console.error('upload failed:', err);
    }
    body = JSON.parse(body);
    if(body.hasOwnProperty('analysis')) {
      fetchDockerfile(body.analysis.id, default_attempts);
    } else {
      return console.log('Analysis Failed');
    }
  })
},

fetchDockerfile = function (analysis_id, attempts) {
  var url = analysisUrl + analysis_id + '/files';
  request.get({url: url, headers: {'Authorization': token}}, function(err, httpResponse, body){
    body = JSON.parse(body)
    if(body.hasOwnProperty('analysis_files') && body.analysis_files.length > 0){
      var date = Date.now();
      var rootPath = projectPaths[0];
      fs.mkdirSync(rootPath + '/Dockerfiles-' + date);
      body.analysis_files.forEach(function(file){
        var location = rootPath + '/Dockerfiles-' + date + '/' + file.name;
        fs.writeFile(location, file.contents, function(err){
          if(err) {
            return console.log('Error saving file' + file.name + 'error: ' + err);
          }
        })
      })
    } else if (attempts > 0) {
      setTimeout(function(){
         fetchDockerfile(analysis_id, attempts-1);
      }, 10000)
    } else {
      return console.log('Dockerfile creation has timed out.');
    }
  })
}
