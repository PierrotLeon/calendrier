/**
 * @file useModal.test.js
 * @description Unit tests for the useModal hook.
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModal } from '../../hooks/useModal';

describe('useModal', () => {
  it('starts closed with no data', () => {
    const { result } = renderHook(() => useModal());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('opens with data', () => {
    const { result } = renderHook(() => useModal());
    const payload = { id: '1', title: 'Test' };
    act(() => result.current.open(payload));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toEqual(payload);
  });

  it('opens without data', () => {
    const { result } = renderHook(() => useModal());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it('closes and clears data', () => {
    const { result } = renderHook(() => useModal());
    act(() => result.current.open({ id: '1' }));
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.data).toBeNull();
  });
});
