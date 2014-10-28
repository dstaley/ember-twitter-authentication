# Firebase Twitter Authentication with Ember

This is a quick demonstration of how to use Firebase's Twitter authentication with an Ember service. It demonstrates a full login/logout flow for Twitter, in addition to restricting routes based on authentication status.

# Protected Routes
When not authenticated, go to `/protected`, which will then redirect you to `/denied`.