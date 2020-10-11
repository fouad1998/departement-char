export interface departementState {
  name: string;
  answeredChat: number;
  unansweredChat: number;
  transferredChat: number;
  missedChat: number;
  departementSize: number;
  agents: agentInformationInterface[];
}

export interface agentInformationInterface {
  readonly name: string;
  readonly assigned: number;
  readonly answered: number;
  readonly answeredChat: number;
  readonly unansweredChat: number;
  readonly transferredChat: number;
  readonly missedChat: number;
  readonly wroteMessages: number;
  readonly feedback: number;
  readonly averageReply: number;
  readonly averageWorkingTime: number;
  readonly videoCalls: number;
  readonly audioCalls: number;
  readonly rejectedVideoCalls: number;
  readonly rejectedAudioCalls: number;
  readonly workingTime: Array<{ startTime: number; endTime: number }>;
}

export function getRandomDataDepartement(quantity: number): departementState[] {
  const departementsState = [];
  for (let n = 0; n < quantity; ++n) {
    const departementState = departementInfo();

    departementsState.push(departementState);
  }

  return departementsState;
}

export function departementInfo(): departementState {
  const departementSize = Math.floor(Math.random() * 0x1f);

  return {
    name: new Array(7)
      .fill(0)
      .map(() => String.fromCharCode(Math.floor(65 + 25 * Math.random())))
      .join(''),
    answeredChat: Math.round(Math.random() * 0xffff),
    unansweredChat: Math.round(Math.random() * 0xffff),
    transferredChat: Math.round(Math.random() * 0xffff),
    missedChat: Math.round(Math.random() * 0xffff),
    departementSize,
    agents: new Array(departementSize).fill(agentInfo()).map(() => agentInfo()),
  };
}

export function agentInfo(): agentInformationInterface {
  return {
    name: new Array(7)
      .fill(0)
      .map(() => String.fromCharCode(Math.floor(65 + 25 * Math.random())))
      .join(''),
    answered: Math.floor(Math.random() * 0xffff),
    assigned: Math.floor(Math.random() * 0xffff),
    answeredChat: Math.round(Math.random() * 0xffff),
    unansweredChat: Math.round(Math.random() * 0xffff),
    transferredChat: Math.round(Math.random() * 0xffff),
    missedChat: Math.round(Math.random() * 0xffff),
    audioCalls: Math.round(Math.random() * 0xffff),
    averageReply: Math.round(Math.random() * 0xffff),
    averageWorkingTime: Math.round(Math.random() * 0xffff),
    feedback: Math.round(Math.random() * 0x5),
    rejectedAudioCalls: Math.round(Math.random() * 0xffff),
    rejectedVideoCalls: Math.round(Math.random() * 0xffff),
    videoCalls: Math.round(Math.random() * 0xffff),
    workingTime: fillRandomAvaibility(),
    wroteMessages: Math.round(Math.random() * 0xffff),
  };
}

export function fillRandomAvaibility(): Array<{ startTime: number; endTime: number }> {
  const records = [];
  let start = 0;
  while (start < 23 * 3600) {
    const range = { startTime: start, endTime: getNextTimeStamp(start) };
    records.push(range);
    if (start < 23 * 3600) {
      start = getNextTimeStamp(range.endTime);
    }
  }
  return records;
}

function getNextTimeStamp(timestampStart: number): number {
  const seconds = 3600 * 5;
  const timestamp = Math.floor(timestampStart + Math.random() * seconds);
  if (timestamp > 24 * 3600) {
    return getNextTimeStamp(timestampStart);
  }
  return timestamp;
}

export const selectMax = (departState: departementState, index: number, colors: any) => {
  const sorted = Object.keys(departState)
    //@ts-ignore
    .map(v => (typeof departState[v] === 'number' ? { key: v, value: departState[v] } : undefined))
    .filter(v => v !== undefined)
    .sort((a, b) => (a!.value > b!.value ? -1 : a!.value < b!.value ? 1 : 0));

  if (sorted.length < index) throw Error('Out of range');

  //@ts-ignore
  return { value: sorted[index].value, color: colors[sorted[index].key], key: sorted[index].key };
};

export const selectElement = (departState: departementState | agentInformationInterface, index: number, colors: any) => {
  const sorted = ['answeredChat', 'unansweredChat', 'transferredChat', 'missedChat']
    //@ts-ignore
    .map(v => (typeof departState[v] === 'number' ? { key: v, value: departState[v] } : undefined))
    .filter(v => v !== undefined);

  if (sorted.length < index) throw Error('Out of range');

  //@ts-ignore
  return { value: sorted[index].value, color: colors[sorted[index].key], key: sorted[index].key };
};

export const selectElementAccumulate = (departState: departementState | agentInformationInterface, index: number, colors: any) => {
  let sum = 0;
  let obj = null;
  for (let n = 0; n <= index; n++) {
    obj = selectElement(departState, n, colors);
    sum += obj.value;
  }
  return { value: sum, color: obj!.color, key: obj!.key };
};

export const roundToHumainValue = (n: number): number => {
  let power = 1;
  while (n / Math.pow(10, power) > 1) ++power;
  const coefficient = Math.pow(10, power) / 10;
  let humain = coefficient;
  while (humain < n) humain += coefficient;
  return humain;
};

export const refactorNumber = (n: number) => (n < 10 ? '0' + n : n);
export const timeHumainForm = (seconds: number) => {
  const hours = (seconds - (seconds % 3600)) / 3600;
  const minutes = (seconds - hours * 3600 - ((seconds - hours * 3600) % 60)) / 60;
  return `${refactorNumber(hours)}:${refactorNumber(minutes)}`;
};
