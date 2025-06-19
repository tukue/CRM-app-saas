describe('Basic Test Suite', () => {
  test('should perform basic arithmetic', () => {
    expect(2 + 2).toBe(4);
  });

  test('should handle string operations', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
  });
});