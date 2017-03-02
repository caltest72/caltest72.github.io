 window.addEventListener("load", function(){
    window.cookieconsent.initialise({
      "palette": {
        "popup": {
          "background": "#edeff5",
          "text": "#838391"
        },
        "button": {
          "background": "#4b81e8"
        }
      },
      onInitialise: function (status) {
      var type = this.options.type;
      var didConsent = this.hasConsented();
      if (type == 'opt-in' && didConsent) {
        // enable cookies
        console.log(this);
        console.log(this.options.cookie);
      }
      if (type == 'opt-out' && !didConsent) {
      document.cookie ="cookieconsent_status" + '=""; path=/';
        console.log(document.cookie);
        console.log(this);
        console.log(this.options.cookie);

      }
    },

    onStatusChange: function(status, chosenBefore) {
      var type = this.options.type;
      var didConsent = this.hasConsented();
      if (type == 'opt-in' && didConsent) {
        // enable cookies
      }
      if (type == 'opt-out' && !didConsent) {
        document.cookie ="cookieconsent_status" + '=Value=""; path=/';
        console.log(document.cookie);

        window.location = "http://www.google.com";

      }
    },

    onRevokeChoice: function() {
      var type = this.options.type;
      if (type == 'opt-in') {
        // disable cookies
      }
      if (type == 'opt-out') {
        // enable cookies
      }
    },
      "theme": "classic",
      "revokable": "true",
      "autoOpen": "true",
      "position": "top",
      "static": true,
      "type": "opt-out",
      "content": {
        "href": "/cookie.html",
        "deny": "I want to leave.",
      },

    })});


function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}