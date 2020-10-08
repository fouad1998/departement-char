export interface departementState {
  name: string;
  answeredChat: number;
  unansweredChat: number;
  transferredChat: number;
  missedChat: number;
  departementSize: number;
  agents: {
    name: string;
    assigned: number;
    answered: number;
  }[];
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
  const departementSize = Math.floor(Math.random() * 0xff);

  return {
    name: new Array(7)
      .fill(0)
      .map(() => String.fromCharCode(Math.floor(65 + 25 * Math.random())))
      .join(''),
    answeredChat: Math.round(Math.random() * 0xfffffff),
    unansweredChat: Math.round(Math.random() * 0xfffffff),
    transferredChat: Math.round(Math.random() * 0xfffffff),
    missedChat: Math.round(Math.random() * 0xfffffff),
    departementSize,
    agents: new Array(departementSize).fill(agentInfo()),
  };
}

export function agentInfo() {
  return {
    name: new Array(7)
      .fill(0)
      .map(() => String.fromCharCode(Math.floor(65 + 25 * Math.random())))
      .join(''),
    answered: Math.floor(Math.random() * 0xffff),
    assigned: Math.floor(Math.random() * 0xffff),
  };
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

export const roundToHumainValue = (n: number): number => {
  let power = 1;
  while (n / Math.pow(10, power) > 1) ++power;
  let humain = Math.pow(10, power);
  while (humain / 2 > n) {
    humain /= 2;
  }
  return humain;
};
