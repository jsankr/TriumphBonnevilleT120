(function(){
 let theme='light';
 try{if(localStorage.getItem('t120-theme')==='dark')theme='dark'}catch{}
 document.documentElement.dataset.theme=theme;
})();
if(!location.pathname.includes('/workshop/')&&!document.querySelector('script[src="../boot-theme.js"]')){
 const anchors=['servicePlanner','riderTips','modelTorque','catalogue','inspector','torqueReference','maintenance','assistant','referenceDesk','manualLibrary','references','specsTitle'];
 if(anchors.includes(location.hash.slice(1))||new URLSearchParams(location.search).has('model')){
  location.replace('workshop/index.html'+location.search+location.hash);
 }
}
