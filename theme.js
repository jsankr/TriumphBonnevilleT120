// Light/dark theme: follows the system setting until the visitor chooses, then remembers the choice in this browser.
// Loaded in <head> without defer so the right theme is set before the first paint.
(function(){
  'use strict';
  var KEY='t120-theme',root=document.documentElement,saved=null;
  try{saved=localStorage.getItem(KEY)}catch(e){}
  var system=function(){return window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'};
  var apply=function(t){root.setAttribute('data-theme',t);var b=document.getElementById('themeToggle');if(b){b.setAttribute('aria-label',t==='light'?'Switch to dark theme':'Switch to light theme');b.setAttribute('aria-pressed',String(t==='light'))}var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='light'?'#e9ecef':'#0d0f12')};
  apply(saved==='light'||saved==='dark'?saved:system());
  if(window.matchMedia)try{matchMedia('(prefers-color-scheme: light)').addEventListener('change',function(){var s=null;try{s=localStorage.getItem(KEY)}catch(e){}if(!s)apply(system())})}catch(e){}
  document.addEventListener('DOMContentLoaded',function(){
    var b=document.getElementById('themeToggle');if(!b)return;
    apply(root.getAttribute('data-theme'));
    b.addEventListener('click',function(){
      var next=root.getAttribute('data-theme')==='light'?'dark':'light';
      root.classList.add('theme-anim');apply(next);try{localStorage.setItem(KEY,next)}catch(e){}
      setTimeout(function(){root.classList.remove('theme-anim')},450);
    });
  });
})();
