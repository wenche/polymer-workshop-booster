# Polymer Workshop @ Booster

This project includes skeleton for the workshop app with instructions to solve and steps along the way

## Project contents

 -   `starter` - Where you start coding, has skeleton elements and empty elements
 -   `step-1` to `step-4` - The steps to follow during the workshop, which are the finished result of the step's goal
 -   `finished`. The completed app.
 -   `components`. Selection of Polymer elements used in the project.
 -   `api`. Data for the service.
 -   `images`. Avatar images.

## Steps

# Step 1 Create user element
In this task we will set up the polymer element to display the user alias and avatar. A SPA shell is already in place,
we are going to implement the template to show info about the
current user in upper right corner (header).
Let's start in folder "starter"!

Documentation:
 -   https://www.polymer-project.org/docs/start/creatingelements.html
 -   https://www.polymer-project.org/docs/start/usingelements.html
 -   https://www.polymer-project.org/docs/polymer/databinding.html

Code insertions:

###In user-view.html

    <link rel="import" href="../components/polymer/polymer.html">
    <link rel="import" href="../components/core-localstorage/core-localstorage.html">


    <core-localstorage id="storage" name="user-storage" value="{{user}}"></core-localstorage>

    <img class="avatar" src="{{user.avatar}}" alt="user avatar"/> {{user.alias}}

    publish: {
        created: function (){
           this.user = {
               uid: '',
               avatar: '../images/question-mark.svg',
               alias: 'Unregistered'
           }
       }
    }


###In index.html

      <link rel="import" href="user-view.html">


      <user-view user={{user}}></user-view>

# Step 2 Register user
In this task we will set up the polymer element to register user.
The polymer element must be created, html imports must be done,
custom elements used and scripting in polymer element to set up event handling.
We will leave out the generic Polymer code to create an element and the import of Polymer html in the following steps,
as this has been demonstrated earlier.

Documentation:
 -  https://www.polymer-project.org/docs/elements/material.html
 -  https://www.polymer-project.org/docs/elements/paper-elements.html#paper-toast
 -  https://www.polymer-project.org/docs/elements/core-elements.html#core-ajax
 -  https://www.polymer-project.org/articles/communication.html

Code insertions:

###In register-user.html

      <link rel="import" href="../components/polymer/polymer.html">
      <link rel="import" href="../components/paper-input/paper-input.html">
      <link rel="import" href="../components/paper-button/paper-button.html">
      <link rel="import" href="../components/core-ajax/core-ajax.html">
      <link rel="import" href="../components/pubnub-polymer/pubnub-element.html">


      :host {
        width:inherit;
        height:inherit;
        background-color: white;
        padding: 1em;
        font-size: 1.2rem;
        font-weight: 300;
      }


      <core-ajax id="ajax" method="POST" url="/api/users"
      handleAs="json"
      contentType="application/json"
      on-core-response="{{userRegistered}}"
      on-core-error="{{error}}"
      body="{ 'alias' : '{{value}}' }">
      </core-ajax>

      <core-pubnub publish_key="pub-c-a7a900bb-9082-4016-b7c1-398ed8d45ebd"
      subscribe_key="sub-c-a85bdc94-b878-11e4-9a8b-0619f8945a4f">
        <core-pubnub-subscribe channel="registration" id="sub"  messages="{{messages}}">
          <core-pubnub-publish id="pub" channel="registration" message=""></core-pubnub-publish>
          </core-pubnub-subscribe>
      </core-pubnub>

      <div layout vertical center-center>
        <paper-input id="alias" label="Set alias/user name" floatingLabel title="Set alias" committedValue="{{value}}"></paper-input>
        <paper-button raised class="colored" on-tap="{{register}}">Registrer alias!</paper-button>
      </div>

    publish: {
        user: {
          value: {},
          reflect: true
        }
      },
      register: function(event, detail, sender) {
        this.$.ajax.go();
      },
      userRegistered: function(){

        this.user = {
          uid: this.$.ajax.response.id,
          alias: this.$.ajax.response.alias,
          avatar: "../images/" + this.$.ajax.response.avatar
        };

        this.publishRegistration();
        this.fire('user-registered');
      },
      error:function(event, detail, sender){
        this.fire('error', detail);
      },
      publishRegistration: function () {
          this.$.pub.message = {
            alias: this.$.ajax.response.alias,
            timestamp: new Date().toISOString()
          };
          this.$.pub.publish();
      }

