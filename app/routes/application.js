import Ember from 'ember';

export default Ember.Route.extend({
	actions: {
		login: function(){ this.get('firebaseAuthService').login(); },
		logout: function(){
			this.get('firebaseAuthService').logout();
			this.transitionTo('index');
		}
	}
});
