/**
* Small screen navigation toggle
**/
function addNavEvents() {
  let body = document.body;
  let navToggle = document.getElementsByClassName("header__nav-toggle")[0];
  let navMenu = document.getElementsByClassName("nav")[0];

  function navEvent(e: Event) {
    if (!e.defaultPrevented) {
      toggleNav();
      e.preventDefault();
    }
  }

  function bodyEvent(e: Event) {
    if (body.classList.contains("fade") && !e.defaultPrevented) {
      if (
        e.srcElement &&
        !e.srcElement.classList.contains("header__nav--icon")
      ) {
        if (
          !e.srcElement.classList.contains("nav__link") &&
          !e.srcElement.classList.contains("nav__link-text")
        ) {
          toggleNav();
          e.preventDefault();
        }
      }
    }
  }

  if (navToggle) {
    navToggle.addEventListener("click", navEvent);
  }

  body.addEventListener("click", bodyEvent);
  body.addEventListener("touchstart", bodyEvent);

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

(window as any).YTConfig = {
  host: "https://www.youtube.com"
};

interface LoginCookie {
  username: string;
}

const cookieStr = document.cookie;
if (cookieStr) {
  const loginUi: LoginCookie = JSON.parse(
    JSON.parse(cookieStr.split("; ")[0].split("=")[1])
  );
  const loginLink = document.getElementById("login");
  if (loginLink) {
    loginLink.innerText = loginUi.username;
    loginLink.setAttribute("href", "/logout");
  }
}
