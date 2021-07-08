# FUNCTIONAL TEST RUNNER (eol-ft-runner)
This framework uses Selenium-webdriver, wd, Appium & CucumberJS to run UI tests written in BDD format.
This project is a work in progress. As we build towards v1.0, you can checkout the "Projects" section of GitHub to keep track of our progress.

![Description poster](/docs/readme-poster.png)

#### How to install
``` shell
npm install eol-ft-runner -D
```

#### Browser Support status
| Browser  | macOS/Linux | Windows |
| ------------- | ------------- | ------------- |
| Chrome  | ✅  | ✅  |
| Chrome Headless  | ✅  | ✅  |
| Firefox  | ✅  | ✅  |
| Firefox Headless  | ✅ | ✅ |
| Safari  | ✅ | N/A |
| Edge  | ✅ | ✅ |
| Edge Headless | 🛠 WIP | 🛠 WIP |
| Android Chrome  | ✅ | ✅ |
| iOS Safari  | ✅ | N/A |
| Internet Explorer  | N/A  | 🛠 WIP |
| Opera  | ❌ | ❌ |
| Brave  | ❌ | ❌ |  

#### Mobile App status
| Platform  | macOS/Linux | Windows |
| -------- | ----------- | ---------- |
| Android App  | ✅ | ✅ |
| iOS App  | ✅ | N/A |

### Note on browser drivers
Browser drivers are not bundled with this package. You will need to install the browser drivers (Chromedriver or Gecko Driver or Edge Driver) - in your project using the below command:
``` shell
npm install chromedriver --save-dev

(or)

npm install geckodriver --save-dev

(or)

npm install @sitespeed.io/edgedriver --save-dev
```
This will allow you to control your browser driver version, based on the browser version you are testing against.


## Run GUI test(s) on your local environment:
Run your test with a configuration file:
``` shell
./node_modules/eol-ft-runner/bin/ft-runner --config config.json
```
Run your test with CLI arguments:
``` shell
./node_modules/eol-ft-runner/bin/ft-runner --config config.json --browser chrome --tags @sanity --cores 2
```
Run headless using `--headless` (only supported on chrome/firefox):
``` shell
./node_modules/eol-ft-runner/bin/ft-runner --config config.json --browser chrome --tags @sanity --cores 2 --headless
```
Run using npm scripts:
``` shell
npm run test -- --config config.json --browser chrome --tags @sanity --cores 2
```
In your package.json, the npm script `test` should point to the ft-runner executable: `./node_modules/eol-ft-runner/bin/ft-runner`.

`browser` can be 'chrome', 'firefox', 'safari', 'edge', 'android', 'ios'.

`tags` are cucumber tags found on the top of a scenario inside a feature file. Tags are optional, and will execute all scenarios if not provided. To run multiple tags, use `--tags "@sanity @smoke @etc"`.

`cores` are the number of parallel threads of execution specified in the format "--cores 3" or "--cores 10". Cores are optional, and will run on 2 cores if not specified. For Safari & Edge browsers, cores will be defaulted to 1 due to their respective [browser instance restrictions](https://github.com/SeleniumHQ/selenium/issues/5057).

### Sample config.json file
```json
{
  "configurations": {
    "browser": [ "chrome" ],
    "tags": "@sanity",
    "featurePath": [ "test/features/" ],
    "stepDefinitionPath": [ "test/step_definitions/" ],
    "supportFolderPath": [ "test/support" ],
    "reportFolderPath": "test/reports",
    "rerun": true,
    "remoteAppiumHub": {
      "address": "https://www.example-cloud.com/wd/hub",
      "port": 8081
    },
    "desiredCapabilities": {
      "chrome": {
        "browserName": "chrome",
        "unhandledPromptBehavior": "accept"
      },
      "ios": {
        "browserName": "Safari",
        "platformName": "iOS",
        "platformVersion": "14.1",
        "deviceName": "iPhone 12",
        "automationName": "XCUITest",
        "startIWDP": true,
        "newCommandTimeout": 30,
        "safariAllowPopups": true
      }
    }
  }
}
```
Create the `config.json` file anywhere in your project, and provide its relative path as a command-line argument: `--config <relative_path_of_config.json>`. For Windows, replace all instances of forward-slashes(/) each with 2 backslashes(\\).  

## CLI arguments
|CLI argument|Description|Expected value type|Example|
|----------|--------|----------|----|
|`--config /path/to/config.json`|**Mandatory** configuration file that defines the location of feature, step-definition and hook files|String| _--config ./config.json_ |
|`--browser [browsers]`|Specify the browser name for the session (can be 'chrome', 'firefox', 'safari', 'edge', 'android', 'ios')|String|_--browser chrome_ <br /> _--browser chrome firefox_ (for parallel execution)|
|`--headless`|Attempt to run a headless session (applicable for Chrome, Firefox)| Boolean (optional)|  
|`--tags <tags>`|Provide select cucumber tags to be executed|String|_e.g. --tags @sanity_ <br/> _e.g. --tags "@smoke @sanity"_ (for multiple tags)|
|`--addDesiredCaps <desiredCapObject>`|Add an entirely new desired capability object or add new attributes to an existing desired capability object|Stringified JSON|_e.g. --addDesiredCap "{\\"ios\\":{\\"secretKey\\":\\"shhd0ntte11any1\\"}}"_|
|`--rerun`|Re-execute all failing tests one more time|Boolean (optional)|
|`--cores <n>`|Number of threads in execution during parallel run|Number (default: 2)| _--cores 4_|
|`--retry <n>`|Cucumber-js native retry mechanism to run any failed test scenario(s)|Number| _--retry 3_|
|`--webhookUrl <url>`|Slack webhook url for Slack notifications|String|_--webhookUrl https://webhookurl.slack.com/blah/_|
|`--ciLinkTitle <title>`|Set title of the Slack message forwarded using Slack webhook URL|String|_--ciLinkTitle "Build 14"_|
|`--ciLinkUrl <url>`|Set hyperlink URL for the slack title|String|_--ciLinkUrl https://jenkins/url_|

**Important:** key-value pairs passed via CLI arguments will override the same key-value pairs provided in the configuration json file. For example, `--browser chrome` CLI argument will override any **browser** attribute setting in the configuration file.

#### Read more:
- [Driver class methods](./docs/driver.md)
- [Differentiating desktop browser and mobile browser tests](./docs/desktop_mobile.md)
- [Running tests on Android chrome browser](./docs/android_setup.md)
- [Running tests on iOS Safari browser](./docs/ios_setup.md)
- [Desired capabilities for Android & iOS using Appium](http://appium.io/docs/en/writing-running-appium/caps/)
- [Debugging tests in VSCode](./docs/vscode_debug.md)

#### Sample test project
Sample node project using eol-ft-runner: https://github.com/moneesh2011/test-eol-ft-runner
