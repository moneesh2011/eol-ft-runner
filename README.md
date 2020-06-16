# FUNCTIONAL TEST RUNNER (eol-ft-runner)
This framework uses Selenium-webdriver, Appium & CucumberJS to run UI tests written in BDD format.
This project is a work in progress, and only ready for desktop browser testing. As we build more features, mobile and other use cases will be available soon in v1.0

![Description poster](/docs/readme-poster.png)

#### How to install
``` shell
npm install eol-ft-runner --save-dev
```

#### Browser Support status
| Browser  | macOS/Linux | Windows |
| ------------- | ------------- | ------------- |
| Chrome  | ✅Yes  | ✅Yes  |
| Chrome Headless  | ✅Yes  | ✅Yes  |
| Firefox  | ✅Yes  | ✅Yes  |
| Firefox Headless  | ✅Yes  | ✅Yes  |
| Safari  | ✅Yes  | ⛔️N/A |
| Edge  | 🛠Not Yet  | 🛠Not Yet  |
| Android Chrome  | 🛠Not Yet  | 🛠Not Yet  |
| iOS Safari  | 🛠Not Yet  | ⛔️N/A |
| Internet Explorer  | ⛔️N/A  | 🛠Not Yet  |
| Opera  | ❌No  | ❌No  |
| Brave  | ❌No  | ❌No  |

### Note on browser drivers
Browser drivers are not bundled with this package. You will need to install the browser drivers (Chromedriver or Gecko Driver) - in your project using the below command:
``` shell
npm install chromedriver --save-dev

(or)

npm install geckodriver --save-dev
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

`browser` can be 'chrome', 'firefox', 'safari', 'ie', 'android', 'ios'. IE11 is currently unsupported.

`tags` are cucumber tags found on the top of a scenario inside a feature file. Tags are optional, and will execute all scenarios if not provided. To run multiple tags, use `--tags "@sanity @smoke @etc"`.

`cores` are the number of parallel threads of execution specified in the format "--cores 3" or "--cores 10". Cores are optional, and will run on 2 cores if not provided.

#### Sample config.json file
```json
{
    "configurations": {
        "browser": [ "chrome" ],
        "tags": "@sanity",
        "featurePath": [ "test/features/" ],
        "stepDefinitionPath": [ "test/step_definitions/" ],
        "supportFolderPath": [ "test/support" ],
        "reportFolderPath": "test/reports"
    }
}
```
Create the `config.json` file anywhere in your project, and provide its relative path as a command-line argument: `--config <relative_path_of_config.json>`. For Windows, replace all instances of backslashes(/) with double forward-slashes(\\\\).

#### Read more:
- [Driver class methods](./docs/driver.md)
- [Differentiating desktop browser and mobile browser tests](./docs/desktop_mobile.md)
- [Debugging tests in VSCode](./docs/vscode_debug.md)

#### Sample test project
Sample node project using eol-ft-runner: https://github.com/moneesh2011/test-eol-ft-runner
