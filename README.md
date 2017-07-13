# wtw-shift-picker
Automatic WhenToWork Dropped Shift Picker

### Installing
After cloning, and entering the directory, install all the modules with the following command
```
$ [sudo] npm install
```
Replace the webdriver if using a different browser or different operating system.

### Running
The app is in default ```debug mode```. To run, simply
```
$ node server.js -url default
```
Specify the ```-url``` by replacing ```default``` with the new date tradeboard page url

To run in ```live mode``` use the ```-live``` param as follows
```
$ node server.js -url [url] -live
```

Specify  ```-timeout``` as follows
```
$ node server.js -url [url] -live -timeout [timeout]
```
default timeout without setting this param is ```5 seconds```

The app requires ```forever``` to be installed as it restarts the application frequenty or incase an uncaught exception occurs.

To run using ```forever```, 
```
$ [sudo] forver server.js -url [url] [-live] [-timeout] [timeout]
```

###Stopping/Errors
If the app crashes and didn't stop ```forever```, then
```
$ [sudo] killall -9 node
```

### Authors
  * **Mayank Bansal** - [Portfolio](https://manky.me)
