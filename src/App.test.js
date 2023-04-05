import { render, screen } from '@testing-library/react';
import App from './App';

test('renders graph svg', () => {
  const {container} = render(<App />);
  const svg_element = container.querySelector('graph-display');
  expect(svg_element).toBeInTheDocument();
});