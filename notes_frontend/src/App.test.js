import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header and fab', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /simple notes/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /create note/i })).toBeInTheDocument();
});

test('renders notes list panel', () => {
  render(<App />);
  expect(screen.getByRole('complementary', { name: /notes list/i })).toBeInTheDocument();
});
