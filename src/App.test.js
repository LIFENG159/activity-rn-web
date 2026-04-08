import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';

test('shows initial counters and tasks', () => {
  render(<App />);
  expect(screen.getByTestId('total-points').textContent).toBe('0');
  expect(screen.getByTestId('pending-points').textContent).toBe('0');
  expect(screen.getByTestId('spin-chances').textContent).toBe('0');
  expect(screen.getByText(/browse countdown task/i)).toBeInTheDocument();
  expect(screen.getByText(/order task/i)).toBeInTheDocument();
});

test('browse task awards pending points after countdown', () => {
  jest.useFakeTimers();
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /start browse/i }));
  act(() => {
    jest.advanceTimersByTime(5000);
  });
  expect(screen.getByTestId('pending-points').textContent).toBe('20');
  expect(screen.getByTestId('spin-chances').textContent).toBe('1');
  jest.useRealTimers();
});

test('order task awards pending points immediately', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /simulate order/i }));
  expect(screen.getByTestId('pending-points').textContent).toBe('30');
  expect(screen.getByTestId('spin-chances').textContent).toBe('1');
});

test('claim bubble moves pending points to total', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /simulate order/i }));
  fireEvent.click(screen.getByTestId('points-bubble'));
  expect(screen.getByTestId('pending-points').textContent).toBe('0');
  expect(screen.getByTestId('total-points').textContent).toBe('30');
});

test('spin consumes chance and awards pending points', () => {
  const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /simulate order/i }));
  fireEvent.click(screen.getByRole('button', { name: /spin wheel/i }));
  expect(screen.getByTestId('spin-chances').textContent).toBe('0');
  expect(screen.getByTestId('pending-points').textContent).toBe('40');
  randomSpy.mockRestore();
});
