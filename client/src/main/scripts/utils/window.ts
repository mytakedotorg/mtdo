/**
* Small screen navigation toggle
**/
import { LoginCookie } from "../java2ts/LoginCookie";
import { Routes } from "../java2ts/Routes";

const body = document.body;
const loginDiv = document.getElementById("login");
addNavEvents(loadUser());
let userDropdown: Element | null;
if (loginDiv && loginDiv.children[1]) {
  userDropdown = loginDiv.children[1].children[0];
} else {
  userDropdown = null;
}

function addNavEvents(userNav?: boolean) {
  const navToggle = document.getElementsByClassName("header__nav-toggle")[0];
  const navMenu = document.getElementsByClassName("nav")[0];

  function mainNavEvent(e: Event) {
    if (
      userDropdown &&
      !userDropdown.classList.contains("header__dropdown--collapse")
    ) {
      toggleUserNav();
    } else if (!e.defaultPrevented) {
      toggleMainNav();
    }
    e.preventDefault();
  }

  function userNavEvent(e: Event) {
    if (navMenu && !navMenu.classList.contains("collapse")) {
      toggleMainNav();
    } else if (!e.defaultPrevented) {
      toggleUserNav();
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
    } else if (
      userDropdown &&
      !userDropdown.classList.contains("header__dropdown--collapse") &&
      !e.defaultPrevented
    ) {
      if (
        e.srcElement &&
        !e.srcElement.classList.contains("header__icon--login")
      ) {
        if (!e.srcElement.classList.contains("header__dropdown-link")) {
          toggleUserNav();
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

  function toggleUserNav() {
    if (userDropdown) {
      if (userDropdown.classList.contains("header__dropdown--collapse")) {
        userDropdown.classList.remove("header__dropdown--collapse");
      } else {
        userDropdown.classList.add("header__dropdown--collapse");
      }
    }
  }

  if (navToggle) {
    navToggle.addEventListener("click", mainNavEvent);
  }

  if (userNav && loginDiv) {
    loginDiv.children[0].addEventListener("click", userNavEvent);
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
  if (loginCookieStr) {
    const loginUi: LoginCookie = JSON.parse(JSON.parse(loginCookieStr));
    if (loginDiv) {
      loginDiv.innerHTML =
        '<a class="header__icon header__icon--login" href="#">' +
        loginUi.username +
        "</a>" +
        '<div class="header__dropdown-container">' +
        '<ul class="header__dropdown header__dropdown--collapse">' +
        // Be sure to change SASS variable if you add or remove nav links (cd assets && grep -Rn user-nav-items: *)
        '<li class="header__dropdown-list-item"><a class="header__dropdown-link" href="' +
        Routes.DRAFTS_NEW +
        '">New Take</a></li>' +
        '<li class="header__dropdown-list-item"><a class="header__dropdown-link" href="/' +
        loginUi.username +
        '">Published Takes</a></li>' +
        '<li class="header__dropdown-list-item"><a class="header__dropdown-link" href="' +
        Routes.DRAFTS +
        '">Drafts</a></li>' +
        '<li class="header__dropdown-list-item"><a class="header__dropdown-link" href="#">Bookmarks</a></li>' +
        '<li class="header__dropdown-list-item"><a class="header__dropdown-link" href="#">Profile</a></li>' +
        '<li class="header__dropdown-list-item"><a class="header__dropdown-link" href="#">Settings</a></li>' +
        '<li class="header__dropdown-list-item"><a class="header__dropdown-link" href="#">Help</a></li>' +
        '<li class="header__dropdown-list-item"><a class="header__dropdown-link" href="' +
        Routes.LOGOUT +
        '">Logout</a></li>' +
        "</ul>" +
        "</div>";
      return true;
    }
  } else {
    if (loginDiv) {
      loginDiv.innerHTML =
        '<a class="header__icon header__icon--login" href="' +
        Routes.LOGIN +
        '">Login</a>';
    }
  }
  return false;
}
