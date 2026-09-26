const { suite } = require('../helpers/recorder');
const { validateEmail } = require('../../src/utils/validators');

suite(
  {
    level: 'unit', id: 'UT-W01', name: 'validateEmail() - Email format checker', uc: 'UC-W01 Register / UC-W02 Login',
    objective: 'Verify the email format checker accepts only well-formed email addresses',
    pre: 'validators.js module loaded', steps: '1. Call validateEmail(input)  2. Compare returned boolean with expected',
    fn: validateEmail,
  },
  [
    { title: 'Valid email is accepted', args: ['ali@test.com'], expected: true, priority: 'High' },
    { title: 'Email without @ is rejected', args: ['alitest.com'], expected: false, priority: 'High' },
    { title: 'Email without top-level domain is rejected', args: ['ali@test'], expected: false },
    { title: 'Email containing a space is rejected', args: ['ali @test.com'], expected: false },
    { title: 'Non-string input (number) is rejected', args: [12345], expected: false, priority: 'Low' },
    { title: 'Leading/trailing spaces are trimmed', args: ['  ALI@Test.COM  '], expected: true },
    { title: 'Domain with consecutive dots is rejected', args: ['ali@test..com'], expected: false },
  ]
);
