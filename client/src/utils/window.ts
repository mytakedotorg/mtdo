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

function getCookieValue(a: string): string {
  // https://stackoverflow.com/questions/5639346/what-is-the-shortest-function-for-reading-a-cookie-by-name-in-javascript?noredirect=1&lq=1
  const b = document.cookie.match("(^|;)\\s*" + a + "\\s*=\\s*([^;]+)");
  if (b) {
    const c = b.pop();
    return c ? c : "";
  }
  return "";
}

const loginCookieStr = getCookieValue("loginui");
if (loginCookieStr) {
  const loginUi: LoginCookie = JSON.parse(JSON.parse(loginCookieStr));
  const loginLink = document.getElementById("login");
  if (loginLink) {
    loginLink.innerText = loginUi.username;
    loginLink.setAttribute("href", "/logout");
  }
}
