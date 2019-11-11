# CI-Status-Report

> A GitHub App built with [Probot](https://github.com/probot/probot) that runs a build status report from Circle CI or Travis CI on Pull Requests

## Setup

```sh
# Install dependencies
npm install

# Run typescript
npm run build

# Run the bot
npm start
```

## Testing

```sh
# Run the test suite
npm test
```

## Project Approach
Seeing as I have built this project once before I began by reviewing my original code, various CI tool API's, and the updates to the Probot API. After identifying a few new options available to me and updates to the existing API's I was able to rewrite with a similar but more streamlined approach.

I took advantage of the new templates and started with the `basic-ts` typescript template. This allows for better type options and more explicit functions and methods as the data is passed through the Probot code.

I also read through the Probot documentation on the recommended solutions for testing using Jest and Nock and setup my test suite using these 2 testing libraries.

The test repo for this app is [CI-Status-Report-Test](https://github.com/LoganArnett/CI-Status-Report-Test/pull/2)

## Challenges
  * The intial challenge that I had with redoing this Probot app was to find the updates to the various API's and to make sure that I was taking advantage of them as best as possible.
  * The next challenge was with build the typescript version of the Probot app. There were certain cases where I was getting errors on the build task but the error messages were not specific. There were a few that lead me in the wrong direction but after stepping away and having fresh eyes I was able to spot my general code issues.
  * I also had issues with testing and mocking with fixture data from the build systems. I kept getting a few weird test errors but they again did not seem to point me in the right direction. After researching more projects with varying test setups for Probot apps I was able to find a setup that worked for me.
  * In revisiting this project I was able to find more consistency between the CI providers and was able to simplify my code to share betweeen Circle CI and Travis CI relatively quickly.

## Contributing

If you have suggestions for how ci-status-report could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2019 Logan Arnett <logan@loganarnett.com>
