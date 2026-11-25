// Existing UI tests check the Korean interface. jsdom reports an English browser,
// so pin the site language to Korean before any app module loads.
try{window.localStorage.setItem('mathgenius.lang.v1','ko');}catch{/* ignore */}
