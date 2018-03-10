/**
 * Small screen navigation toggle
 **/
import { LoginCookie } from "../java2ts/LoginCookie";
import { Routes } from "../java2ts/Routes";

const body = document.body;
const loginDiv = document.getElementById("login");
loadUser();
addNavEvents();

function addNavEvents() {
  const navToggle = document.getElementsByClassName("header__nav-toggle")[0];
  const navMenu = document.getElementsByClassName("nav")[0];

  function mainNavEvent(e: Event) {
    if (!e.defaultPrevented) {
      toggleMainNav();
    }
    e.preventDefault();
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
          toggleMainNav();
          e.preventDefault();
        }
      }
    }
  }

  function toggleMainNav() {
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

  if (navToggle) {
    navToggle.addEventListener("click", mainNavEvent);
  }

  body.addEventListener("click", bodyEvent);
  body.addEventListener("touchstart", bodyEvent);
}

(window as any).YTConfig = {
  host: "https://www.youtube.com"
};

function loadUser() {
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
  const navList = document.getElementById("nav-list");
  const loginLink = document.getElementById("login-link");
  if (loginCookieStr) {
    // User is logged in
    const loginUi: LoginCookie = JSON.parse(JSON.parse(loginCookieStr));
    if (navList && loginLink) {
      (loginLink as HTMLAnchorElement).href =
        "/" +
        loginUi.username +
        "?" +
        Routes.PROFILE_TAB +
        "=" +
        Routes.PROFILE_TAB_EDIT;
      loginLink.children[0].innerHTML = "Account/Profile";
      const tabIndex = navList.children.length + 2;
      navList.innerHTML +=
        '<li class="nav__list-item nav__list-item--top">' +
        '<a class="nav__link nav__link--top" href="' +
        Routes.LOGOUT +
        '" tabindex="' +
        tabIndex +
        '">' +
        '<span class="nav__link-text nav__link-text--top">Logout</span>' +
        "</a>" +
        "</li>";
    } else {
      const msg = "window: navigation list and login link not found";
      throw msg;
    }
  }
}

window.onerror = function(
  message: string,
  source?: string,
  lineno?: number,
  colno?: number,
  error?: Error
) {
  const msg =
    "Something went wrong. To help us figure it out, please copy and paste the information from below into an email to team@mytake.org. Thank you." +
    "\n\n" +
    "Error message: " +
    message +
    "\nURL: " +
    window.location.href +
    "\nsource: " +
    source +
    "\nsource: " +
    source +
    "\nlineno: " +
    lineno +
    "\ncolno: " +
    colno +
    "\nerror: " +
    JSON.stringify(error);
  alert(msg);
};
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(search: string, pos = 0) {
    return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
  };
}
