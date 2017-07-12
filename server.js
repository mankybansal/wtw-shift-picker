var webdriver = require('selenium-webdriver');
var browser = new webdriver.Builder().usingServer().withCapabilities({'browserName': 'chrome'}).build();

var xpath = "/html/body/div/table[1]/tbody/tr[1]/td/b";
function automate() {
    browser.get('https://www5.whentowork.com/cgi-bin/w2wE.dll/emptradeboard?SID=848771569420C');

    var count = 0;
    browser.findElements(webdriver.By.className("s2")).then(function (elements) {
        count = elements.length;
    }).then(function () {
        console.log("\n**********************\n" + (count - 1) + " DROPPED SHIFTS FOUND \n**********************\n");
        for (var i = 1; i < count; i++) {

            getElement(i, function (myIndex, myElement) {
                //console.log(myElement);
                myElement.getText().then(function (text) {
                    console.log(myIndex + ". " + text);
                });

                myElement.click();

                // browser.getAllWindowHandles().then(function (handles) {
                //     console.log(handles);
                //     browser.switchTo().window(handles[1]).then(function () {
                //         browser.close();
                //     });
                // });
            });


            /*

             myElement.click();

             browser.getAllWindowHandles().then(function (handles) {
             console.log(handles);
             browser.switchTo().window(handles[1]).then(function () {
             browser.close();
             });
             });*/
        }
    });


    /*.then(function () {
     browser.getAllWindowHandles().then(function (handles) {
     console.log(handles);

     browser.switchTo().window(handles[1]);
     /!*

     browser.findElement(webdriver.By.xpath(xpath)).getText().then(function (text) {
     console.log(" ---- " + text);
     });*!/


     console.log(browser.getPageSource());
     });
     });*/
}

function getElement(sourceIndex, callback) {
    browser.findElements(webdriver.By.className("s2")).then(function (elements) {
        elements.forEach(function (value, index) {
            if (index == sourceIndex)
                return callback(sourceIndex, value);
        });
    })
}
automate();
//setInterval(automate, 5000);