###In index.html

      <link rel="import" href="register-user.html">


      <register-user user={{user}}></register-user>


      var registerUser = document.querySelector('register-user');
      var toast = document.querySelector('paper-toast');
      var userView = document.querySelector('user-view');

      registerUser.addEventListener('user-registered', function() {
          userView.user = this.user;
          toast.text = "Congrats, you are registered!";
          toast.show();
      });

      registerUser.addEventListener('error', function(detail) {
          // Implement similar toast functionality like above to show error messages
      });

# Step 3 Get test question and vote
In this task we will set up the polymer element to get test question from api and be able to vote on it.
The polymer element must be created, html imports must be done, custom elements used and scripting in polymer element to set up event handling.
We are going to implement the ajax calls and the voting event. The first ajax call will get the test question and display it,
the second will register a vote to the REST api with the user id and the 'Hot' parameter as true.

Code insertions:

###In user-vote.html

      <!-- Find out which components you need and import them-->


      :host {
          width:100%;
          height:inherit;
          display:block;
      }
      .question
      {
        padding: 1em;
        width:100%;
        /*margin-top: 50%;*/
        margin-bottom: 0.5em;
        text-align: center;
        font-size: 0.7em;
        font-style: italic;
        background-color: rgba(0,0,0,0.3);
        color: white;
      }
      .tandis{
        height:inherit;
        width:inherit;
      }
      .tandis img{
        height:10%;
        width:100%;
      }
      .content {
        background-image: url(../images/TandeP.svg);
        background-repeat: no-repeat;
        background-position: center top;
        background-size: 26%;
      }
      .colored{
          padding:0.3em;
          background:#704d8c;
          color:white;
      }
      .hide{
          display:none;
      }

      <core-ajax id="ajax"
                 auto
                 url="/api/questions/1"
                 on-core-response="{{questionLoaded}}"
                 handleAs="json">
      </core-ajax>
      <core-ajax id="vote"
                 method="PUT"
                 url="../api/votes/{{question.id}}"
                 on-core-response="{{voteRegistered}}"
                 on-core-error="{{error}}"
                 handleAs="json"
                 contentType="application/json"
                 body="{ 'userid' : '{{user.uid}}', 'hot' : true}">
      </core-ajax>

      <div vertical layout fit center>
            <div class="tandis"><img src="../images/TandeP.svg"></div>
            <div class="question">"{{question.text}}"</div>
            <paper-button id="mentometerknapp" raised class="colored" title="Mentometerknapp" on-tap="{{mentometerPushed}}">Mentometerknapp</paper-button>
      </div>


      questionLoaded: function() {
          this.question = this.$.ajax.response;
      },
      mentometerPushed: function(event, detail, sender) {
          // Make ajax call with this.$.vote

          // Implement a voting-tap signal
      },
      voteRegistered: function(){
        this.$.mentometerknapp.setAttribute("class", "hide");
        this.question = {
            uid:100,
            text: "Thanks!"
        };
      },
      error:function(event, detail, sender){
        // Implement a error signal and send details with it
      }

###In index.html

    <!-- Import the newly created custom element -->


    <!-- Insert custom element with attribute -->


    var userVote = document.querySelector('user-vote');

    //In register user
    userVote.user = this.user;

    //Following the other event listeners
    userVote.addEventListener('voting-tap', function() {
      // Implement similar toast functionality like above to confirm that user voted
    });
    userVote.addEventListener('error', function(detail) {
      // Implement similar toast functionality like above to show error messages
    });


## Step 4 Get final question
In this task we will set up the polymer element to get final question from api.
The element is created and set up from step 3 and we will adjust the ajax call
to get the final question and then do the final voting.

Change url="/api/questions/1" to url="/api/questions/2" and your done!

Then wait for further instructions before pushing the button ;)


## Step 5 (Optional) Chat
In this task we will create a chat element. This will be similar to user registration and the keys will be the same, but we will
publish and subscribe to a different channel, and the we create a message object when you click "Send" button,
containing the user's avatar, alias, a timestamp and the message itself.

In other words, we will make an element with a template for user input and some logic for publishing messages and subscribe to
callbacks. Remember to update index.html... :-)

Following is some code you will need. If you need more hints, take a look in the "finished" folder. Good luck!

    <core-pubnub-subscribe channel="booster-chat" id="sub" on-callback="{{subscribeCallback}}" messages="{{messages}}">
        <core-pubnub-publish id="pub" channel="booster-chat"></core-pubnub-publish>
    </core-pubnub-subscribe>



