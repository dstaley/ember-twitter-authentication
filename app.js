App = Ember.Application.create();

App.ApplicationAdapter = DS.FirebaseAdapter.extend({
  firebase: new Firebase("https://ember-twitter-auth.firebaseio.com")
});

App.RawTransform = DS.Transform.extend({
  deserialize: function(serialized) {
    return serialized;
  },

  serialize: function(deserialized) {
    return deserialized;
  }
});

App.Router.map(function() {
  this.route('protected');
  this.route('denied');
});

App.ApplicationRoute = Ember.Route.extend({
  actions: {
    login: function(){ this.get('firebaseAuthService').login(); },
    logout: function(){
      this.get('firebaseAuthService').logout();
      this.transitionTo('index');
    }
  }
});

App.ProtectedRoute = Ember.Route.extend({
  beforeModel: function() {
    if (!this.get('firebaseAuthService').get('authed')) {
      this.replaceWith('denied');
    }
  }
});

App.User = DS.Model.extend({
  uid: DS.attr('string'),
  provider: DS.attr('string'),
  twitter: DS.attr('raw')
});

App.FirebaseAuthService = Ember.Object.extend({
  waitingForUser: true,
  currentUser: null,

  authed: function(){
    var ref = this.store.adapterFor('application').get('firebase');
    if (ref.getAuth()) {
      return true;
    } else {
      return false;
    }
  }.property(),
  
  init: function() {
    var ref = this.store.adapterFor('application').get('firebase');
    var service = this;
    ref.onAuth(function(authData){
      if (!authData) {
        service.set('waitingForUser', false);
        service.set('currentUser', null);
      } else {
        service.store.find('user', authData.uid).then(function(user){
          service.set('currentUser', user);
          service.set('waitingForUser', false);
        }, function(){
          delete service.store.typeMapFor(service.store.modelFor('user')).idToRecord[authData.uid];
          var user = service.store.createRecord('user', {
            id: authData.uid,
            uid: authData.uid,
            twitter: authData.twitter
          }).save().then(function(user){
            service.set('currentUser', user);
            service.set('waitingForUser', false);
          });
        });
      }
    });
  },
  
  login: function(){
    var store = this.store;
    var ref = this.store.adapterFor('application').get('firebase');
    var service = this;

    ref.authWithOAuthPopup("twitter", function(error, authData){
      if (error) {
        console.log("There was an authentication error.");
      } else {
        store.find('user', authData.uid).then(function(user){
          user.set('twitter', authData.twitter);
          service.set('currentUser', user);
          service.set('waitingForUser', false);
        }, function(){
          delete store.typeMapFor(store.modelFor('user')).idToRecord[authData.uid];
          var user = store.createRecord('user', {
            id: authData.uid,
            uid: authData.uid,
            twitter: authData.twitter
          }).save().then(function(user){
            service.set('currentUser', user);
            service.set('waitingForUser', false);
          });
        });
      }
    });
  },
  
  logout: function(){
    var ref = this.store.adapterFor('application').get('firebase');
    ref.unauth();
  }
});

App.register('service:firebase-auth', App.FirebaseAuthService);
App.inject('service:firebase-auth', 'store', 'store:main');
App.inject('route', 'firebaseAuthService', 'service:firebase-auth');
App.inject('controller', 'firebaseAuthService', 'service:firebase-auth');