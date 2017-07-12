var webdriver = require('selenium-webdriver');
var browser = new webdriver.Builder().usingServer().withCapabilities({'browserName': 'chrome'}).build();


function automate() {
    browser.get('https://www5.whentowork.com/cgi-bin/w2wE.dll/emptradeboard?SID=848771569420C');
    browser.findElements(webdriver.By.className("s2")).then(function(elements){
        elements.forEach(function (element) {
            element.getText().then(function(text){
                console.log(text);
            });
        });
    });
}
setInterval(automate, 5000);