# Testing Angular Apps

Learn how to test Angular apps with Vitest and Angular Testing Library.

## Code

Angular project with test examples.

- Test a simple component: `code/src/app/counter/counter-test-01.test.ts`
- Test a template-driven form: `code/src/app/login-template-driven/login-template-driven-test-02.test.ts`
- Test a reactive form: `code/src/app/login-reactive/login-reactive-test-03.test.ts`
  - Since we don't test implementation details, testing template-driven forms and reactive forms is the same.
- Test HTTP requests: `code/src/app/login-submission/login-submission-test-04.test.ts`
- Mock browser APIs: `code/src/app/location/location-test-05.test.ts`
- Mock modules: `code/src/app/location/location-test-06.test.ts`
  - Not recommended, mock services instead.
- Mock observables: `code/src/app/location/location-test-07.test.ts`
- Mock Angular services: `code/src/app/location/location-test-08.test.ts`
- Test with a custom `render` method that includes commonly used providers. `code/src/app/some-button/some-button-test-09.test.ts`

## Slides

ReMDX project.

```commandline
npm i
npm run dev
```

## Acknowledgements

Material in this repo was adapted from [testing-react-apps](https://github.com/kentcdodds/testing-react-apps/tree/next)
