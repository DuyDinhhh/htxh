# Frontend Unit Tests

This directory contains unit tests for the user-feedback-app frontend application.

## Test Structure

```
__tests__/
├── components/          # Component tests
│   ├── header.test.js
│   ├── sidebar.test.js
│   └── feedbackChart.test.js
├── context/            # Context tests
│   └── UserContext.test.js
├── services/           # Service tests
│   ├── authService.test.js
│   └── httpAxios.test.js
├── utils/              # Utility tests
│   └── validation.test.js
├── integration/        # Integration tests
│   └── authentication.test.js
└── App.test.js         # Main app test
```

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm test -- --watch
```

### Run tests with coverage

```bash
npm test -- --coverage
```

### Run specific test file

```bash
npm test -- header.test.js
```

### Run tests matching a pattern

```bash
npm test -- --testNamePattern="should render"
```

## Test Coverage

Current coverage targets:

- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

To view detailed coverage report:

```bash
npm test -- --coverage --watchAll=false
```

The coverage report will be generated in the `coverage/` directory.

## Writing Tests

### Component Tests

Test React components using React Testing Library:

```javascript
import { render, screen } from "@testing-library/react";
import MyComponent from "../MyComponent";

test("renders component", () => {
  render(<MyComponent />);
  expect(screen.getByText(/hello/i)).toBeInTheDocument();
});
```

### Service Tests

Test service functions with mocked dependencies:

```javascript
import { myService } from "../../services/myService";

jest.mock("axios");

test("calls API correctly", async () => {
  const result = await myService.getData();
  expect(result).toBeDefined();
});
```

### Integration Tests

Test multiple components working together:

```javascript
test("authentication flow", () => {
  // Login
  // Verify state
  // Navigate
  // Verify protected route access
});
```

## Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Test behavior, not implementation**: Focus on what the component does
3. **Mock external dependencies**: Keep tests isolated
4. **Use descriptive test names**: Make failures easy to understand
5. **Clean up after tests**: Use beforeEach/afterEach appropriately
6. **Avoid testing library internals**: Test the public API

## Mocking

### LocalStorage

```javascript
beforeEach(() => {
  localStorage.clear();
});
```

### React Router

```javascript
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));
```

### External Libraries

```javascript
jest.mock("react-toastify", () => ({
  toast: { success: jest.fn() },
}));
```

## Troubleshooting

### Tests failing with "Cannot find module"

- Check jest.config.js moduleNameMapper
- Verify import paths are correct

### Tests timing out

- Increase timeout: `jest.setTimeout(10000)`
- Check for unresolved promises

### Component not rendering

- Ensure proper test setup with providers
- Check for missing mocks

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
