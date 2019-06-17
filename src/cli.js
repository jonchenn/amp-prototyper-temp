const {amplify} = require('./easy-amplify-core');
const argv = require('minimist')(process.argv.slice(2));
const steps = require('./default-steps.js')

function printUsage() {
  let usage = `
Usage: ./easy-amplify --url=[URL]

Required:
  --url=URL\tURL to the page to convert.

Options:
  --steps=FILE\tPath to the custom steps JS file.
  --output=FILE\tPath to the output file.
  --verbose\tDisplay AMP validation errors.

Examples:
  # Amplify a page and generate results in /output folder.
  ./easy-amplify --url=http://127.0.0.1:8080

  # Amplify a page and generate results in /output/test folder.
  ./easy-amplify --url=http://127.0.0.1:8080 --output=test

  # Amplify a page with customized steps.
  ./easy-amplify --url=http://127.0.0.1:8080 --steps=custom/mysteps.js

  # Amplify a page and display AMP validation details.
  ./easy-amplify --url=http://127.0.0.1:8080 --verbose
  `;
  console.log(usage);
}

/**
 * Main CLI function.
 */
async function begin() {
  let url = argv['url'], output = argv['output'];
  let customSteps = argv['steps'] ?
      require(`./${argv['steps']}`) : null;
  let moreSteps = argv['moreSteps'] ?
      require(`./${argv['moreSteps']}`) : null;

  if (!url) {
    printUsage();
    return;
  }

  let allSteps = customSteps || steps;
  if (moreSteps) allSteps = allSteps.concat(moreSteps);

  if (customSteps) console.log(`Use custom steps ${argv['steps']}`);

  amplify(url, allSteps, argv);
}

module.exports = {
  begin,
};
