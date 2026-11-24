// Preserve bookmarked workshop page names, query parameters and section anchors.
const name=location.pathname.split('/').pop();
if(['exploded.html','engine-xray.html','photo-teardown.html','real-photo-gallery.html','manual-index.html','catalogue.html','electrical.html'].includes(name)){
 location.replace('workshop/'+name+location.search+location.hash);
}
