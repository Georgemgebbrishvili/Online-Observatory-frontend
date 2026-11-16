// Everything the game says to the rest of the site goes through here, so the
// game code never knows a URL and the website never reaches into the game.

/** A hard navigation back to the Explorer page the game was launched from:
 *  leaving the page is how fullscreen, pointer lock and keyboard lock are all
 *  released at once. */
export function exitToSite() {
  window.location.assign(window.location.pathname.replace(/\/play\/?$/, ''));
}
