/** @vitest-environment jsdom */

import { beforeEach, describe, expect, it } from 'vitest';
import { register } from '../../src/services/roleAuthService';

describe('roleAuthService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores student profile details during registration', async () => {
    const success = await register(
      'student123',
      'secretpass',
      'student',
      'Alice Doe',
      'Female',
      'A',
      'Math'
    );

    expect(success).toBe(true);

    const users = JSON.parse(localStorage.getItem('attendanceUsers') || '[]');
    expect(users[0]).toMatchObject({
      username: 'student123',
      password: 'secretpass',
      role: 'student',
      fullName: 'Alice Doe',
      gender: 'Female',
      section: 'A',
      subject: 'Math'
    });
  });
});
