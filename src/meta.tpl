// ==UserScript==
// @name          TagPro 3D
// @description   TagPro in 3D!
// @version       ${version}
// @author        Kera
// @grant         GM_getResourceURL
// @namespace     https://github.com/keratagpro/tagpro-3d/
// @icon          https://keratagpro.github.io/tagpro-3d/assets/icon.png
// @downloadUrl   https://keratagpro.github.io/tagpro-3d/tagpro-3d.user.js
// @updateUrl     https://keratagpro.github.io/tagpro-3d/tagpro-3d.meta.js
// @include       http://tagpro.koalabeast.com/game
// @include       https://tagpro.koalabeast.com/game
// @include       http://tangent.jukejuice.com*
// @include       https://tangent.jukejuice.com*
// @include       https://bash-tp.github.io/tagpro-vcr/game*.html
<% Object.entries(resources).forEach(res => { %>// @resource      ${res[0]} ${res[1]}
<% }); %><% requires.forEach(url => { %>// @require       ${url}
<% }); %>// ==/UserScript==
