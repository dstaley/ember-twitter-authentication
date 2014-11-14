import Ember from 'ember';

export default Ember.Route.extend({
	beforeModel: function() {
		if (!this.get('firebaseAuthService').get('authed')) {
			this.replaceWith('denied');
		}
	}
});
