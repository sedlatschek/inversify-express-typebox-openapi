# Contributing

## Setup

**1** - Clone your fork of the repository

```sh
git clone https://github.com/YOUR_USERNAME/inversify-express-typebox-openapi.git
```

**2** - Install npm dependencies

```sh
npm install
```

**3** - Run build process

```sh
npm run build
```

**4** - Run tests

```sh
npm run test
```

We use [vitest](https://vitest.dev/) for testing. To ensure support for decorators and reflection, we run it with [swc](https://swc.rs).

## Guidelines

- Please use `TDD` when fixing bugs. This means that you should write a unit test that fails because it reproduces the issue, then fix the issue and finally run the test to ensure that the issue has been resolved. This helps us prevent fixed bugs from happening again in the future

- Please create an issue before sending a PR if it is going to change the public interface of inversify-express-typebox-openapi or includes significant architecture changes

## Releasing a version

Use the [NPM version command](https://docs.npmjs.com/cli/v8/commands/npm-version) to create a new version. Push to GitHub with `--follow-tags` enabled. A CI script will take care of testing, building and publishing the release.
