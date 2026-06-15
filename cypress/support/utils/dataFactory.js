import { faker } from '@faker-js/faker';

const runId = (prefix = 'AUTO') =>
  `${prefix}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

export const dataFactory = {
  candidate(overrides = {}) {
    const first = faker.person.firstName();
    const last = faker.person.lastName();
    return {
      fullName: `${first} ${last}`,
      email: faker.internet.email({ firstName: first, lastName: last }).toLowerCase(),
      phone: faker.phone.number('##########'),
      title: faker.person.jobTitle(),
      location: `${faker.location.city()}, ${faker.location.country()}`,
      experienceYears: faker.number.int({ min: 0, max: 20 }),
      summary: faker.lorem.sentences(2),
      ...overrides,
    };
  },

  businessUnit(overrides = {}) {
    return {
      name: `${faker.company.name()} ${runId('BU')}`,
      description: faker.company.catchPhrase(),
      ...overrides,
    };
  },

  job(overrides = {}) {
    return {
      title: `${faker.person.jobTitle()} ${runId('JOB')}`,
      location: faker.location.city(),
      description: faker.lorem.paragraphs(2),
      ...overrides,
    };
  },

  template(overrides = {}) {
    return {
      name: `Template ${runId('TPL')}`,
      subject: `Subject: ${faker.lorem.sentence()}`,
      body: faker.lorem.paragraphs(2),
      description: faker.lorem.sentence(),
      ...overrides,
    };
  },

  folder(overrides = {}) {
    return {
      name: `Folder ${runId('FLD')}`,
      description: faker.lorem.sentence(),
      ...overrides,
    };
  },

  pipeline(overrides = {}) {
    return {
      name: `Pipeline ${runId('PIP')}`,
      description: faker.lorem.sentence(),
      stages: ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'],
      ...overrides,
    };
  },

  importBatch(overrides = {}) {
    return {
      name: `Import ${runId('IMP')}`,
      description: faker.lorem.sentence(),
      ...overrides,
    };
  },

  feedback(overrides = {}) {
    return {
      title: `${faker.hacker.phrase()} ${runId('FBK')}`,
      description: faker.lorem.sentences(2),
      type: 'Bug',
      ...overrides,
    };
  },

  runId,
};

export default dataFactory;
