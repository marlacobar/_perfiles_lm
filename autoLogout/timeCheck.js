
// +++++++++++++++++++++++++++++++++++++++++
// Function for Auto-logout
// +++++++++++++++++++++++++++++++++++++++++

let timer = 0;
let currSeconds = 0;

// Logout functionality after 2 hours of keeping screen idle
const expireTime = 7200; // 2 hours in seconds = 7200 

// List of events that should reset the timer
const events = ['load', 'mousemove', 'mousedown', 'touchstart', 'click', 'keypress'];

// Attach resetTimer to each event
events.forEach(event => window.addEventListener(event, resetTimer));

function resetTimer() {
  // Clear the previous interval
  clearInterval(timer);

  // Reset the seconds of the timer
  currSeconds = 0;

  // Set a new interval
  timer = setInterval(startIdleTimer, 1000);
}

function startIdleTimer() {
  // Increment the timer seconds
  //console.log(currSeconds); // For debugging, can be removed
  document.title =  (expireTime - currSeconds) + " Seg para cerrar sesión";
  currSeconds++;
  
  if (currSeconds >= expireTime) {
    SSOLogout(); // Call your logout function
  }
}

function SSOLogout() {
  console.log("User has been logged out due to inactivity.");
  // Add your logout logic here
            var oThis = this;
            $.ajax({
                type: "GET",
                async: false,
                url: "/XMII/Illuminator?service=Logout",
            }).done(function(data) {
                /*if (!document.execCommand("ClearAuthenticationCache")) {
                  window.localStorage.clear()
                  $.ajax({
                    type: "GET",
                    url: "/XMII/Illuminator?service=Logout", 
                    error: function () {
                    }
                  });
                }*/
                location.reload();
            });
}

// Set the initial timer
resetTimer();



