import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clientInput, entryInput, reportInput } from '@careledger/shared';
import { hashPassword, verifyPassword } from '../src/lib/password.js';
test('stored password uses a salted hash and rejects another password', () => {
  const a = hashPassword('studio-password');
  const b = hashPassword('studio-password');
  assert.notEqual(a, b);
  assert.ok(verifyPassword('studio-password', a));
  assert.equal(verifyPassword('wrong', a), false);
});
test('rejects non-HTTPS sites', () =>
  assert.equal(
    clientInput.safeParse({
      name: 'Client',
      contact: '',
      siteName: 'Site',
      url: 'http://example.com',
    }).success,
    false,
  ));
test('requires evidence and a real activity date', () =>
  assert.equal(
    entryInput.safeParse({
      siteId: '1',
      title: 'Update',
      details: 'Done',
      evidence: '',
      kind: 'Update',
      happenedOn: '2026-02-30',
    }).success,
    false,
  ));
test('report period must be a valid month', () =>
  assert.equal(
    reportInput.safeParse({ siteId: '1', period: '2026-13', summary: 'Work', nextSteps: '' })
      .success,
    false,
  ));
