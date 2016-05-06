'use babel';

var CompositeDisposable = require ('atom')
var SignInView = require('./sign-in-view.js')
var request = require ('request')
var fs = require ('fs')
var ini = require('ini')
var path = require('path')
var remote = require ('remote')
var app = remote.require ('app')

var projectPaths, signInView, modal;
var hostUrl = 'https://codelift.io/';
var analysisUrl = hostUrl + 'api/analyses/';
var authUrl = hostUrl + 'api/auth/sign_in/';
var token = false;
var provider, repository, branch
var default_attempts = 3;

module.exports = {
  activate: function(state) {
    atom.commands.add('atom-workspace',
      {'codelift:createDockerfile': this.createDockerfile}
    );

    projectPaths = atom.project.getPaths();

    signInView = new SignInView(state.viewState);
    signInModal = atom.workspace.addModalPanel({
      item: signInView.getElement(),
      visible: false
    });
  },

  deactivate: function() {
    signInView.destroy();
    signInModal.destroy();
    confirmRepoModal.destroy();
  },

  serialize: function() {
    return {
      viewState: signInView.serialize()
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

signIn = function () {
  signInModal.show();
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
      signInModal.hide();
      getBranch();
    } else {
      return console.log('Sign in failed: ' + body.messages[0]);
    }
  })
}

getBranch = function () {
  var gitPath = path.join(projectPaths[0], '.git');
  var providerUrl;
  fs.access(gitPath, function(){
    var config = ini.parse(fs.readFileSync(gitPath + '/config', 'utf-8'))
    if (!config.hasOwnProperty('remote "origin"')) {
      return console.log('Git remote origin not found')
    } else {
      var url = repository = config['remote "origin"'].url
    }
    if (url.indexOf('github') > 0) {
      provider = 'github'
      providerUrl = 'github.com/'
    } else if (url.indexOf('bitbucket') > 0) {
      provider = 'bitbucket'
      providerUrl = 'bitbucket.org/'
    }
    branch = fs.readFileSync(gitPath + '/HEAD', 'utf8').replace(/(\r\n|\n|\r|ref: refs\/heads\/)/gm,"");
    repository = url.substr(url.indexOf(providerUrl)+ providerUrl.length);
    repository = repository.substr(0, repository.indexOf('.git'));
    send();
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
    body = JSON.parse(body);
    if(body.hasOwnProperty('analysis_files') && body.analysis_files.length > 0){
      var rootPath = projectPaths[0];
      body.analysis_files.forEach(function(file){
        var location = rootPath + '/' + file.name;
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
