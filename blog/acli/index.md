Hi!

So, now that our [anode](http://anodejs.org) farm is being used for prototyping as well as for production services, it's time to talk a bit of how we manage and track our applications.
For this, let me introduce you to [Anode Command Line Interface](https://github.com/amiturgman/ACLI).

ACLI is a command line interface, developed mainly for the use in the [anode project](http://anodejs.org).  

**Why do you need another command line interface, there are already few out there...**  
Well, that's true... but believe me, the things these eyes have seen...

**No, really... why do you need another command line interface?**  
From my experience they were'nt very easy to use. Some were too buggy, some couldn't get HTML objects as a command execution result, and others were too limited of how to configure the control look & feel, command line prompt text, and more... each of the existing CLIs had some of the required functionality, but did not support other features that we needed.  
The most suitable library for our needs was the [GCLI](https://github.com/mozilla/gcli) component, which was the main inspiration for implementing ACLI, mostly in the area of the command structure.

**What are you using it for?**  
We use it to

* Manage the farm 
	* Getting information from all servers such as settings, processes and counters 
	* Invoking different actions on all servers like forcing sync process
	* Getting application list
* Manage applications
	* Viewing latest commits (integrated with github)
	* Getting information for an application, such as process info, ports, etc'
	* Restarting an application
* Each application that is hosted on the farm implements its own plugin that is integrated into the console, and allows the developers to manage it with its own specific set of commands.
* View logs for our applications, filtered by verbosity level and other params
* Invoking end-to-end tests and viewing results

Requirements
------------
In addition to the obvious features (commands history, clear/help commands), we also wanted the following:

* Supports plugins- remote commands (remote service REST APIs) integrated into the console, using [docRouter](https://github.com/anodejs/node-docrouter) metadata.  
	Supporting plugins with client side processing and styling.  
* Visualizing json data as an HTML table with auto collapsing deep elements.
* Supporting broadcasting requests when working on a farm.
* Managing environment variables and use them as part of the commands.
* Keeping command line history, plugins and environment variables persistent.
* Supporting working in parallel with few instances/tabs of the console.


![Example for 'My Board' feature](https://github.com/amiturgman/ACLI/raw/master/cli_myboard_small.jpg "ACLI with My Board")

So, why is this so exciting?
----------------------------
1. Since ACLI supports **plugins**, it's easy to use it as a **management tool in any node.js application**.  
Let's assume you develop a website using nodeJS. You can create another page under `/management` which will host ACLI, and then on the server side, implement any REST API that will be integrated into the console as a command, such as getting logs, getting list of users, making operations on users, and everything you can think of.  
_Protecting this area by authentication/authorization mechanism will also be a good idea :)_       

2. The powerful **internal json-view** control, which visualizes any json object provides a very easy-to-begin-with json-result visualizer.  
You can start creating server side commands which are integrated into the console, without writing any client-side code. If you'd like more advanced/custom look for the results, you'll be able to add client side handler that generates any HTML/jQuery object in later stages. The server side can also return HTML instead of a json object of course.  

3. Assuming that you are working on a **farm**, you will be able to create a command that **collects data from all servers**, displaying the progress of the process and then when all data is collected, displaying the results! This is a very powerful feature that allows you to create commands that collect the status from all servers, or invoking an action on all servers, such as resetting the application.  

4. **Managing environment variables** like any other native CLI will allow you to use them as part of any command 
	1. Implicitly- for example as an environment variable default value for a parameter in a command, or 
	2. Explicitly- by using the `$` sign such as `log --top $myTop`.

5. The console **automatically keeps the state** of the environment variables, the command line history and the installed plugins in the **local storage**.  
Every time you open the console, it will be in the exact state that it was when you last closed it. You won't have to install the plugins again, or re-set environment values. In addition to that, the state is kept **per each session/tab** that we opened. This way we can create several **work spaces** in which each one of them has certain environment variables, certain installed plugins, and so on... and all that in the context of the application that we are managing.

6. The **My Board** feature which allows you to keep results **always on screen**. This is kind of a panel/container on the right side of the console, in which you can drag-n-drop any command execution result. In the example above, you can see that i'm keeping the environment variables panel (which is a json-view control by the way) on the _My Board_ panel.
This way, I can always see the current environment variables setting state (the `set -o` command returns an online control which will be updated any time an environment variable is updated).
This panel can be toggled on/off at any time by pressing on its header.  

Getting Started
---------------
The following is an example of how to quickly start using the component.  

In addition to that, you can find basic and advanced [samples](https://github.com/amiturgman/ACLI/tree/master/samples) which include a node.js application with a sample plugin on [github](https://github.com/amiturgman/ACLI).  
The [design](https://github.com/amiturgman/ACLI/blob/master/design.md) document includes all the details needed in order to smoothly start integrating plugins as commands into the console.

HTML file:
	
	<body>

		<div class="cli-output" id="cliOutput"></div>
		<div class="cli-my-board" id="cliMyBoard">
			<div class="cli-my-board-close"></div>
			<div class="cli-my-board-title">My Board</div>
		</div>
		<div class="cli-input-container">
			<span class="cli-promptText" id="cliPrompt">></span>
			<input id="cliInput" class="cli-input" type="text">
		</div>

	</body>

client side js file:

    var cli =  $("#cliInput").cli(
           {
               resultsContainer: $("#cliOutput"),
               promptControl: $("#cliPrompt"),
               myBoard: $("#cliMyBoard"),
               environment: {user: { type: 'string', value: '', description: 'The current user' }},
               commands: [],
			   context: { some: 'object' },
               welcomeMessage: "Welcome to anode console!<br/>. Type <b>help</b> to start exploring the commands currently supported!<br/>"
           }
       );
	   
server side plugin with a command that gets a template and a querystring parameters and returns a JSON object:

	var express = require('express'),
    app = express.createServer(),
    docRouter = require('docrouter').DocRouter;

	module.exports = app;

	app.use(docRouter(express.router, '/api/someplugin', function(app) {

		app.get('/json/:tparam', function(req, res) {
				var tparam = req.params.tparam1;
				var qparam = req.query['qparam'];

				var o = {tparam: tparam, qparam: qparam};
				res.writeHead(200, {'Content-Type': 'application/json' });
				res.end(JSON.stringify(o));
			},
			{
				id: 'sample_json',
				name: 'json',
				usage: 'json tparam qparam',
				example: 'json tparam1 qparamValue',
				doc: 'sample for a GET command getting a template param and a query param',
				params: {
					"tparam" : {
							"short": "b",
							"type": "string",
							"doc": "template param",
							"style": "template",
							"required": "true"
						},
					"qparam" : {
							"short": "q",
							"type": "string",
							"doc": "query string param",
							"style": "query",
							"required": "true"
						}
				}
			}
		);
	}));

	
You are more than welcome to use this plugin.  
Your feedback is highly appreciated! feel free to test it, open issues on [github](https://github.com/amiturgman/ACLI) or send questions and comments to [Ami Turgman](mailto:ami.turgman@microsoft.com).


	   
	   