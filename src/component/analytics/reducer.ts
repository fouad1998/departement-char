import { agentInformationInterface } from '../../utils/func';

export interface departementStackedGraphReducerInterface {
  readonly transferredChat: string;
  readonly unansweredChat: string;
  readonly answeredChat: string;
  readonly missedChat: string;
  readonly departementName: string;
  readonly hover: boolean;
  readonly seeDepartementInfo: boolean;
  readonly departementID: string;
}

export interface agentSelection {
  readonly agentID: number;
  readonly displayAgentInfo: boolean;
  readonly transferredChat: string;
  readonly unansweredChat: string;
  readonly answeredChat: string;
  readonly missedChat: string;
  readonly departementName: string;
  readonly hover: boolean;
  readonly seeDepartementInfo: boolean;
  readonly departementID: string;
  readonly departementSize: number;

  readonly agents: agentInformationInterface[];
}

export const departementStackedGraphReducer = (
  state: departementStackedGraphReducerInterface,
  action: any
): departementStackedGraphReducerInterface => {
  switch (action.type) {
    case 'SET_ALL':
      return { ...state, ...action.value };
    case 'SET_SELECTED_DEPARTEMENT':
      return { ...state, ...action.value };
    default:
      return state;
  }
};

export const agentInfoReducer = (state: agentSelection, action: any): agentSelection => {
  switch (action.type) {
    case 'SET_ALL':
      return { ...state, ...action.action };
    default:
      return state;
  }
};
