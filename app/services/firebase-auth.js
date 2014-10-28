import Ember from 'ember';

export default Ember.Object.extend({
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