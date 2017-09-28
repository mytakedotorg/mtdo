interface extendedEvent extends Event {
  handled: boolean;
}
/**
* Small screen navigation toggle
**/
function addNavEvents() {
  let body = document.body;
  let navToggle = document.getElementsByClassName("header__nav-toggle")[0];
  let navMenu = document.getElementsByClassName("nav")[0];

  if (navToggle) {
    navToggle.addEventListener("click", function(e: extendedEvent) {
      if (!e.handled) {
        toggleNav();
        e.handled = true;
      }
    });
  }

  body.addEventListener("click", function(e: extendedEvent) {
    if (body.classList.contains("fade") && !e.handled) {
      toggleNav();
      e.handled = true;
    }
  });

  function toggleNav() {
    if (navMenu) {
      if (navMenu.classList.contains("collapse")) {
        navMenu.classList.remove("collapse");
      } else {
        navMenu.classList.add("collapse");
      }
    }

    if (body.classList.contains("fade")) {
      body.classList.remove("fade");
    } else {
      body.classList.add("fade");
    }
  }
}

addNavEvents();
