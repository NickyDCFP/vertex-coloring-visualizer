import { render, screen } from '@testing-library/react';
import App from './App';

test('renders graph svg', () => {
  render(<App />);
  const svg_element = screen.getByClassName('graph-display');
  expect(svg_element).toBeInTheDocument();
});