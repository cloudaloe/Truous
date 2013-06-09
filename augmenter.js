// TODO: Switch to OAuth and cache the Google API loading
// TODO: Push the results into the UI
// TODO: Add performance tracking into some metrics library
// TODO: Integrate into server-side API errors tracking and alerting mechanism
// TODO: Confirm impact on page load time
// TODO: Server-side porting and cross-browser testing and adjustment

function log(text) {
	console.log(">> Truous: " + text);
}

//
// contents of this function will be injected into the browser document's global 
// context, so that the Google API loading callback can start things off.
//
function injectedCode()
{
	function log(text) {
		console.log(">> Chrome Augmenter Extension injected script: " + text);
	}

	function getTopic() {
		var topic = document.querySelectorAll("h1");
		if (topic.length == 0) {
			log("Unexpected parsing result: no h1 header found");
			return null;
		}
		if (topic.length > 1) {
			log("Unexpected parsing result: more than one h1 header found");
			return null;
		}
		else {
			log("Detected topic " + topic[0].textContent);
			return topic[0].textContent;
		}
	}

	function AddFromFreebase() {
	
		//
		// The conversion from Wikipedia entry to Freebase topic name
		//
		function topicHeuristicConversion_wikipediaToFreebase(topic)
		{
			// TODO: remove /en/ hack
			var str = '/en/' + topic; 
			var topic_id = str.replace(/\s+/g,'_').toLowerCase(); // replaces all spaces with _ and turns all lowercase
			return topic_id	
		}
	
		if (topic = getTopic())
		{
			var result;
			log("Fetching data from freebase");
			var topic_id = topicHeuristicConversion_wikipediaToFreebase(topic)
			log(topic_id);
			var service_url = 'https://www.googleapis.com/freebase/v1/topic';
			
			$.getJSON(service_url + topic_id + '?callback=?') // the Ajax call to Google API
			.done(function(result) {
				//log(result.id);
				if (result.error)
				{
					log("Could not find equivalent Freebase topic (Google API response: " + JSON.stringify(result.error) + ")");
				}
				else
				{
					officialWebsiteText = result.property['/common/topic/official_website'];
					if (typeof officialWebsiteText !== 'undefined') {
						log("Determined website: " + officialWebsiteText.values[0].text);
						// TBD: stick into page's html with aesthetic styling
					}
					
					socialMediaPresence = result.property['/common/topic/social_media_presence'];
					if (typeof socialMediaPresence !== 'undefined') {
						for (var i=0; i<socialMediaPresence.count; i++) {
							log(socialMediaPresence.values[i].text) 
							// TBD: stick into page's html with aesthetic styling
							//      and logic for picking which social site is relevant
						}
					}
				}
			})
			.fail(function( jqxhr, textStatus, error ) {
				var err = textStatus + ', ' + JSON.stringify(error);
				log("Failed receiving response from Google API for finding equivalent Freebase topic. This might be a network error (api error details: " + err + ")");
			});
		}
	}		
	

	//
	// Callback for Google's javascript API having been loaded
	//
	function onLoad() {
		log("Loading specific Google API");
		gapi.client.setApiKey('AIzaSyDVH3vdQ0R7dv3uiOwMqF0vyHCpRfi6Tnw');
		gapi.client.load('freebase', 'v1', function(){ 
			log("Google freebase API loaded"); 
			AddFromFreebase();	
		});
	}
}

//
// Inject javascript code into global context
//
function injectJavascript(func) {

  // getting the function's source code content 
  var text = func.toString();
  var codeToPush = text.substr(text.indexOf("{")+1, text.lastIndexOf("}")-text.indexOf("{")-2); 

  // injecting that code
  var elem = document.createElement('script');
  elem.textContent = codeToPush;
  document.getElementsByTagName("head")[0].appendChild(elem);  
}

//
// 
//
function addIframe() {

  // getting the function's source code content 
  //var elem = document.createElement('div');  
  var codeToPush = "<div><iframe height=\"130\" src=\"http://www.google.com/\"></iframe></div>"
  
  // injecting that code
  //elem.textContent = codeToPush;
  var ipoint = document.getElementsByTagName("body")[0];  
  ipoint.insertAdjacentHTML('afterbegin', codeToPush)
}

// 
// Dynamically load a remote javascript file
//
function loadjs(filename){
  var elem=document.createElement('script')
  elem.setAttribute("type","text/javascript")
  elem.setAttribute("src", filename)
  document.getElementsByTagName("head")[0].appendChild(elem)  
}

//
// Load Google's basic javascript API.
// Specific Google API needs to be called after this passed.
//

log("starting");
addIframe();

