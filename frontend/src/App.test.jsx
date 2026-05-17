import { render, screen } from '@testing-library/react';
import App from './App.jsx';

test('renders NewsNepal app', () => {
  render(<App />);
  const linkElement = screen.getByText(/NewsNepal/i);
  expect(linkElement).toBeInTheDocument();
});