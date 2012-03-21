We recently spent some time with [Charles Torre from Channel 9](http://channel9.msdn.com/Blogs/Charles/anode-An-Experimental-nodejs-Platform-for-Windows-Azure), discussing node.js at Microsoft and the project we have been working on, __anode__. 

<iframe style="height:288px;width:512px" src="http://channel9.msdn.com/Blogs/Charles/anode-An-Experimental-nodejs-Platform-for-Windows-Azure/player?w=512&h=288" frameBorder="0" scrolling="no"></iframe>

We thought it would be a nice opportunity to launch our blog and share some of our experiences. Currently there are no plans to release anode as a service, but we are pleased to share the modules we have created as part of the project.

### Some background

Microsoft is probably the most diverse software company in the world. We build almost every type of software out there. It's amazing to witness how almost every software piece we use at the company is 100% home grown. I don't think there's any other company in the world like that: the operating systems we use on our desktops, laptops, servers and phones, the office suite, the IDE, compiler, source control, build system, issue tracking, project management, docs management, databases, our game room has Xbox and Kinect. Hell, even the phone system now uses Lync. Crazy. Inspiring. Addictive...

With that in mind, when designing new systems, decisions are apperently simple: run on Windows, host on IIS, write in .NET, use WCF, source control in TFS, data on SQL and so forth. However, good engineers understand that it is important to choose the right tools for the job. When you only have one option for each part of your stack, you don't make choices and naturally you will end up with sub-optimal solutions.

And there are some really good engineers at Microsoft!

Luckily, one of those engineers led our team a while back. He understood that he needs to keep us on our toes and make sure we don't find ourselves in this nice and happy [NIH syndrome](http://en.wikipedia.org/wiki/Not_invented_here) cosiness. He used to send out those emails encouraging us to play around and try new technologies and kept reminding us that we need to keep looking for the right tools, even if, god forbid, they were not created in Redmond.

One of these emails was about [node.js](http://nodejs.org). That was 8 months ago, so the node.js community was already pretty crazy. There were about 5,000 modules at the npm repository back them (today there are over 8,000) and things have been moving fast. Two of us decided to spend a day and play around.

### Not optimized for prototyping

One of the pain points we had at the time was the turn-around time for publishing new code. We were doing a lot of experimentation and prototyping and the stack we were using (.NET/WCF/IIS/Azure; msbuild/mstest/TFS) practically meant a turn-around of about 2 hours:

 1. Build and test locally using Azure dev fabric and mocks
 1. Submit for the TFS build server to build and create a package
 1. Upload package to azure
 1. Deploy to staging
 1. Verify nothing broke by running tests against staging
 1. VIP-swap to production
 
Another big pain was the fact that it took about one minute for logs to be transfered from our roles into the Azure Table, from which we needed to download them and only then figure out what went wrong.

Now all this process was needed not nessesarily because we had millions of users who needed super high quality code (a lot of the stuff we did was experimental in nature). The main reason we needed all this was because of the 2h/1m turn-around. Since you couldn't really "develop on the cloud", you had to make sure things are going to work before you deployed, because once something didn't work (usually it was one of those "it all worked locally, damn it" bugs), 2 more hours went out the window...

We kept trying to improve the process: reduce testing time, improve our simulators to make sure they behave like the cloud, build in parallel, aggregate changes into less deployments, use log viewers we found to monitor the system. But we were an order of magnitude away from just writing a few lines of code, see if they worked okay on the cloud and integrated well with everything else and repeatedly do that over and over. And that's how we wanted to work…

### From 7,200 to 10 in one day

Amazingly, after a day of work in a nice little coffee place in Tel-Aviv,  borrowing ideas from [Smarx Role](http://smarxrole.codeplex.com) and other PaaS providers, we managed to create an Azure role that "listened" on a blob account. When a blob container changed, it downloaded the code from that container, spawned `node index.js` (with an allocated `process.env.PORT`) and using [http-proxy](https://github.com/nodejitsu/node-http-proxy), routed incoming requests into these apps. When you went into the blob and updated one of the files, the role re-fetched the changes and respawned the app. We also grabbed `stdout/err` and pushed it almost immediately into an Azure Table. We wrote a little web app that tailed the table and showed recent logs in almost real-time.

So turn-around dropped from 2 hours to 10 seconds.

### Magic!

Our team was pretty excited. We felt that there's a new tool in the toolbox that's worth trying out. Gradually, people started using node.js for their experiments and protoypes and hosted their apps on our nice little PaaS-like role. People were happy that they can actually write the code and run it on the cloud so quickly, and if something didn't look good, they just updated it and it's instantly published.

Node.js and the ecosystem around it proved to be an incredibly friendly stack to learn and use. We found many useful node modules and a lot of high quality documentation and conversation shared openly by some awesome hackers.

Today we have a team of about 30 people (located in Tel-Aviv, San Francisco and Seattle) that use node.js and host their apps on our little platform.

Another coincidental development was that two other teams at Microsoft started looking at node.js seriously around the same time: __(1)__ The folks at the developer division joined efforts with [Joyent](http://www.joyent.com) in order to create a native Windows port for node.js (we initially used the cygwin port), so today we have node.js running and behaving beautifully on Windows; and __(2)__ the Azure team started working on [iisnode](https://github.com/tjanczuk/iisnode) and the [Azure Node.js SDK](http://www.windowsazure.com/en-us/develop/nodejs), which makes our lives so much easier running our node.js PaaS on Azure.

Ever since, we added some nice improvements, but we try to keep things simple and tailored to our actual needs:

 * Code is automatically fetched from git and not from blob storage. Working in deltas makes so much sense in this context.
 * We deploy multiple git branches as means to isolate apps in development from production (but still want them all on the cloud).
 * We run tests against the deployed apps when we merge code to production.
 * We provide a MongoDB as a service for apps.
 * We use a fun web command line console that to interact with the system and apps.
 * We measure useful metrics for apps and provide standard request logging.
 
Currently, there is no plan to make anode externally available as a service, but we do have a commitment to open-source as many components of the system as we can and share our experience.

__We started this site as home to these components and we plan to provide some more context on what we do through the blog.__


Feel free to [contact us](https://github.com/anodejs) if you have any questions or comments,  
__The anode crew__