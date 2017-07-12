# wtw-shift-picker
Automatic WhenToWork Dropped Shift Picker

### Installing
After cloning, and entering the directory, install all the modules with the following command
```
$ npm install
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

### Authors
  * **Mayank Bansal** - [Portfolio](https://manky.me)
