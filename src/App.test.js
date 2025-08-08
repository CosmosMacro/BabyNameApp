import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dashboard title', () => {
  render(<App />);
  const title = screen.getByText(/Tableau de Bord/i);
  expect(title).toBeInTheDocument();
});
