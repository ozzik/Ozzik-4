/* ===== Main ===== */

var Main = {
	// Navigation system
	NAVIGATION_PUSH: 1,
	NAVIGATION_SWITCH: 2,
	BASE_TITLE: "Oz Pinhas",
	navigationTransitions: [],
	poppedNavigationTransition: [],
	currentState: {},
	dontAnalytics: false,
	hooks: {
		resize: [],
		scroll: []
	},
	viewport: {
		windowWidth: 0,
		windowHeight: 0,
		pageScrollHeight: 0,
		scrollbarWidth: 0
	},

	init: function() {
		// Detecting landing page
		Main.landingView = {
			view: _landingData.page,
			meta: _landingData.meta,
			url: ""
		};

		Home.setup();
		Showcases.setup();
		Projects.setup();

		Main.hook_events();

		Main.setup_analytics();

		// Resize message
		Main.setup_screen_width_requirements();
	},

	/* Events */
	hook_events: function() {
		window.addEventListener("resize", Main.handle_resize);
		window.addEventListener("scroll", Main.handle_scroll);
	},

	hook: function(event, fn) {
		Main.hooks[event].push(fn);
	},

	handle_resize: function() {
		for (var i = 0; i < Main.hooks.resize.length; i++) {
			Main.hooks.resize[i]();
		}

		Main.fetch_viewport_metrics();
	},

	handle_scroll: function() {
		for (var i = 0; i < Main.hooks.scroll.length; i++) {
			Main.hooks.scroll[i]();
		}
	},

	fetch_viewport_metrics: function() {
		Main.viewport.windowWidth = window.innerWidth;
		Main.viewport.windowHeight = window.innerHeight;
		Main.viewport.pageScrollHeight = document.documentElement.scrollHeight;

		Main.fetch_scrollbar_metrics();
	},
	
	fetch_scrollbar_metrics: function() {
		Main.viewport.scrollbarWidth = window.innerWidth - document.documentElement.offsetWidth;
	},

	/* History */
	push_history: function(data) {
		console.log("=== push", data);
		history.pushState({ data: data }, null, data.url);

		Main.set_page_title(data.title);

		Main.currentState = data;
	},

	handle_history_pop: function(e) {
		console.log("=== pop", e);
		// Back to home
		if (e.view === "home") {
			if (Main.currentState.transition === Main.NAVIGATION_PUSH) {
				Projects.unload();
			} else {
				Navline.select(e.meta, true);
			}
		} else if (e.view === "project") {
			Projects.load(Showcases.catalog[e.meta], null, true);
		}

		Main.currentState = e; // Saving current state info (as if triggered via push_history)
	},

	/* Messages */
	setup_screen_width_requirements: function() {
		// Setup
		Main.minScreenWidth = document.querySelector(".home-work").offsetWidth;
		Main.isScreenWidthMsg = false;

		Main.create_screen_width_message();
		
		Main.hook("resize", Main.toggle_screen_width_message);
		Main.toggle_screen_width_message();
	},

	create_screen_width_message: function() {
		var div = document.createElement("div"),
			html = "",
			isMac = (navigator.platform === "MacIntel");

		div.className = "overlay va-wrapper overlay-screen-width";

		html += '<div class="va-content"><div class="screen-width-wrapper column">';
		html += '<div class="screen-width-art column ' + (isMac ? "mac" : "win") + '"></div>';
		html += '<h2>This website isn\'t responsive (!)</h2>';
		html += '<p>Instead of making this website responsive I’ve chosen to work on another side project or just watch another hour of Grey’s Anatomy.</p>';

		if (screen.width >= Main.minScreenWidth) {
			html += '<p>Now, buddy, a little birdy told me your </br>screen could fit this website perfectly.</br> Please push the ' + (isMac ? "green" : "maximize") + ' button, thank you.</p>';
			html += '<div class="screen-width-instructions column ' + (isMac ? "mac" : "win") + '"></div>';
		} else {
			html += '<p>Please use a screen of at least 768px wide.</p>';
		}

		html += '</div></div>';

		div.innerHTML = html;

		document.body.appendChild(div);
	},

	toggle_screen_width_message: function() {
		if (window.innerWidth < Main.minScreenWidth && !Main.isScreenWidthMsg) {
			Main.isScreenWidthMsg = true;
			$(".overlay-screen-width").addClass("active");
		} else if (window.innerWidth >= Main.minScreenWidth && Main.isScreenWidthMsg) {
			Main.isScreenWidthMsg = false;
			$(".overlay-screen-width").removeClass("active");
		}
	},

	setup_analytics: function() {
		var links = document.querySelectorAll(".page[data-for='about'] a");
		
		for (var i = 0; i < links.length; i++) {
			links[i].addEventListener("click", function() {
				_.send_analytics("about", "link", this.getAttribute("href"));
			});
		}

		Main.dontAnalytics = _isMe;
	},

	set_page_title: function(title) {
		document.title = Main.BASE_TITLE + (title ? " - " + title : "");
		console.log("updated title, pageview")
		window['_gaq'] && _gaq.push(['_trackPageview']);
	}
};

// History API
setTimeout(function() {
	window.addEventListener("popstate", function(e) {
		if (e.state !== null) {
			Main.handle_history_pop(e.state.data);
		} else { // Back to main
			Main.handle_history_pop(Main.landingView);
		}
	}, false);
}, 500);

document.addEventListener("DOMContentLoaded", Main.init);