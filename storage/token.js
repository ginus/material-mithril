export let getToken = () => {
  let remembered = localStorage.getItem("auth_token_remembered");
  if (remembered) return localStorage.getItem("auth_token");
  return sessionStorage.getItem("auth_token");
};

export let setToken = (value, remember) => {
  if (remember) {
    localStorage.setItem("auth_token_remembered", true);
    localStorage.setItem("auth_token", value);
    sessionStorage.removeItem("auth_token");
  } else {
    localStorage.setItem("auth_token_remembered", false);
    localStorage.removeItem("auth_token");
    sessionStorage.setItem("auth_token", value);
  }
};
