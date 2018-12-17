browser.devtools.panels.elements.createSidebarPane(
	"eureQa Shadow DOM Selector",
	function(sidebar) {
		sidebar.setPage("devtools/panel/panel.html");

		/* var _window; // Going to hold the reference to panel.html's `window`

		var data = [];
		var port = browser.runtime.connect({name: 'devtools'});
		port.onMessage.addListener(function() {
			_window.generateSelector(true);
		});

		sidebar.onShown.addListener(function tmp(panelWindow) {
			sidebar.onShown.removeListener(tmp); // Run once only
			_window = panelWindow;
			
			_window.respond = function(msg) {
				port.postMessage(msg);
			};
		}); */
	});