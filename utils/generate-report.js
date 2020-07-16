var path = require('path');
var fs = require('fs');
var reporter = require('cucumber-html-reporter');
var cucumberJunit = require('cucumber-junit');

module.exports.generateReport = (reportsPath) => {
  var cucumberReportPath = path.resolve(reportsPath, 'cucumber-report.json');

  if (reportsPath && fs.existsSync(reportsPath)) {
    const reportName = (global.browsers[0].includes("rerun")) ? 'cucumber-report-rerun.html' : 'cucumber-report.html';

    //generate HTML report
    var reportOptions = {
      theme: 'bootstrap',
      jsonFile: cucumberReportPath,
      output: path.resolve(reportsPath, reportName),
      reportSuiteAsScenarios: true,
      launchReport: false,
      ignoreBadJsonFile: true
    };

    reporter.generate(reportOptions);

    // Generate XML report
    var reportRaw = fs.readFileSync(cucumberReportPath).toString().trim();
    var xmlReport = cucumberJunit(reportRaw);
    var junitOutputPath = path.resolve(reportsPath, 'junit-report.xml');

    fs.writeFileSync(junitOutputPath, xmlReport);
  }
};